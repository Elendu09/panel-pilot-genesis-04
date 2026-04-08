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

  const sessionRef = useRef<Session | null>(null);
  const userRef = useRef<User | null>(null);
  const initializedRef = useRef(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
      if (error) throw error;

      if (data && (!data.role || !data.username)) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const metadata = authUser?.user_metadata || {};
        const updates: Record<string, any> = {};

        if (!data.role) updates.role = metadata.role || "panel_owner";
        if (!data.username) {
          const emailPrefix = (data.email || "").split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
          const namePrefix = (metadata.full_name || "").replace(/\s+/g, "").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
          updates.username = namePrefix || emailPrefix || `user_${Date.now().toString(36)}`;
        }
        if (!data.full_name && metadata.full_name) updates.full_name = metadata.full_name;
        if (!data.avatar_url && metadata.avatar_url) updates.avatar_url = metadata.avatar_url;

        if (Object.keys(updates).length > 0) {
          const { data: updated } = await supabase.from("profiles").update(updates).eq("user_id", userId).select("*").single();
          if (updated) { setProfile(updated); return updated; }
        }
      }

      setProfile(data);

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
      const { error } = await supabase.from("panels").insert([{
        name: panelName,
        owner_id: ownerId,
        status: "active" as const,
        is_approved: true,
        theme_type: "dark_gradient" as const,
        subdomain: panelName.toLowerCase().replace(/[^a-zA-Z0-9]/g, "").substring(0, 20) || "panel",
      }]);
      if (error) throw error;
      toast({ title: "Panel Created", description: "Your subdomain is live now. Configure services to start selling." });
    } catch (err) {
      console.error("Error creating panel:", err);
      toast({ variant: "destructive", title: "Panel Creation Error", description: "Failed to create your panel. Please contact support." });
    }
  };

  const refreshProfile = async () => {
    if (userRef.current) await fetchProfile(userRef.current.id);
  };

  const enforceMfaIfEnabled = async (sess: Session) => {
    const u = sess.user;
    if (!u) return;
    const { data: mfaStatus } = await supabase.functions.invoke("mfa-setup", { body: { action: "status" } });
    const enabled = !!mfaStatus?.enabled;
    if (!enabled) { setNeedsMfaChallenge(false); return; }
    const key = getMfaKey(u.id, sess.refresh_token);
    const alreadyVerified = isMfaMarkedVerified(key);
    setNeedsMfaChallenge(!alreadyVerified);
  };

  const handleMfaVerified = () => {
    const sess = sessionRef.current;
    if (sess?.user) {
      const key = getMfaKey(sess.user.id, sess.refresh_token);
      markMfaVerified(key);
    }
    setNeedsMfaChallenge(false);

    // Show welcome back toast on successful MFA
    toast({ title: "Welcome back! 🎉", description: "Two-factor authentication verified successfully." });

    if (sessionRef.current?.user?.id) {
      fetchProfile(sessionRef.current.user.id);
    }
  };

  const handleMfaCancelled = async () => {
    try { await supabase.auth.signOut(); } catch {}
    setNeedsMfaChallenge(false);
    setUser(null);
    setSession(null);
    setProfile(null);
    const sess = sessionRef.current;
    if (sess?.user) {
      const key = getMfaKey(sess.user.id, sess.refresh_token);
      localStorage.removeItem(key);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      sessionRef.current = currentSession;
      userRef.current = currentSession?.user ?? null;

      if (!currentSession?.user) {
        setProfile(null);
        setNeedsMfaChallenge(false);
        setLoading(false);
        return;
      }

      // TOKEN_REFRESHED after init: silently refresh without loading spinner
      if (event === "TOKEN_REFRESHED" && initializedRef.current) {
        // Silently refresh profile + MFA in background — no loading state
        fetchProfile(currentSession.user.id).catch(() => {});
        enforceMfaIfEnabled(currentSession).catch((e) => {
          console.error("Silent MFA check failed:", e);
        });
        return;
      }

      // For SIGNED_IN or initial events, show loading
      setLoading(true);
      await fetchProfile(currentSession.user.id);
      try {
        await enforceMfaIfEnabled(currentSession);
      } catch (e) {
        console.error("enforceMfaIfEnabled failed:", e);
        setNeedsMfaChallenge(false);
      }
      setLoading(false);
    });

    // Initial restore
    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      if (initializedRef.current) return; // guard double-init
      
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
      
      initializedRef.current = true;
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (email: string, password: string, username?: string, fullName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
          data: { username, full_name: fullName || "", role: "panel_owner" },
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
      if (!identifier.includes("@")) {
        const { data: email, error: lookupError } = await supabase.rpc("lookup_email_by_username", { p_username: identifier.trim() });
        if (lookupError || !email) {
          toast({ variant: "destructive", title: "Sign In Error", description: "Username not found. Please check and try again." });
          return { error: { message: "Username not found" } };
        }
        loginEmail = email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (error) {
        if (error.message?.toLowerCase().includes("email not confirmed") || error.message?.toLowerCase().includes("email_not_confirmed")) {
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
      return { error };
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sign In Error", description: err.message });
      return { error: err };
    }
  };

  const signOut = async () => {
    try { await supabase.auth.signOut(); } finally {
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

  const value: AuthContextType = useMemo(() => ({
    user, session, profile, loading, signUp, signIn, signOut, refreshProfile,
  }), [user, session, profile, loading]);

  return (
    <AuthContext.Provider value={value}>
      {needsMfaChallenge ? (
        <TwoFactorChallenge open={true} onVerified={handleMfaVerified} onCancel={handleMfaCancelled} />
      ) : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
