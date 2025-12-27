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
  is_vip: boolean;
  vip_since: string | null;
  preferred_language: string | null;
  timezone: string | null;
  low_balance_threshold: number | null;
}

interface BuyerAuthContextType {
  buyer: BuyerUser | null;
  loading: boolean;
  panelId: string;
  signIn: (identifier: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, username?: string) => Promise<{ error: any }>;
  signOut: () => void;
  refreshBuyer: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<boolean>;
}

const BuyerAuthContext = createContext<BuyerAuthContextType | undefined>(undefined);

const BUYER_STORAGE_KEY = 'buyer_session';

export function BuyerAuthProvider({ children, panelId }: { children: ReactNode; panelId: string }) {
  const [buyer, setBuyer] = useState<BuyerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      const stored = localStorage.getItem(BUYER_STORAGE_KEY);
      if (stored) {
        try {
          const session = JSON.parse(stored);
          if (session.panelId === panelId && session.buyerId) {
            await fetchBuyer(session.buyerId);
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
    };

    initializeAuth();
  }, [panelId]);

  const fetchBuyer = async (buyerId: string) => {
    try {
      console.log('Fetching buyer data for:', buyerId);
      
      // Use edge function to fetch buyer data (bypasses RLS)
      const { data, error } = await supabase.functions.invoke('buyer-auth', {
        body: { 
          panelId, 
          action: 'fetch',
          buyerId 
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        localStorage.removeItem(BUYER_STORAGE_KEY);
        setBuyer(null);
        setLoading(false);
        return;
      }

      if (data?.error) {
        console.log('Fetch returned error:', data.error);
        // If banned or suspended, clear session
        if (data.error.includes('banned') || data.error.includes('suspended')) {
          toast({ 
            title: 'Account Restricted', 
            description: data.error,
            variant: 'destructive'
          });
        }
        localStorage.removeItem(BUYER_STORAGE_KEY);
        setBuyer(null);
      } else if (data?.user) {
        console.log('Buyer fetched successfully:', data.user.id);
        setBuyer(data.user as BuyerUser);
      } else {
        localStorage.removeItem(BUYER_STORAGE_KEY);
        setBuyer(null);
      }
    } catch (err) {
      console.error('Fetch buyer error:', err);
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

  const signIn = async (identifier: string, password: string) => {
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

      console.log('Signing in with identifier:', trimmedIdentifier);

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
        return { error: { message: 'Authentication service unavailable. Please try again.' } };
      }

      if (data?.error) {
        console.log('Login error:', data.error);
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

  const signUp = async (email: string, password: string, fullName: string, username?: string) => {
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

      console.log('Signing up with email:', trimmedEmail);

      // Call edge function for signup (bypasses RLS)
      const { data, error } = await supabase.functions.invoke('buyer-auth', {
        body: { 
          panelId, 
          email: trimmedEmail, 
          password,
          fullName: trimmedName,
          username: username?.trim(),
          action: 'signup'
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        return { error: { message: 'Registration service unavailable. Please try again.' } };
      }

      if (data?.error) {
        console.log('Signup error:', data.error);
        return { error: { message: data.error } };
      }

      if (!data?.user) {
        return { error: { message: 'Registration failed. Please try again.' } };
      }

      // Store session
      localStorage.setItem(BUYER_STORAGE_KEY, JSON.stringify({ buyerId: data.user.id, panelId }));
      setBuyer(data.user as BuyerUser);

      toast({ title: 'Account created!', description: 'Welcome to the panel' });
      return { error: null };
    } catch (err: any) {
      console.error('Sign up error:', err);
      return { error: { message: err.message || 'Registration failed' } };
    }
  };

  const signOut = () => {
    localStorage.removeItem(BUYER_STORAGE_KEY);
    setBuyer(null);
    toast({ title: 'Signed out successfully' });
  };

  // Alias for signIn that returns boolean for simpler usage
  const login = async (identifier: string, password: string): Promise<boolean> => {
    const result = await signIn(identifier, password);
    return !result.error;
  };

  return (
    <BuyerAuthContext.Provider value={{ buyer, loading, panelId, signIn, signUp, signOut, refreshBuyer, login }}>
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
