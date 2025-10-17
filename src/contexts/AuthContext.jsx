import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService.js';

/**
 * Authentication Context for managing global authentication state
 */
const AuthContext = createContext({
  user: null,
  userData: null,
  userRole: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isAuthenticated: false
});

/**
 * AuthProvider component that wraps the app and provides authentication state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up authentication state listener on component mount
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(({ user, userData }) => {
      setUser(user);
      setUserData(userData);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Login function that updates context state
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<void>}
   */
  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      // State will be updated by the auth state listener
      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register function that updates context state
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} name - User's full name
   * @param {string} role - User's role ('coach' or 'player')
   * @param {string} sport - Player's sport (optional, required for players)
   * @returns {Promise<void>}
   */
  const register = async (email, password, name, role, sport = null) => {
    try {
      const result = await authService.register(email, password, name, role, sport);
      // State will be updated by the auth state listener
      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout function that clears context state
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      await authService.logout();
      // State will be updated by the auth state listener
    } catch (error) {
      throw error;
    }
  };

  // Compute derived values
  const userRole = userData?.role || null;
  const isAuthenticated = !!user && !!userData;

  const value = {
    user,
    userData,
    userRole,
    loading,
    login,
    register,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use the authentication context
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;