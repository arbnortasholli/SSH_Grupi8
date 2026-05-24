import { useEffect, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import authService from 'utils/authService';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
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

  return <>{children}</>;
}
