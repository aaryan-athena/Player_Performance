import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Badge } from '../ui/index.js';

/**
 * Navigation component with role-specific options and logout functionality
 * Requirements: 8.1, 8.2 - Modern UI with responsive navigation
 */
const Navigation = () => {
  const { userData, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Don't show navigation on home page (auth page)
  if (!isAuthenticated || location.pathname === '/') {
    return null;
  }

  const isCoach = userData?.role === 'coach';
  const isPlayer = userData?.role === 'player';

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <span className="hidden sm:inline">Sports Performance Tracker</span>
                <span className="sm:hidden">SPT</span>
              </h1>
            </div>
            
            {/* Role Badge */}
            <div className="hidden sm:block">
              <Badge 
                variant={isCoach ? 'success' : 'primary'} 
                size="sm"
              >
                {userData?.role?.charAt(0).toUpperCase() + userData?.role?.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
            {/* {isCoach && (
              <Button
                variant={location.pathname === '/coach' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => navigate('/coach')}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                Dashboard
              </Button>
            )}
            
            {isPlayer && (
              <Button
                variant={location.pathname === '/player' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => navigate('/player')}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Dashboard
              </Button>
            )} */}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* User Info */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {userData?.name}
                </div>
                <div className="text-xs text-gray-500">
                  {isPlayer && userData?.sport && (
                    <span className="capitalize">{userData.sport} Player</span>
                  )}
                  {isCoach && <span>Coach</span>}
                </div>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              loading={isLoggingOut}
              className="hidden sm:flex"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg className="block h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="px-4 pt-4 pb-6 space-y-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{userData?.name}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge 
                      variant={isCoach ? 'success' : 'primary'} 
                      size="sm"
                    >
                      {userData?.role?.charAt(0).toUpperCase() + userData?.role?.slice(1)}
                    </Badge>
                    {isPlayer && userData?.sport && (
                      <Badge variant="info" size="sm" className="capitalize">
                        {userData.sport}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Links Mobile */}
              <div className="space-y-2">
                {isCoach && (
                  <Button
                    variant={location.pathname === '/coach' ? 'primary' : 'ghost'}
                    size="md"
                    onClick={() => {
                      navigate('/coach');
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                    Coach Dashboard
                  </Button>
                )}
                
                {isPlayer && (
                  <Button
                    variant={location.pathname === '/player' ? 'primary' : 'ghost'}
                    size="md"
                    onClick={() => {
                      navigate('/player');
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Player Dashboard
                  </Button>
                )}
                
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  disabled={isLoggingOut}
                  loading={isLoggingOut}
                  className="w-full justify-start"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;