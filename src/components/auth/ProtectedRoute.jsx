import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { RouteLoader } from '../shared/index.js';

/**
 * ProtectedRoute component for role-based route protection
 * Requirements: 1.4, 1.5, 1.7 - Authentication-based access control and loading states
 */
const ProtectedRoute = ({ children, requiredRole = null, requireAuth = true }) => {
  const { isAuthenticated, userRole, loading, userData } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <RouteLoader message="Checking authentication..." />;
  }

  // Redirect to home if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Redirect authenticated users away from auth pages
  if (!requireAuth && isAuthenticated) {
    // Get the intended destination from state, or default based on role
    const from = location.state?.from?.pathname;
    let redirectPath;
    
    if (from && from !== '/') {
      // Validate the intended destination based on user role
      if (userRole === 'coach' && from === '/coach') {
        redirectPath = '/coach';
      } else if (userRole === 'player' && from === '/player') {
        redirectPath = '/player';
      } else {
        // Default redirect based on role
        redirectPath = userRole === 'coach' ? '/coach' : '/player';
      }
    } else {
      // Default redirect based on role
      redirectPath = userRole === 'coach' ? '/coach' : '/player';
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  // Check role-based access for protected routes
  if (requireAuth && requiredRole && userRole !== requiredRole) {
    // Show access denied for wrong role, but redirect to correct dashboard
    const correctPath = userRole === 'coach' ? '/coach' : '/player';
    return <Navigate to={correctPath} replace />;
  }

  // Additional check: ensure user data is loaded for protected routes
  if (requireAuth && isAuthenticated && !userData) {
    return <RouteLoader message="Loading user data..." />;
  }

  return children;
};

export default ProtectedRoute;