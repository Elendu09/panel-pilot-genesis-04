import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
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
const MFA_MARKER_TTL_MS = 1000 * 60 * 60 * 24;

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

  const sessionRef = useRef<Session | null>(null);
  const userRef = useRef<User | null>(null);
  const profileRef = useRef<any | null>(null);
  const initializedRef = useRef(false);
  const isFetchingProfileRef = useRef(false);
  const pendingSignInSuccessRef = useRef(false);

  const fetchProfile = async (userId: string) => {
    if (isFetchingProfileRef.current) return profileRef.current;
    isFetchingProfileRef.current = true;

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single();

      if (error) throw error;

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

      const pendingPanel = localStorage.getItem("pendingPanelCreation");
      if (pendingPanel && data?.role === "panel_owner") {
        try {
          const panelData = JSON.parse(pendingPanel);
          if (panelData.userId === userId) {
            await createPanel(panelData.panelName, data.id);
            localStorage.removeItem("pendingPanelCreation");
          }
        } catch (e) {
          console.error("Pending panel error:", e);
        }
      }

      isFetchingProfileRef.current = false;
      return data;
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      if (profileRef.current) setProfile(profileRef.current);
      isFetchingProfileRef.current = false;
      return profileRef.current || null;
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
      toast({ title: "Panel Created", description: "Your subdomain is live now." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Panel Creation Error", description: "Failed to create panel." });
    }
  };

  const refreshProfile = async () => {
    if (userRef.current?.id) await fetchProfile(userRef.current.id);
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
      setMfaError(null);
      return !alreadyVerified;
    } catch (err) {
      console.error("MFA check failed:", err);
      setNeedsMfaChallenge(false);
      setMfaError(null);
      return false;
    }
  };

  const handleMfaVerified = async () => {
    const sess = sessionRef.current;
    if (sess?.user) markMfaVerified(getMfaKey(sess.user.id, sess.refresh_token));

    setNeedsMfaChallenge(false);
    setMfaError(null);

    if (sess?.user?.id) await fetchProfile(sess.user.id);

    if (pendingSignInSuccessRef.current) {
      toast({ title: "Signed in successfully", description: "Welcome back!" });
      pendingSignInSuccessRef.current = false;
    }
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

    const sess = sessionRef.current;
    if (sess?.user) localStorage.removeItem(getMfaKey(sess.user.id, sess.refresh_token));

    toast({ variant: "destructive", title: "Signed out", description: "MFA was cancelled." });
  };

  const handleMfaError = (message: string) => {
    setMfaError(message);
  };

  const handleTabReenter = useCallback(async () => {
    if (document.visibilityState !== "visible" || needsMfaChallenge) return;

    try {
      const {
        data: { session: fresh },
      } = await supabase.auth.getSession();
      if (!fresh) {
        setLoading(false);
        return;
      }

      if (fresh.access_token !== sessionRef.current?.access_token) {
        setSession(fresh);
        setUser(fresh.user);
        sessionRef.current = fresh;
        userRef.current = fresh.user;
      }

      if (fresh.user) {
        await fetchProfile(fresh.user.id);
        const needsMfa = await enforceMfaIfEnabled(fresh);
        if (!needsMfa) setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [needsMfaChallenge]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      sessionRef.current = currentSession;
      userRef.current = currentSession?.user ?? null;

      if (!currentSession?.user) {
        setProfile(null);
        profileRef.current = null;
        setNeedsMfaChallenge(false);
        setMfaError(null);
        pendingSignInSuccessRef.current = false;
        setLoading(false);
        return;
      }

      if (event === "TOKEN_REFRESHED") {
        fetchProfile(currentSession.user.id).catch(console.error);
        enforceMfaIfEnabled(currentSession).catch(console.error);
        return;
      }

      if (event === "INITIAL_SESSION" && initializedRef.current) return;

      setLoading(true);
      await fetchProfile(currentSession.user.id);
      const requiresMfa = await enforceMfaIfEnabled(currentSession);

      if (!requiresMfa) {
        setLoading(false);
        if (pendingSignInSuccessRef.current) {
          toast({ title: "Signed in successfully", description: "Welcome back!" });
          pendingSignInSuccessRef.current = false;
        }
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
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

    document.addEventListener("visibilitychange", handleTabReenter);
    window.addEventListener("focus", handleTabReenter);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleTabReenter);
      window.removeEventListener("focus", handleTabReenter);
    };
  }, [handleTabReenter]);

  const signUp = async (email: string, password: string, username?: string, fullName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
          data: { username, full_name: fullName || "", role: "panel_owner" },
        },
      });
      if (error) toast({ variant: "destructive", title: "Sign Up Error", description: error.message });
      else toast({ title: "Success", description: "Please check your email." });
      return { error };
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sign Up Error", description: err.message });
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
          toast({ variant: "destructive", title: "Sign In Error", description: "Username not found." });
          return { error: { message: "Username not found" } };
        }
        loginEmail = email;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });

      if (error) {
        if (error.message?.toLowerCase().includes("email not confirmed")) {
          return { error, emailNotVerified: true, email: loginEmail };
        }
        let msg = error.message;
        const lower = error.message.toLowerCase();
        if (lower.includes("invalid")) msg = "Invalid credentials.";
        else if (lower.includes("too many")) msg = "Too many attempts. Please wait.";
        toast({ variant: "destructive", title: "Sign In Failed", description: msg });
        return { error };
      }

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
      if (sess?.user) localStorage.removeItem(getMfaKey(sess.user.id, sess.refresh_token));
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
    [user, session, profile, loading],
  );

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
