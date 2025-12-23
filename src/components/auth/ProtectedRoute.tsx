import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'panel_owner';
  redirectTo?: string;
}

const LAST_PANEL_ROUTE_KEY = 'smmpilot_last_panel_route';

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Save current panel route for restoration after login
  useEffect(() => {
    if (user && location.pathname.startsWith('/panel')) {
      localStorage.setItem(LAST_PANEL_ROUTE_KEY, location.pathname);
    }
  }, [user, location.pathname]);

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
        return <Navigate to="/panel" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}