import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
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

const MFA_STORAGE_PREFIX = "mfa_verified_";
const MFA_MARKER_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function getMfaKey(userId: string, refreshToken?: string | null) {
  const rt = (refreshToken || "").slice(0, 16) || "no_rt";
  return `${MFA_STORAGE_PREFIX}${userId}_${rt}`;
}

function isMfaMarkedVerified(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { expiresAt?: number };
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function markMfaVerified(key: string) {
  const expiresAt = Date.now() + MFA_MARKER_TTL_MS;
  localStorage.setItem(key, JSON.stringify({ verifiedAt: Date.now(), expiresAt }));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsMfaChallenge, setNeedsMfaChallenge] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);

  // Refs for stable access across renders
  const sessionRef = useRef<Session | null>(null);
  const userRef = useRef<User | null>(null);
  const initializedRef = useRef(false);
  const isFetchingProfileRef = useRef(false);
  const pendingSignInSuccessRef = useRef(false);

  // Store subscription cleanup function
  let currentSubscriptionCleanup: (() => void) | null = null;

  // ----------------- PROFILE FETCHING -----------------
  const fetchProfile = async (userId: string) => {
    if (isFetchingProfileRef.current) {
      return profileRef.current;
    }

    isFetchingProfileRef.current = true;

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single();

      if (error) throw error;

      // Auto-fill missing profile data
      if (data && (!data.role || !data.username)) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        const metadata = authUser?.user_metadata || {};
        const updates: Record<string, any> = {};

        if (!data.role) updates.role = metadata.role || "panel_owner";
        if (!data.username) {
          const emailPrefix = (data.email || "")
            .split("@")[0]
            .replace(/[^a-zA-Z0-9_]/g, "")
            .slice(0, 20);

          const namePrefix = (metadata.full_name || "")
            .replace(/\s+/g, "")
            .replace(/[^a-zA-Z0-9_]/g, "")
            .slice(0, 20);

          updates.username = namePrefix || emailPrefix || `user_${Date.now().toString(36)}`;
        }
        if (!data.full_name && metadata.full_name) updates.full_name = metadata.full_name;
        if (!data.avatar_url && metadata.avatar_url) updates.avatar_url = metadata.avatar_url;

        if (Object.keys(updates).length > 0) {
          const { data: updated } = await supabase
            .from("profiles")
            .update(updates)
            .eq("user_id", userId)
            .select("*")
            .single();

          if (updated) {
            setProfile(updated);
            profileRef.current = updated;
            isFetchingProfileRef.current = false;
            return updated;
          }
        }
      }

      setProfile(data);
      profileRef.current = data;

      // Handle pending panel creation for new users
      const pendingPanel = localStorage.getItem("pendingPanelCreation");
      if (pendingPanel && data.role === "panel_owner") {
        try {
          const panelData = JSON.parse(pendingPanel);
          if (panelData.userId === userId) {
            await createPanel(panelData.panelName, data.id);
            localStorage.removeItem("pendingPanelCreation");
          }
        } catch (err) {
          console.error("Panel creation from localStorage failed:", err);
        }
      }

      isFetchingProfileRef.current = false;
      return data;
    } catch (err: any) {
      console.error("Error fetching profile:", err);

      // Fallback to cached profile on network error
      if (profileRef.current) {
        console.warn("Profile fetch failed, using cached profile");
        setProfile(profileRef.current);
      }

      isFetchingProfileRef.current = false;
      return profileRef.current || null;
    }
  };

  // Keep ref synced for fallback during fetch
  const profileRef = useRef<any | null>(null);

  // ----------------- PANEL CREATION -----------------
  const createPanel = async (panelName: string, ownerId: string) => {
    try {
      const { error } = await supabase.from("panels").insert([
        {
          name: panelName,
          owner_id: ownerId,
          status: "active" as const,
          is_approved: true,
          theme_type: "dark_gradient" as const,
          subdomain:
            panelName
              .toLowerCase()
              .replace(/[^a-zA-Z0-9]/g, "")
              .substring(0, 20) || "panel",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Panel Created",
        description: "Your subdomain is live now. Configure services to start selling.",
      });
    } catch (err) {
      console.error("Error creating panel:", err);
      toast({
        variant: "destructive",
        title: "Panel Creation Error",
        description: "Failed to create your panel. Please contact support.",
      });
    }
  };

  // ----------------- AUTH HELPERS -----------------
  const refreshProfile = async () => {
    if (userRef.current) await fetchProfile(userRef.current.id);
  };

  const enforceMfaIfEnabled = async (sess: Session): Promise<boolean> => {
    const u = sess.user;
    if (!u) return false;

    try {
      const { data: mfaStatus } = await supabase.functions.invoke("mfa-setup", {
        body: { action: "status" },
      });

      const enabled = !!mfaStatus?.enabled;
      if (!enabled) {
        setNeedsMfaChallenge(false);
        setMfaError(null);
        return false;
      }

      const key = getMfaKey(u.id, sess.refresh_token);
      const alreadyVerified = isMfaMarkedVerified(key);

      setNeedsMfaChallenge(!alreadyVerified);
      if (!alreadyVerified) {
        setMfaError(null);
      }
      return !alreadyVerified;
    } catch (err) {
      console.error("MFA check error:", err);
      // Fail-open: don't block legitimate sessions on error
      setNeedsMfaChallenge(false);
      setMfaError(null);
      return false;
    }
  };

  // ----------------- MFA HANDLERS -----------------
  const handleMfaVerified = async () => {
    const sess = sessionRef.current;
    if (sess?.user) {
      const key = getMfaKey(sess.user.id, sess.refresh_token);
      markMfaVerified(key);
    }

    setNeedsMfaChallenge(false);
    setMfaError(null);

    // Refresh profile after successful MFA
    if (sessionRef.current?.user?.id) {
      await fetchProfile(sessionRef.current.user.id);
    }

    // Show sign-in success toast ONLY after MFA is verified (when required)
    if (pendingSignInSuccessRef.current) {
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
      pendingSignInSuccessRef.current = false;
    }

    // Ensure loading is complete
    setLoading(false);
  };

  const handleMfaCancelled = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}

    setNeedsMfaChallenge(false);
    setMfaError(null);
    pendingSignInSuccessRef.current = false;

    setUser(null);
    setSession(null);
    setProfile(null);
    profileRef.current = null;
    setLoading(false);

    // Clear MFA markers
    const sess = sessionRef.current;
    if (sess?.user) {
      const key = getMfaKey(sess.user.id, sess.refresh_token);
      localStorage.removeItem(key);
    }

    toast({
      variant: "destructive",
      title: "Authentication Required",
      description: "MFA verification was cancelled. You have been signed out.",
    });
  };

  const handleMfaError = (message: string) => {
    setMfaError(message);

    // Friendly error messages
    const friendlyMessage = message.toLowerCase().includes("rate limit")
      ? "Too many attempts. Please wait before trying again."
      : message.toLowerCase().includes("locked")
        ? "Account temporarily locked. Try again later."
        : message.toLowerCase().includes("used")
          ? "Backup code already used. Use a different code."
          : "Invalid verification code. Please try again.";

    toast({
      variant: "destructive",
      title: "MFA Verification Failed",
      description: friendlyMessage,
    });
  };

  // ----------------- SESSION TAB RETURN HANDLER -----------------
  const handleTabReenter = async () => {
    // Skip if we're already showing MFA
    if (needsMfaChallenge) return;

    try {
      const {
        data: { session: newSession },
      } = await supabase.auth.getSession();

      // Check if session changed while tab was inactive
      if (!newSession) {
        // Session expired
        setLoading(false);
        setNeedsMfaChallenge(false);
        return;
      }

      if (newSession.access_token !== sessionRef.current?.access_token) {
        // Token was refreshed - update state silently
        setSession(newSession);
        setUser(newSession.user);
        sessionRef.current = newSession;
        userRef.current = newSession.user;

        // Re-fetch profile silently
        if (newSession.user) {
          await fetchProfile(newSession.user.id);
        }

        // Re-check MFA status
        await enforceMfaIfEnabled(newSession);

        // Ensure loading is cleared unless MFA is needed
        if (!needsMfaChallenge) {
          setLoading(false);
        }
      } else if (sessionRef.current?.user) {
        // Session unchanged but might need MFA recheck
        await enforceMfaIfEnabled(sessionRef.current);
        if (!needsMfaChallenge) {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Tab re-entry session check failed:", err);
      setLoading(false);
    }
  };

  // ----------------- AUTH STATE CHANGE LISTENER -----------------
  useEffect(() => {
    // Prevent double subscription
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Main auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      // Always update refs first for consistency
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      sessionRef.current = currentSession;
      userRef.current = currentSession?.user ?? null;

      // Handle logout
      if (!currentSession?.user) {
        setProfile(null);
        profileRef.current = null;
        setNeedsMfaChallenge(false);
        setMfaError(null);
        pendingSignInSuccessRef.current = false;
        setLoading(false);
        return;
      }

      // TOKEN_REFRESHED happens in background - don't interfere with UI
      if (event === "TOKEN_REFRESHED") {
        fetchProfile(currentSession.user.id).catch(() => {});
        enforceMfaIfEnabled(currentSession).catch(() => {});
        return;
      }

      // INITIAL_SESSION on subsequent loads - skip, use existing session
      if (event === "INITIAL_SESSION" && initializedRef.current) {
        return;
      }

      // SIGNED_IN or INITIAL_LOAD - process fully
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        setLoading(true);

        // Fetch profile
        await fetchProfile(currentSession.user.id);

        // Enforce MFA if needed
        const requiresMfa = await enforceMfaIfEnabled(currentSession);

        // Complete loading if no MFA required
        if (!requiresMfa) {
          setLoading(false);
        }

        // If sign-in was just completed and no MFA required, show success toast
        if (!requiresMfa && pendingSignInSuccessRef.current) {
          toast({
            title: "Signed in successfully",
            description: "Welcome back!",
          });
          pendingSignInSuccessRef.current = false;
        }
      }
    });

    currentSubscriptionCleanup = () => subscription.unsubscribe();

    // Initial session restore (runs once on mount)
    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      if (initializedRef.current) return; // Already handled by subscription

      setSession(sess);
      setUser(sess?.user ?? null);
      sessionRef.current = sess;
      userRef.current = sess?.user ?? null;

      if (sess?.user) {
        setLoading(true);
        await fetchProfile(sess.user.id);
        await enforceMfaIfEnabled(sess);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    // Tab visibility handler for returning from other tabs
    document.addEventListener("visibilitychange", handleTabReenter);
    window.addEventListener("focus", handleTabReenter);

    return () => {
      if (currentSubscriptionCleanup) currentSubscriptionCleanup();
      document.removeEventListener("visibilitychange", handleTabReenter);
      window.removeEventListener("focus", handleTabReenter);
    };
  }, []);

  // ----------------- SIGN UP / SIGN IN / SIGN OUT -----------------
  const signUp = async (email: string, password: string, username?: string, fullName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
          data: {
            username,
            full_name: fullName || "",
            role: "panel_owner",
          },
        },
      });

      if (error) {
        toast({ variant: "destructive", title: "Sign Up Error", description: error.message });
      } else {
        toast({ title: "Success", description: "Please check your email to confirm your account." });
      }

      return { error };
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sign Up Error", description: err.message });
      return { error: err };
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      let loginEmail = identifier.trim();

      // Username lookup
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
        // Email not confirmed
        if (error.message?.toLowerCase().includes("email not confirmed")) {
          return { error, emailNotVerified: true, email: loginEmail };
        }

        // Format friendly error messages
        let friendlyMessage = error.message;
        const lowerMsg = error.message?.toLowerCase() || "";

        if (lowerMsg.includes("invalid login credentials") || lowerMsg.includes("invalid_credentials")) {
          friendlyMessage = "Invalid email/username or password. Please check and try again.";
        } else if (lowerMsg.includes("too many requests") || lowerMsg.includes("rate limit")) {
          friendlyMessage = "Too many login attempts. Please wait a moment and try again.";
        } else if (lowerMsg.includes("user not found")) {
          friendlyMessage = "No account found with this email. Please sign up first.";
        } else if (lowerMsg.includes("network") || lowerMsg.includes("fetch")) {
          friendlyMessage = "Network error. Please check your connection and try again.";
        }

        toast({ variant: "destructive", title: "Sign In Failed", description: friendlyMessage });
        return { error };
      }

      // Mark that sign-in was successful (toast will show after MFA if required)
      pendingSignInSuccessRef.current = true;
      return { error };
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sign In Error", description: err.message });
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      profileRef.current = null;
      setNeedsMfaChallenge(false);
      setMfaError(null);
      pendingSignInSuccessRef.current = false;
      setLoading(false);

      const sess = sessionRef.current;
      if (sess?.user) {
        const key = getMfaKey(sess.user.id, sess.refresh_token);
        localStorage.removeItem(key);
      }
    }

    toast({ title: "Signed out successfully" });
  };

  // ----------------- CONTEXT VALUE -----------------
  const value: AuthContextType = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }),
    [user, session, profile, loading],
  );

  // ----------------- RENDER -----------------
  return (
    <AuthContext.Provider value={value}>
      {needsMfaChallenge ? (
        <TwoFactorChallenge
          open={true}
          onVerified={handleMfaVerified}
          onCancel={handleMfaCancelled}
          onError={handleMfaError}
          errorMessage={mfaError}
        />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
