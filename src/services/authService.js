import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';

/**
 * Authentication service for handling user registration, login, and logout
 */
class AuthService {
  /**
   * Register a new user with email, password, name, and role
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} name - User's full name
   * @param {string} role - User's role ('coach' or 'player')
   * @param {string} sport - Player's sport (required if role is 'player')
   * @returns {Promise<Object>} User object with role information
   */
  async register(email, password, name, role, sport = null) {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: name
      });

      // Create user document in Firestore with role and additional info
      const userData = {
        uid: user.uid,
        email: user.email,
        name: name,
        role: role,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add sport for players
      if (role === 'player' && sport) {
        userData.sport = sport;
      }

      await setDoc(doc(db, 'users', user.uid), userData);

      // If this is a player, check if there's a placeholder record to link
      if (role === 'player') {
        const { firestoreService } = await import('./firestoreService.js');
        await firestoreService.linkPlayerToUser(email, user.uid);
      }

      return {
        user: user,
        userData: userData
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} User object with role information
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore to include role information
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found. Please contact support.');
      }

      const userData = userDoc.data();

      return {
        user: user,
        userData: userData
      };
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user data including role information
   * @returns {Promise<Object|null>} User data or null if not authenticated
   */
  async getCurrentUserData() {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        return null;
      }

      return {
        user: user,
        userData: userDoc.data()
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Set up authentication state listener
   * @param {Function} callback - Callback function to handle auth state changes
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.exists() ? userDoc.data() : null;
          callback({ user, userData });
        } catch (error) {
          console.error('Error fetching user data:', error);
          callback({ user, userData: null });
        }
      } else {
        callback({ user: null, userData: null });
      }
    });
  }

  /**
   * Handle Firebase authentication errors and return user-friendly messages
   * @param {Error} error - Firebase error object
   * @returns {Error} Formatted error with user-friendly message
   */
  handleAuthError(error) {
    let message = 'An unexpected error occurred. Please try again.';

    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        message = 'Invalid password. Please try again.';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists.';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters long.';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection and try again.';
        break;
      default:
        message = error.message || message;
    }

    const formattedError = new Error(message);
    formattedError.code = error.code;
    return formattedError;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;