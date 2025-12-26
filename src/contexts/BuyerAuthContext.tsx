import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BuyerUser {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  balance: number;
  total_spent: number;
  referral_code: string | null;
  referral_count: number;
  custom_discount: number;
  is_active: boolean;
  is_banned: boolean;
  banned_at: string | null;
  ban_reason: string | null;
  panel_id: string;
  created_at: string;
}

interface BuyerAuthContextType {
  buyer: BuyerUser | null;
  loading: boolean;
  signIn: (identifier: string, password: string, panelId: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, panelId: string) => Promise<{ error: any }>;
  signOut: () => void;
  refreshBuyer: () => Promise<void>;
}

const BuyerAuthContext = createContext<BuyerAuthContextType | undefined>(undefined);

const BUYER_STORAGE_KEY = 'buyer_session';

export function BuyerAuthProvider({ children, panelId }: { children: ReactNode; panelId: string }) {
  const [buyer, setBuyer] = useState<BuyerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem(BUYER_STORAGE_KEY);
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session.panelId === panelId) {
          fetchBuyer(session.buyerId);
        } else {
          localStorage.removeItem(BUYER_STORAGE_KEY);
          setLoading(false);
        }
      } catch {
        localStorage.removeItem(BUYER_STORAGE_KEY);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [panelId]);

  const fetchBuyer = async (buyerId: string) => {
    try {
      // Use edge function to fetch buyer data (bypasses RLS)
      const { data, error } = await supabase.functions.invoke('buyer-auth', {
        body: { 
          panelId, 
          action: 'fetch',
          buyerId 
        }
      });

      if (error || !data?.user) {
        localStorage.removeItem(BUYER_STORAGE_KEY);
        setBuyer(null);
      } else {
        setBuyer(data.user as BuyerUser);
      }
    } catch {
      localStorage.removeItem(BUYER_STORAGE_KEY);
      setBuyer(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshBuyer = async () => {
    if (buyer) {
      await fetchBuyer(buyer.id);
    }
  };

  const signIn = async (identifier: string, password: string, panelId: string) => {
    try {
      // Input validation
      const trimmedIdentifier = identifier.trim();
      
      if (!trimmedIdentifier || trimmedIdentifier.length < 1) {
        return { error: { message: 'Email or username is required' } };
      }
      if (trimmedIdentifier.length > 254) {
        return { error: { message: 'Email or username is too long' } };
      }
      if (!password || password.length < 1) {
        return { error: { message: 'Password is required' } };
      }
      if (password.length > 128) {
        return { error: { message: 'Password is too long' } };
      }

      // Call edge function for authentication (bypasses RLS)
      const { data, error } = await supabase.functions.invoke('buyer-auth', {
        body: { 
          panelId, 
          identifier: trimmedIdentifier, 
          password,
          action: 'login'
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        return { error: { message: 'Authentication service unavailable' } };
      }

      if (data?.error) {
        return { error: { message: data.error, reason: data.reason } };
      }

      if (!data?.user) {
        return { error: { message: 'Login failed. Please try again.' } };
      }

      // Store session
      localStorage.setItem(BUYER_STORAGE_KEY, JSON.stringify({ buyerId: data.user.id, panelId }));
      setBuyer(data.user as BuyerUser);

      toast({ title: 'Welcome back!', description: `Logged in as ${data.user.email}` });
      return { error: null };
    } catch (err: any) {
      console.error('Sign in error:', err);
      return { error: { message: err.message || 'Login failed' } };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, panelId: string) => {
    try {
      // Input validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = fullName.trim();
      
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        return { error: { message: 'Invalid email format' } };
      }
      if (trimmedEmail.length > 254) {
        return { error: { message: 'Email address is too long' } };
      }
      if (!password || password.length < 6) {
        return { error: { message: 'Password must be at least 6 characters' } };
      }
      if (password.length > 128) {
        return { error: { message: 'Password is too long' } };
      }
      if (!trimmedName || trimmedName.length < 2) {
        return { error: { message: 'Full name must be at least 2 characters' } };
      }
      if (trimmedName.length > 100) {
        return { error: { message: 'Full name is too long' } };
      }

      // For signup, we need to use service role - call via edge function would be needed
      // For now, use direct insert which works if RLS allows panel owners
      // In production, create a signup edge function
      
      // Check if email already exists for this panel
      const { data: existing } = await supabase
        .from('client_users')
        .select('id')
        .eq('email', trimmedEmail)
        .eq('panel_id', panelId)
        .single();

      if (existing) {
        return { error: { message: 'Email already registered' } };
      }

      // Create new buyer account
      const { data, error } = await supabase
        .from('client_users')
        .insert({
          email: trimmedEmail,
          full_name: trimmedName,
          password_temp: password,
          panel_id: panelId,
          is_active: true,
          is_banned: false,
          balance: 0,
          total_spent: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Signup error:', error);
        return { error: { message: error.message } };
      }

      // Store session
      localStorage.setItem(BUYER_STORAGE_KEY, JSON.stringify({ buyerId: data.id, panelId }));
      setBuyer(data as BuyerUser);

      toast({ title: 'Account created!', description: 'Welcome to the panel' });
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Registration failed' } };
    }
  };

  const signOut = () => {
    localStorage.removeItem(BUYER_STORAGE_KEY);
    setBuyer(null);
    toast({ title: 'Signed out successfully' });
  };

  return (
    <BuyerAuthContext.Provider value={{ buyer, loading, signIn, signUp, signOut, refreshBuyer }}>
      {children}
    </BuyerAuthContext.Provider>
  );
}

export function useBuyerAuth() {
  const context = useContext(BuyerAuthContext);
  if (context === undefined) {
    throw new Error('useBuyerAuth must be used within a BuyerAuthProvider');
  }
  return context;
}
