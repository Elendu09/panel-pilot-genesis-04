import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TwoFactorChallenge } from '@/components/auth/TwoFactorChallenge';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; emailNotVerified?: boolean; email?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsMfaChallenge, setNeedsMfaChallenge] = useState(false);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      // For OAuth users: ensure role is set and username is populated
      if (data && (!data.role || !data.username)) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const metadata = authUser?.user_metadata || {};
        const updates: Record<string, any> = {};
        
        if (!data.role) {
          updates.role = metadata.role || 'panel_owner';
        }
        if (!data.username) {
          // Generate username from email prefix or full name
          const emailPrefix = (data.email || '').split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20);
          const namePrefix = (metadata.full_name || '').replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20);
          updates.username = namePrefix || emailPrefix || `user_${Date.now().toString(36)}`;
        }
        if (!data.full_name && metadata.full_name) {
          updates.full_name = metadata.full_name;
        }
        if (!data.avatar_url && metadata.avatar_url) {
          updates.avatar_url = metadata.avatar_url;
        }
        
        if (Object.keys(updates).length > 0) {
          const { data: updated } = await supabase
            .from('profiles')
            .update(updates)
            .eq('user_id', userId)
            .select('*')
            .single();
          
          if (updated) {
            setProfile(updated);
            return updated;
          }
        }
      }
      
      setProfile(data);

      // Check for pending panel creation
      const pendingPanel = localStorage.getItem('pendingPanelCreation');
      if (pendingPanel && data.role === 'panel_owner') {
        const panelData = JSON.parse(pendingPanel);
        if (panelData.userId === userId) {
          await createPanel(panelData.panelName, data.id);
          localStorage.removeItem('pendingPanelCreation');
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const createPanel = async (panelName: string, ownerId: string) => {
    try {
      const { error } = await supabase
        .from('panels')
        .insert([
          {
            name: panelName,
            owner_id: ownerId,
            status: 'active' as const,
            is_approved: true,
            theme_type: 'dark_gradient' as const,
            subdomain: panelName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) || 'panel',
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Panel Created",
        description: "Your subdomain is live now. Configure services to start selling."
      });
    } catch (error) {
      console.error('Error creating panel:', error);
      toast({
        variant: "destructive",
        title: "Panel Creation Error",
        description: "Failed to create your panel. Please contact support."
      });
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        // Check MFA status on session restore (prevents bypass via reload)
        try {
          const { data: mfaStatus } = await supabase.functions.invoke('mfa-setup', {
            body: { action: 'status' }
          });
          if (mfaStatus?.enabled) {
            setNeedsMfaChallenge(true);
          }
        } catch (e) {
          console.error('MFA status check on restore failed:', e);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username?: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
          data: {
            username: username,
            full_name: fullName || '',
            role: 'panel_owner'
          }
        }
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign Up Error",
          description: error.message
        });
      } else {
        toast({
          title: "Success",
          description: "Please check your email to confirm your account."
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Error",
        description: error.message
      });
      return { error };
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      let loginEmail = identifier.trim();
      
      if (!identifier.includes('@')) {
        const { data: email, error: lookupError } = await supabase
          .rpc('lookup_email_by_username', { p_username: identifier.trim() });
        
        if (lookupError || !email) {
          toast({
            variant: "destructive",
            title: "Sign In Error",
            description: "Username not found. Please check and try again."
          });
          return { error: { message: 'Username not found' } };
        }
        
        loginEmail = email;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
      });
      
      if (error) {
        if (error.message?.toLowerCase().includes('email not confirmed') || 
            error.message?.toLowerCase().includes('email_not_confirmed')) {
          return { error, emailNotVerified: true, email: loginEmail };
        }
        
        let friendlyMessage = error.message;
        const lowerMsg = error.message?.toLowerCase() || '';
        
        if (lowerMsg.includes('invalid login credentials') || lowerMsg.includes('invalid_credentials')) {
          friendlyMessage = 'Invalid email/username or password. Please check and try again.';
        } else if (lowerMsg.includes('too many requests') || lowerMsg.includes('rate limit')) {
          friendlyMessage = 'Too many login attempts. Please wait a moment and try again.';
        } else if (lowerMsg.includes('user not found')) {
          friendlyMessage = 'No account found with this email. Please sign up first.';
        } else if (lowerMsg.includes('network') || lowerMsg.includes('fetch')) {
          friendlyMessage = 'Network error. Please check your connection and try again.';
        }
        
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: friendlyMessage
        });
        return { error };
      }

      // Check MFA status after successful login
      if (data?.user) {
        try {
          const { data: mfaStatus } = await supabase.functions.invoke('mfa-setup', {
            body: { action: 'status' }
          });
          if (mfaStatus?.enabled) {
            setNeedsMfaChallenge(true);
          }
        } catch (e) {
          console.error('MFA status check failed:', e);
        }
      }
      
      return { error };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign In Error",
        description: error.message
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setNeedsMfaChallenge(false);
      toast({
        title: "Signed out successfully"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message
      });
    }
  };

  const handleMfaVerified = () => {
    setNeedsMfaChallenge(false);
  };

  const handleMfaCancelled = () => {
    setNeedsMfaChallenge(false);
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {needsMfaChallenge ? (
        <TwoFactorChallenge 
          open={true} 
          onVerified={handleMfaVerified}
          onCancel={handleMfaCancelled}
        />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
