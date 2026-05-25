import { useEffect, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import authService from 'utils/authService';
import { CMS_ACCESS_ROLES, getDefaultCmsPath, hasAllowedRole } from 'config/roleAccess';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: readonly string[];
}

export default function ProtectedRoute({ children, allowedRoles = CMS_ACCESS_ROLES }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const expiresAt = localStorage.getItem('expiresAt');
    const expiresAtMs = expiresAt ? Date.parse(expiresAt) : null;

    if (expiresAtMs === null || Number.isNaN(expiresAtMs)) {
      return undefined;
    }

    const remainingMs = expiresAtMs - Date.now();
    if (remainingMs <= 0) {
      authService.logout();
      navigate('/login', { replace: true });
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      authService.logout();
      navigate('/login', { replace: true });
    }, remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [navigate]);

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = authService.getUser();
  if (!hasAllowedRole(user, allowedRoles)) {
    return <Navigate to={getDefaultCmsPath(user)} replace />;
  }

  return <>{children}</>;
}
