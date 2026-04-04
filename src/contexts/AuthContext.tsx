import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TwoFactorChallenge } from "@/components/auth/TwoFactorChallenge";

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

// Storage keys for MFA state persistence
const MFA_REQUIRED_KEY = "mfa_required";
const MFA_VERIFIED_KEY = "mfa_verified_timestamp";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsMfaChallenge, setNeedsMfaChallenge] = useState(false);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
      if (error) throw error;
      // ... rest of your fetchProfile logic ...
      setProfile(data);
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const createPanel = async (panelName: string, ownerId: string) => {
    // ... your existing createPanel logic ...
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Check MFA status on initial load (page refresh)
  const checkMfaStatusOnLoad = async (currentUser: User) => {
    try {
      // Check if we already verified MFA in this browser session
      const mfaVerifiedAt = sessionStorage.getItem(MFA_VERIFIED_KEY);
      const mfaRequired = sessionStorage.getItem(MFA_REQUIRED_KEY);

      // If already verified in this session, don't ask again
      if (mfaVerifiedAt) {
        setNeedsMfaChallenge(false);
        return;
      }

      // Check if MFA is enabled for this user
      const { data: mfaStatus } = await supabase.functions.invoke("mfa-setup", {
        body: { action: "status" },
      });

      if (mfaStatus?.enabled) {
        // MFA is enabled, but we haven't verified it yet in this session
        sessionStorage.setItem(MFA_REQUIRED_KEY, "true");
        setNeedsMfaChallenge(true);
      } else {
        // No MFA required
        sessionStorage.removeItem(MFA_REQUIRED_KEY);
        setNeedsMfaChallenge(false);
      }
    } catch (e) {
      console.error("MFA status check failed:", e);
      // Fail safe: if we can't check, assume no MFA required to prevent lockout
      setNeedsMfaChallenge(false);
    }
  };

  useEffect(() => {
    // Handle auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        // Check if MFA was previously required but not verified
        const mfaRequired = sessionStorage.getItem(MFA_REQUIRED_KEY);
        const mfaVerified = sessionStorage.getItem(MFA_VERIFIED_KEY);

        if (mfaRequired && !mfaVerified) {
          // User refreshed page but hasn't completed MFA yet
          setNeedsMfaChallenge(true);
        } else if (!mfaVerified) {
          // First time checking this session, verify MFA status
          await checkMfaStatusOnLoad(currentSession.user);
        }

        setTimeout(() => {
          fetchProfile(currentSession.user.id);
        }, 0);
      } else {
        setProfile(null);
        if (event === "SIGNED_OUT") {
          // Clear MFA state on logout
          sessionStorage.removeItem(MFA_REQUIRED_KEY);
          sessionStorage.removeItem(MFA_VERIFIED_KEY);
          setNeedsMfaChallenge(false);
        }
      }
      setLoading(false);
    });

    // Initial session check on page load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const mfaRequired = sessionStorage.getItem(MFA_REQUIRED_KEY);
        const mfaVerified = sessionStorage.getItem(MFA_VERIFIED_KEY);

        if (mfaRequired && !mfaVerified) {
          // Refresh happened mid-MFA flow
          setNeedsMfaChallenge(true);
        } else if (!mfaVerified) {
          // Check MFA status for this new session
          await checkMfaStatusOnLoad(session.user);
        }

        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username?: string, fullName?: string) => {
    // ... existing signUp logic ...
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      let loginEmail = identifier.trim();

      if (!identifier.includes("@")) {
        const { data: email, error: lookupError } = await supabase.rpc("lookup_email_by_username", {
          p_username: identifier.trim(),
        });

        if (lookupError || !email) {
          toast({
            variant: "destructive",
            title: "Sign In Error",
            description: "Username not found. Please check and try again.",
          });
          return { error: { message: "Username not found" } };
        }

        loginEmail = email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        // ... existing error handling ...
        return { error };
      }

      // Check MFA status immediately after successful password login
      if (data?.user) {
        try {
          const { data: mfaStatus } = await supabase.functions.invoke("mfa-setup", {
            body: { action: "status" },
          });

          if (mfaStatus?.enabled) {
            // MFA is enabled - mark as required but not yet verified
            sessionStorage.setItem(MFA_REQUIRED_KEY, "true");
            setNeedsMfaChallenge(true);
          } else {
            // No MFA needed
            sessionStorage.removeItem(MFA_REQUIRED_KEY);
            setNeedsMfaChallenge(false);
          }
        } catch (e) {
          console.error("MFA status check failed:", e);
          setNeedsMfaChallenge(false);
        }
      }

      return { error };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign In Error",
        description: error.message,
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear MFA state on logout
      sessionStorage.removeItem(MFA_REQUIRED_KEY);
      sessionStorage.removeItem(MFA_VERIFIED_KEY);
      setUser(null);
      setSession(null);
      setProfile(null);
      setNeedsMfaChallenge(false);
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    }
  };

  const handleMfaVerified = () => {
    // Mark MFA as verified for this browser session
    sessionStorage.setItem(MFA_VERIFIED_KEY, Date.now().toString());
    sessionStorage.removeItem(MFA_REQUIRED_KEY);
    setNeedsMfaChallenge(false);
    if (user) fetchProfile(user.id);
  };

  const handleMfaCancelled = () => {
    // Clear session and MFA state if they cancel
    sessionStorage.removeItem(MFA_REQUIRED_KEY);
    sessionStorage.removeItem(MFA_VERIFIED_KEY);
    signOut();
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {needsMfaChallenge ? (
        <TwoFactorChallenge open={true} onVerified={handleMfaVerified} onCancel={handleMfaCancelled} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
