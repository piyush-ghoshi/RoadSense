import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isVerified = localStorage.getItem('authorityVerified') === 'true';
  
  if (!isVerified) {
    // Redirect to authority login if not verified
    return <Navigate to="/authority-login" replace />;
  }

  return <>{children}</>;
}
