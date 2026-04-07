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
const MFA_MARKER_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours (adjust depending on your security policy)

function getMfaKey(userId: string, refreshToken?: string | null) {
  // Keep key relatively stable: refresh_token prefix prevents long keys but still binds to session
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
  const [mfaOpen, setMfaOpen] = useState(false); // controlled open to keep UI stable
  const [mfaError, setMfaError] = useState<string | null>(null); // surface errors to TwoFactorChallenge (via prop you can implement)
  const [pendingSignInSuccess, setPendingSignInSuccess] = useState(false); // ensures sign-in success toast only after MFA success (when enabled)

  // Latest refs (used during recovery + MFA callbacks)
  const sessionRef = useRef<Session | null>(null);
  const userRef = useRef<User | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single();

      if (error) throw error;

      // Ensure role/username/avatar for OAuth users or new users
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
            return updated;
          }
        }
      }

      setProfile(data);

      // Pending panel creation (after user first signs up/OAuth)
      const pendingPanel = localStorage.getItem("pendingPanelCreation");
      if (pendingPanel && data.role === "panel_owner") {
        const panelData = JSON.parse(pendingPanel);
        if (panelData.userId === userId) {
          await createPanel(panelData.panelName, data.id);
          localStorage.removeItem("pendingPanelCreation");
        }
      }

      return data;
    } catch (err) {
      console.error("Error fetching profile:", err);
      return null;
    }
  };

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

  const refreshProfile = async () => {
    if (userRef.current) {
      await fetchProfile(userRef.current.id);
    }
  };

  // Core MFA enforcement on any session restore / state change
  const enforceMfaIfEnabled = async (sess: Session) => {
    const u = sess.user;
    if (!u) return;

    // Check whether MFA is enabled for this user (edge function is decoupled to avoid exposing internals)
    let enabled = false;
    try {
      const { data: mfaStatus, error } = await supabase.functions.invoke("mfa-setup", {
        body: { action: "status" },
      });
      if (error) {
        console.error("MFA status check error:", error);
        // Fail-closed: require verification in case of uncertainty (safer)
        enabled = true;
        return;
      }
      enabled = !!mfaStatus?.enabled;
    } catch (err) {
      // Fail-closed on unexpected errors
      console.error("MFA status check failed:", err);
      enabled = true;
    }

    if (!enabled) {
      // No MFA enabled, just ensure dialog is gone
      setNeedsMfaChallenge(false);
      setMfaOpen(false);
      setMfaError(null);
      return;
    }

    const key = getMfaKey(u.id, sess.refresh_token);
    const alreadyVerified = isMfaMarkedVerified(key);

    // If not already verified, show the MFA challenge and ensure loading is finalized before forcing the block
    if (!alreadyVerified) {
      setNeedsMfaChallenge(true);
      setMfaOpen(true);
      setMfaError(null);
      return; // leave loading as-is until resolved (onVerified / onCancel)
    }

    // Already verified for this session
    setNeedsMfaChallenge(false);
    setMfaOpen(false);
    setMfaError(null);
  };

  /**
   * Called after MFA is successfully verified (from TwoFactorChallenge onVerified)
   * This will release access and trigger the appropriate post-auth success flow.
   */
  const handleMfaVerified = async () => {
    const sess = sessionRef.current;
    if (sess?.user) {
      const key = getMfaKey(sess.user.id, sess.refresh_token);
      markMfaVerified(key);
    }

    setNeedsMfaChallenge(false);
    setMfaOpen(false);
    setMfaError(null);

    // Refresh profile to ensure role / panel access is ready
    if (sess?.user?.id) {
      await fetchProfile(sess.user.id);
    }

    // If sign-in was performed just before MFA, show the success toast now
    if (pendingSignInSuccess) {
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
      setPendingSignInSuccess(false);
    }

    // Make sure loading is fully completed so returning users don’t get stuck loading
    setLoading(false);
  };

  /**
   * Called when user cancels MFA verification
   * Fail-closed: clear authenticated state and mark unauthorized
   */
  const handleMfaCancelled = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}

    setNeedsMfaChallenge(false);
    setMfaOpen(false);
    setMfaError(null);
    setUser(null);
    setSession(null);
    setProfile(null);
    setPendingSignInSuccess(false);

    // Clear marker (optional cleanup; clearing means user will need to verify on next login)
    const sess = sessionRef.current;
    if (sess?.user) {
      const key = getMfaKey(sess.user.id, sess.refresh_token);
      localStorage.removeItem(key);
    }

    setLoading(false);

    toast({
      variant: "destructive",
      title: "Authentication required",
      description: "MFA verification was required to continue. You were signed out for security.",
    });
  };

  /**
   * Optional: Called when TwoFactorChallenge reports an error during verify (invalid code, used backup, rate limited, locked)
   * This sets mfaError so your UI can display it and keeps the dialog open.
   */
  const handleMfaError = (message: string) => {
    setMfaError(message);

    // Example friendly messages (adjust to your backend responses)
    const friendly = message.toLowerCase().includes("locked")
      ? "Your account is temporarily locked. Please wait a few minutes and try again."
      : message.toLowerCase().includes("rate limit")
        ? "Too many attempts. Please wait to try again."
        : message.toLowerCase().includes("used")
          ? "Backup code already used. Please use a different code."
          : "Invalid verification code. Please try again.";

    toast({
      variant: "destructive",
      title: "MFA verification failed",
      description: friendly,
    });
  };

  useEffect(() => {
    // Auth state change handler — this is your main session driver
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      // Keep latest current state in refs first to avoid stale values in MFA callbacks
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      sessionRef.current = currentSession;
      userRef.current = currentSession?.user ?? null;

      if (!currentSession?.user) {
        // Logged out / no session — clean up and stop loading
        setProfile(null);
        setNeedsMfaChallenge(false);
        setMfaOpen(false);
        setMfaError(null);
        setPendingSignInSuccess(false);
        setLoading(false);
        return;
      }

      // User is authenticated — start with intentional loading
      // Why: we must check MFA + fetch profile before we can say “ready”
      setLoading(true);

      try {
        // 1) Fetch profile (best-effort; failure won’t block MFA enforcement, but we log it)
        await fetchProfile(currentSession.user.id);

        // 2) Enforce MFA if enabled — this can block and stay open with dialog
        await enforceMfaIfEnabled(currentSession);

        // 3) If we reach here without opening MFA, user is fully authenticated: complete loading
        if (!needsMfaChallenge) {
          setLoading(false);
        }

        // If signIn caused pendingSignInSuccess, and MFA is not required, toast will be shown after profile load.
        if (!needsMfaChallenge && pendingSignInSuccess) {
          toast({
            title: "Signed in successfully",
            description: "Welcome back!",
          });
          setPendingSignInSuccess(false);
        }
      } catch (err) {
        console.error("Auth state change processing failed:", err);
        // Fail-open cautiously: we won’t lock everyone forever, but we’ll stop loading and present state cleanly
        setLoading(false);
        setNeedsMfaChallenge(false);
        setMfaOpen(false);
      }
    });

    // Initial session restore (handles page reload, tab return, PW resets, deep links)
    const restoreSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sess = data?.session || null;
        setSession(sess);
        setUser(sess?.user ?? null);
        sessionRef.current = sess;
        userRef.current = sess?.user ?? null;

        if (sess?.user) {
          setLoading(true);
          await fetchProfile(sess.user.id);
          await enforceMfaIfEnabled(sess);

          if (!needsMfaChallenge) {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Session restore failed:", err);
        setLoading(false);
      }
    };

    restoreSession();

    // Optional: handle tab visibility changes and window focus
    // These events often expose the “stuck loading” problem. Refreshing stale state helps.
    const handleVisibility = async () => {
      if (document.visibilityState === "visible") {
        try {
          // Revalidate the session in case it expired in the background
          const { data } = await supabase.auth.getSession();
          const newSession = data.session;

          if (
            (!sessionRef.current && newSession) ||
            (sessionRef.current && newSession && sessionRef.current.access_token !== newSession.access_token)
          ) {
            // Trigger the onAuthStateChange flow to process MFA again (safe)
            supabase.auth.setSession({
              access_token: newSession.access_token,
              refresh_token: newSession.refresh_token,
            });
          }

          // Force re-check MFA state when resuming, to prevent loaded-locked UI
          if (sessionRef.current?.user) {
            setLoading(true);
            await enforceMfaIfEnabled(sessionRef.current);
            if (!needsMfaChallenge) {
              setLoading(false);
            }
          }
        } catch (err) {
          console.error("Visibility change session check failed:", err);
          setLoading(false);
        }
      }
    };

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        toast({
          variant: "destructive",
          title: "Sign Up Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Success",
          description: "Please check your email to confirm your account.",
        });
      }

      return { error };
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Error",
        description: err.message,
      });
      return { error: err };
    }
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
        if (
          error.message?.toLowerCase().includes("email not confirmed") ||
          error.message?.toLowerCase().includes("email_not_confirmed")
        ) {
          return { error, emailNotVerified: true, email: loginEmail };
        }

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

        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: friendlyMessage,
        });
        return { error };
      }

      // IMPORTANT: do NOT show sign-in success toast here anymore.
      // Instead, we set a pending flag so success is shown only after MFA is verified (when enabled),
      // or immediately after a successful sign-in if MFA is not enabled.
      setPendingSignInSuccess(true);
      return { error };
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sign In Error",
        description: err.message,
      });
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
      setNeedsMfaChallenge(false);
      setMfaOpen(false);
      setMfaError(null);
      setPendingSignInSuccess(false);

      const sess = sessionRef.current;
      if (sess?.user) {
        const key = getMfaKey(sess.user.id, sess.refresh_token);
        localStorage.removeItem(key);
      }

      setLoading(false);

      toast({
        title: "Signed out successfully",
        description: "You have been signed out.",
      });
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, session, profile, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {needsMfaChallenge ? (
        <TwoFactorChallenge
          open={mfaOpen}
          onVerified={handleMfaVerified}
          onCancel={handleMfaCancelled}
          onError={handleMfaError} // make sure your TwoFactorChallenge accepts this prop to enable error reporting
          errorMessage={mfaError} // optional: allow your dialog to display inline errors
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
