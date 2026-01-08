import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
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
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
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
    } catch (error) {
      console.error('Error fetching profile:', error);
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
            // Make subdomains live immediately; custom domains still require DNS verification.
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
    // Set up auth state listener
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

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            username: username,
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
        // Update profile with username if provided
        if (data.user && username) {
          await supabase
            .from('profiles')
            .update({ username: username })
            .eq('user_id', data.user.id);
        }
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

  const signIn = async (email: string, password: string) => {
    try {
      // First try to sign in with the identifier as email
      let loginEmail = email;
      
      // Check if identifier might be a username (no @ symbol)
      if (!email.includes('@')) {
        // Look up the email by username
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', email)
          .single();
        
        if (profileData?.email) {
          loginEmail = profileData.email;
        }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
      });
      
      if (error) {
        // Check if error is about email not confirmed
        if (error.message?.toLowerCase().includes('email not confirmed') || 
            error.message?.toLowerCase().includes('email_not_confirmed')) {
          return { error, emailNotVerified: true, email: loginEmail };
        }
        toast({
          variant: "destructive",
          title: "Sign In Error",
          description: error.message
        });
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
      {children}
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