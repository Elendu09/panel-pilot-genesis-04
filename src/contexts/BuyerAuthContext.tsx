import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LanguageContext, Language } from '@/contexts/LanguageContext';
import { BuyerMfaChallenge } from '@/components/buyer/BuyerMfaChallenge';

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
  oauth_provider: string | null;
  oauth_provider_id: string | null;
  avatar_url: string | null;
  api_key: string | null;
}

interface BuyerSession {
  buyerId: string;
  panelId: string;
  token: string;
  expiresAt: number; // Unix timestamp
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
  getToken: () => string | null;
}

export const BuyerAuthContext = createContext<BuyerAuthContextType | undefined>(undefined);

const BUYER_STORAGE_KEY = 'buyer_session';

// Check if session is expired (with 5 minute buffer)
function isSessionExpired(session: BuyerSession): boolean {
  const bufferMs = 5 * 60 * 1000; // 5 minutes
  return Date.now() > (session.expiresAt * 1000) - bufferMs;
}

export function BuyerAuthProvider({ children, panelId }: { children: ReactNode; panelId: string }) {
  const [buyer, setBuyer] = useState<BuyerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<BuyerSession | null>(null);
  const { toast } = useToast();
  const languageContext = useContext(LanguageContext);

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      const stored = localStorage.getItem(BUYER_STORAGE_KEY);
      if (stored) {
        try {
          const storedSession: BuyerSession = JSON.parse(stored);
          
          // Validate session
          if (storedSession.panelId !== panelId) {
            console.log('Session panel mismatch, clearing');
            localStorage.removeItem(BUYER_STORAGE_KEY);
            setLoading(false);
            return;
          }

          // Check if token is expired
          if (isSessionExpired(storedSession)) {
            console.log('Session expired, clearing');
            localStorage.removeItem(BUYER_STORAGE_KEY);
            setLoading(false);
            return;
          }

          setSession(storedSession);
          await fetchBuyer(storedSession.buyerId, storedSession.token);
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

  // Periodic session validation
  useEffect(() => {
    if (!session) return;

    const checkSession = () => {
      if (isSessionExpired(session)) {
        console.log('Session expired during use');
        signOut();
        toast({
          title: 'Session Expired',
          description: 'Please sign in again to continue.',
          variant: 'destructive'
        });
      }
    };

    // Check every minute
    const interval = setInterval(checkSession, 60 * 1000);
    return () => clearInterval(interval);
  }, [session]);

  const fetchBuyer = async (buyerId: string, token?: string) => {
    try {
      console.log('Fetching buyer data for:', buyerId);
      
      // Use edge function to fetch buyer data (bypasses RLS)
      const { data, error } = await supabase.functions.invoke('buyer-auth', {
        body: { 
          panelId, 
          action: 'fetch',
          buyerId,
          token: token || session?.token
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        clearSession();
        return;
      }

      if (data?.error) {
        console.log('Fetch returned error:', data.error);
        
        // Handle token expiration
        if (data.tokenExpired || data.tokenInvalid) {
          clearSession();
          toast({
            title: 'Session Expired',
            description: 'Please sign in again.',
            variant: 'destructive'
          });
          return;
        }
        
        // If banned or suspended, clear session
        if (data.error.includes('banned') || data.error.includes('suspended')) {
          toast({ 
            title: 'Account Restricted', 
            description: data.error,
            variant: 'destructive'
          });
        }
        clearSession();
      } else if (data?.user) {
        console.log('Buyer fetched successfully:', data.user.id);
        const fetchedUser = data.user as BuyerUser;
        setBuyer(fetchedUser);
        if (fetchedUser.preferred_language && ['en','es','pt','ar','tr','ru'].includes(fetchedUser.preferred_language)) {
          languageContext?.setLanguage(fetchedUser.preferred_language as Language);
        }
      } else {
        clearSession();
      }
    } catch (err) {
      console.error('Fetch buyer error:', err);
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  const clearSession = () => {
    localStorage.removeItem(BUYER_STORAGE_KEY);
    setBuyer(null);
    setSession(null);
  };

  const refreshBuyer = async () => {
    if (buyer && session) {
      await fetchBuyer(buyer.id, session.token);
    }
  };

  const getToken = (): string | null => {
    return session?.token || null;
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

      // Handle rate limiting
      if (data?.rateLimited) {
        return { error: { message: data.error, rateLimited: true, retryAfter: data.retryAfter } };
      }

      if (data?.error) {
        console.log('Login error:', data.error);
        return { error: { message: data.error, reason: data.reason } };
      }

      if (!data?.user || !data?.token) {
        return { error: { message: 'Login failed. Please try again.' } };
      }

      // Calculate expiry time
      const expiresAt = Math.floor(Date.now() / 1000) + (data.expiresIn || 3600);

      // Store session with token
      const newSession: BuyerSession = {
        buyerId: data.user.id,
        panelId,
        token: data.token,
        expiresAt
      };
      
      localStorage.setItem(BUYER_STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
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
      if (!password || password.length < 8) {
        return { error: { message: 'Password must be at least 8 characters' } };
      }
      if (password.length > 128) {
        return { error: { message: 'Password is too long' } };
      }
      
      // Password strength validation
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        return { error: { message: 'Password must contain uppercase, lowercase, and numbers' } };
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

      if (!data?.user || !data?.token) {
        return { error: { message: 'Registration failed. Please try again.' } };
      }

      // Calculate expiry time
      const expiresAt = Math.floor(Date.now() / 1000) + (data.expiresIn || 3600);

      // Store session with token
      const newSession: BuyerSession = {
        buyerId: data.user.id,
        panelId,
        token: data.token,
        expiresAt
      };
      
      localStorage.setItem(BUYER_STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
      setBuyer(data.user as BuyerUser);

      toast({ title: 'Account created!', description: 'Welcome to the panel' });
      return { error: null };
    } catch (err: any) {
      console.error('Sign up error:', err);
      return { error: { message: err.message || 'Registration failed' } };
    }
  };

  const signOut = () => {
    clearSession();
    toast({ title: 'Signed out successfully' });
  };

  // Alias for signIn that returns boolean for simpler usage
  const login = async (identifier: string, password: string): Promise<boolean> => {
    const result = await signIn(identifier, password);
    return !result.error;
  };

  return (
    <BuyerAuthContext.Provider value={{ buyer, loading, panelId, signIn, signUp, signOut, refreshBuyer, login, getToken }}>
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
