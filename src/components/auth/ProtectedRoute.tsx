import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'panel_owner';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  // TODO: TEMPORARY - Remove this bypass before production!
  // Bypassing auth for development purposes
  const DEV_BYPASS_AUTH = true;
  
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Skip all auth checks if bypass is enabled
  if (DEV_BYPASS_AUTH) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect based on user's actual role
    switch (profile?.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'panel_owner':
        // Check if panel owner has completed onboarding
        if (location.pathname.startsWith('/panel') && !location.pathname.includes('/onboarding')) {
          // Check if they have a panel with completed onboarding
          const hasCompletedOnboarding = profile?.panels?.some((panel: any) => panel.onboarding_completed);
          if (!hasCompletedOnboarding) {
            return <Navigate to="/panel/onboarding" replace />;
          }
        }
        return <Navigate to="/panel" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}