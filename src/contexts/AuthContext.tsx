import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TwoFactorChallenge } from "@/components/auth/TwoFactorChallenge";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean; // used primarily for initial auth restore
  isInitialRestore: boolean; // explicit “still restoring session” flag (can be used by layout to avoid flicker)
  signUp: (email: string, password: string, username?: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; emailNotVerified?: boolean; email?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MFA per-login-session marker
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

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  // Loading: control loading timing for better UX after browser focus
  const [loading, setLoading] = useState(true);
  const [isInitialRestore, setIsInitialRestore] = useState(true);

  // MFA gating state
  const [needsMfaChallenge, setNeedsMfaChallenge] = useState(false);
  const [isMfaEnforcing, setIsMfaEnforcing] = useState(false);
  const [mfaChallengeError, setMfaChallengeError] = useState<string | null>(null);

  // During sign-in, we may need to hold state until MFA completes (so we don’t show “success” too early)
  const [pendingSignInState, setPendingSignInState] = useState<{
    user: User | null;
    session: Session | null;
    didShowSignInToast: boolean;
  }>({ user: null, session: null, didShowSignInToast: false });

  // refs to avoid memo-chasing
  const sessionRef = useRef<Session | null>(null);
  const userRef = useRef<User | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single();

      if (error) throw error;

      // Handle incomplete OAuth profiles (role, username, avatar)
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

      // Pending panel creation (helps OAuth flows + first-time setup)
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

  /**
   * Enforce MFA if enabled for this user/session.
   * Returns a boolean that is true when MFA is satisfied (or MFA not enabled).
   *
   * The function updates `needsMfaChallenge` based on persistent marker (session-scoped) so
   * tab switches (token refreshes) resume instead of repeatedly prompting unless needed.
   */
  const enforceMfaIfEnabled = async (sess: Session): Promise<boolean> => {
    const u = sess.user;
    if (!u) return true;

    setIsMfaEnforcing(true);
    setMfaChallengeError(null);

    try {
      // Ask backend whether MFA is enabled for this user
      const { data: mfaStatus, error: mfaErr } = await supabase.functions.invoke("mfa-setup", {
        body: { action: "status" },
      });

      if (mfaErr || !mfaStatus) {
        console.error("MFA status lookup failed:", mfaErr || "empty response");
        // Fail-safe: treat as no MFA requirement to avoid indefinite blocking (adjust behavior if needed)
        setNeedsMfaChallenge(false);
        return true;
      }

      const enabled = !!mfaStatus?.enabled;
      if (!enabled) {
        setNeedsMfaChallenge(false);
        return true;
      }

      const key = getMfaKey(u.id, sess.refresh_token);
      const alreadyVerified = isMfaMarkedVerified(key);

      // If already verified for this login session (with TTL), allow access immediately
      if (alreadyVerified) {
        setNeedsMfaChallenge(false);
        return true;
      }

      // MFA enabled but not verified yet: show challenge (block protected pages)
      setNeedsMfaChallenge(true);
      return false;
    } catch (e) {
      console.error("enforceMfaIfEnabled failed:", e);
      setNeedsMfaChallenge(false);
      return true; // fail open by default; change to false if you want stricter security
    } finally {
      setIsMfaEnforcing(false);
    }
  };

  /**
   * Handles MFA verification outcome:
   * - If verified: mark session-scoped verified, complete pending sign-in if any, fetch profile, unblock app
   * - If failed: show error message on the dialog (no immediate sign-out unless user cancels)
   */
  const handleMfaVerified = async (codeOrBackupCode: string) => {
    try {
      setIsMfaEnforcing(true);
      setMfaChallengeError(null);

      // Call the MFA verify endpoint (TwoFactorChallenge should use the stable function/flow you have)
      const { data, error } = await supabase.functions.invoke("mfa-verify", {
        body: { code: codeOrBackupCode, type: "totp" }, // adjust if you support other types
      });

      if (error || !data?.valid) {
        const errorMsg = error?.message || data?.error || "Invalid or expired MFA code";
        setMfaChallengeError(errorMsg || "Invalid or expired MFA code");
        toast({
          variant: "destructive",
          title: "MFA Verification Failed",
          description: errorMsg,
        });
        return; // Keep dialog open so user can retry
      }

      // Successful verification: mark this session verified (so future token refresh doesn’t prompt again)
      const sess = sessionRef.current;
      if (sess?.user) {
        const key = getMfaKey(sess.user.id, sess.refresh_token);
        markMfaVerified(key);
      }

      // MFA complete — unblock the app
      setNeedsMfaChallenge(false);

      // After unblock, consider work left to do (pending sign-in / profile)
      if (sess?.user?.id) {
        await fetchProfile(sess.user.id);
      }

      // If there was a pending sign-in (the user signed in, but MFA blocked access until now), fire the success toast now
      if (pendingSignInState.user && pendingSignInState.session && !pendingSignInState.didShowSignInToast) {
        toast({
          title: "Signed in successfully",
          description: "Welcome to your dashboard",
        });

        setPendingSignInState({
          user: null,
          session: null,
          didShowSignInToast: true,
        });
      }
    } catch (e) {
      console.error("MFA verify failed:", e);
      setMfaChallengeError("Verification request failed. Please try again.");
      toast({
        variant: "destructive",
        title: "MFA Error",
        description: "Verification request failed. Please try again.",
      });
    } finally {
      setIsMfaEnforcing(false);
    }
  };

  const handleMfaCancelled = async () => {
    // Cancel => sign out (fail-closed to prevent unauthorized access)
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out error on MFA cancel:", err);
    }

    setNeedsMfaChallenge(false);
    setMfaChallengeError(null);
    setUser(null);
    setSession(null);
    setProfile(null);

    // Clear MFA marker keys for this session (clean up)
    const sess = sessionRef.current;
    if (sess?.user) {
      const key = getMfaKey(sess.user.id, sess.refresh_token);
      localStorage.removeItem(key);
    }

    // Clear pending sign-in (we didn’t complete)
    setPendingSignInState({ user: null, session: null, didShowSignInToast: false });

    toast({
      title: "Sign-in interrupted",
      description: "You cancelled the MFA verification. Please sign in again.",
      variant: "default",
    });
  };

  useEffect(() => {
    // On any authentication state change (sign in, sign out, token refresh, focus restore in some browsers)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      // Update session and user state immediately
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      sessionRef.current = currentSession;
      userRef.current = currentSession?.user ?? null;

      // If there’s no session, user is signed out (or signed out via other means)
      if (!currentSession?.user) {
        setProfile(null);
        setNeedsMfaChallenge(false);
        setMfaChallengeError(null);

        // If auth change was a sign out event, clear pending states
        if (event === "SIGNED_OUT") {
          setPendingSignInState({ user: null, session: null, didShowSignInToast: false });
        }

        setLoading(false);
        setIsInitialRestore(false);
        return;
      }

      // Only when restoring/refreshing (not direct sign-in flow driven by submit), we set loading
      if (event !== "SIGNED_IN") {
        setLoading(true);
      }

      // Fetch profile regardless (profile doesn’t grant access; MFA does)
      const fetchedProfile = await fetchProfile(currentSession.user.id);

      // Enforce MFA for access. For TOKEN_REFRESH events, we should reuse the verified marker
      let accessGranted = true;
      if (event !== "TOKEN_REFRESH") {
        // Full login / session restored: enforce MFA if enabled
        accessGranted = await enforceMfaIfEnabled(currentSession);
      } else {
        // Token refresh: only enforce if we don’t have a verified marker for this session
        const key = getMfaKey(currentSession.user.id, currentSession.refresh_token);
        const alreadyVerified = isMfaMarkedVerified(key);
        if (alreadyVerified) {
          // Token refreshed under a valid MFA-verified session
          setNeedsMfaChallenge(false);
          accessGranted = true;
        } else {
          // Token refresh without verified marker: enforce MFA (could be after browser/tab focus changes)
          accessGranted = await enforceMfaIfEnabled(currentSession);
        }
      }

      // If this is a SIGNED_IN event and the user successfully authenticated, handle toast timing
      if (event === "SIGNED_IN") {
        if (accessGranted && fetchedProfile) {
          // Fully authenticated (MFA not required OR MFA already verified). Show success now
          toast({
            title: "Signed in successfully",
            description: "Welcome to your dashboard",
          });
          setPendingSignInState({
            user: null,
            session: null,
            didShowSignInToast: true,
          });
        } else {
          // MFA required: hold onto the authenticated session/user until MFA completes (we'll show success after verified)
          setPendingSignInState({
            user: currentSession.user,
            session: currentSession,
            didShowSignInToast: false,
          });
        }
      }

      setLoading(false);

      // Initial restore is complete after the first auth event or immediately after getSession resolve
      if (isInitialRestore) {
        setIsInitialRestore(false);
      }
    });

    // Initial session restore (run on mount only once)
    const restoreInitialSession = async () => {
      try {
        setLoading(true);

        const {
          data: { session: sess },
        } = await supabase.auth.getSession();

        setSession(sess);
        setUser(sess?.user ?? null);
        sessionRef.current = sess;
        userRef.current = sess?.user ?? null;

        if (sess?.user) {
          await fetchProfile(sess.user.id);
          await enforceMfaIfEnabled(sess);
        }
      } catch (err) {
        console.error("Initial session restore error:", err);
      } finally {
        setLoading(false);
        setIsInitialRestore(false);
      }
    };

    restoreInitialSession();

    return () => subscription.unsubscribe();
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

      // Allow signing in with username (look up email via RPC function you should have in your database)
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
        // Email not verified? Give clearer feedback and return flow to component for that case (no toast yet needed except controlled error)
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

        toast({ variant: "destructive", title: "Sign In Failed", description: friendlyMessage });
        return { error };
      }

      // IMPORTANT: we don't fire success toast here. MFA enforcement
      // MFA enforcement now happens in onAuthStateChange/getSession restore.
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
      setNeedsMfaChallenge(false);

      const sess = sessionRef.current;
      if (sess?.user) {
        const key = getMfaKey(sess.user.id, sess.refresh_token);
        localStorage.removeItem(key);
      }
    }

    toast({ title: "Signed out successfully" });
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
        <TwoFactorChallenge open={true} onVerified={handleMfaVerified} onCancel={handleMfaCancelled} />
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
