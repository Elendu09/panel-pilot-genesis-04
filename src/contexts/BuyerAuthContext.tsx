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
  panel_id: string;
  created_at: string;
}

interface BuyerAuthContextType {
  buyer: BuyerUser | null;
  loading: boolean;
  signIn: (email: string, password: string, panelId: string) => Promise<{ error: any }>;
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
      const { data, error } = await supabase
        .from('client_users')
        .select('*')
        .eq('id', buyerId)
        .eq('panel_id', panelId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        localStorage.removeItem(BUYER_STORAGE_KEY);
        setBuyer(null);
      } else {
        setBuyer(data as BuyerUser);
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

  const signIn = async (email: string, password: string, panelId: string) => {
    try {
      // Input validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedEmail = email.trim().toLowerCase();
      
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        return { error: { message: 'Invalid email format' } };
      }
      if (trimmedEmail.length > 254) {
        return { error: { message: 'Email address is too long' } };
      }
      if (!password || password.length < 1) {
        return { error: { message: 'Password is required' } };
      }
      if (password.length > 128) {
        return { error: { message: 'Password is too long' } };
      }

      // Simple password check - in production you'd use proper hashing
      const { data, error } = await supabase
        .from('client_users')
        .select('*')
        .eq('email', trimmedEmail)
        .eq('panel_id', panelId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { error: { message: 'No account found with this email' } };
      }

      // Check if account is active
      if (!data.is_active) {
        return { error: { message: 'Your account has been suspended. Please contact support.' } };
      }

      // Check password (using password_temp for demo, would use password_hash in production)
      if (data.password_temp !== password && data.password_hash !== password) {
        return { error: { message: 'Incorrect password. Please try again.' } };
      }

      // Update last login
      await supabase
        .from('client_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.id);

      // Store session
      localStorage.setItem(BUYER_STORAGE_KEY, JSON.stringify({ buyerId: data.id, panelId }));
      setBuyer(data as BuyerUser);

      toast({ title: 'Welcome back!', description: `Logged in as ${data.email}` });
      return { error: null };
    } catch (err: any) {
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
          password_temp: password, // In production, use proper hashing
          panel_id: panelId,
          is_active: true,
          balance: 0,
          total_spent: 0,
        })
        .select()
        .single();

      if (error) {
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