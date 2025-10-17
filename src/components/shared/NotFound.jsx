import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * NotFound component for handling invalid routes
 * Requirements: 1.4, 1.5 - Route handling and navigation
 */
const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();

  const handleGoHome = () => {
    if (isAuthenticated) {
      const redirectPath = userRole === 'coach' ? '/coach' : '/player';
      navigate(redirectPath, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <button
          onClick={handleGoHome}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
        </button>
      </div>
    </div>
  );
};

export default NotFound;