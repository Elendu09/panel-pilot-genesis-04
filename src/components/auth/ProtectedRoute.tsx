import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'panel_owner';
  redirectTo?: string;
}

const LAST_PANEL_ROUTE_KEY = 'homeofsmm_last_panel_route';
const PROFILE_TIMEOUT_MS = 5000;

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, profile, loading, refreshProfile } = useAuth();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);
  const [fallbackProfile, setFallbackProfile] = useState<any>(null);
  const retryAttempted = useRef(false);

  // Save current panel route for restoration after login
  useEffect(() => {
    if (user && location.pathname.startsWith('/panel')) {
      localStorage.setItem(LAST_PANEL_ROUTE_KEY, location.pathname);
    }
  }, [user, location.pathname]);

  // Timeout fallback: if user exists but profile is stuck null for 5s
  useEffect(() => {
    if (!user || profile || loading) {
      setTimedOut(false);
      retryAttempted.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      if (!retryAttempted.current) {
        retryAttempted.current = true;
        // Try one more profile fetch
        try {
          await refreshProfile();
        } catch {
          // ignore
        }
        // If still no profile after retry, create a minimal fallback
        setTimeout(() => {
          if (!profile) {
            // Last resort: fetch directly
            supabase.from("profiles").select("*").eq("user_id", user.id).single()
              .then(({ data }) => {
                if (data) {
                  setFallbackProfile(data);
                } else {
                  // Absolute fallback - minimal profile to prevent infinite loading
                  setFallbackProfile({ role: 'panel_owner', id: user.id, user_id: user.id });
                }
                setTimedOut(true);
              })
              .catch(() => {
                setFallbackProfile({ role: 'panel_owner', id: user.id, user_id: user.id });
                setTimedOut(true);
              });
          }
        }, 2000);
      }
    }, PROFILE_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [user, profile, loading]);

  const activeProfile = profile || (timedOut ? fallbackProfile : null);

  // Show loading spinner while auth state is being determined
  if (loading || (user && !activeProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole && activeProfile?.role !== requiredRole) {
    switch (activeProfile?.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'panel_owner':
        return <Navigate to="/panel" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
