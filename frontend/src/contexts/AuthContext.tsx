/**
 * AuthContext
 * 
 * Global authentication state management using React Context API.
 * 
 * Why Context instead of Redux?
 * - MVP scope: Only one source of truth (auth state)
 * - Redux adds complexity (actions, reducers, dispatch)
 * - Context is built into React, requires no external library
 * - Easier for junior developers to understand
 * 
 * Mental model: Think of AuthContext as the museum's "ID check system"
 * - It knows who each visitor is
 * - It remembers if they're logged in
 * - All pages can ask "is this person authenticated?" by using useAuth hook
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authLogin, authSignup, getErrorMessage } from '../utils/apiService';

/**
 * AuthUser: Represents a logged-in user
 * Only includes data we need to check auth status + UI personalization
 * We don't store passwords or sensitive info here
 */
interface AuthUser {
  id: string;
  email: string;
  name: string;
  isCreator: boolean; // true = can access creator dashboard
}

/**
 * AuthContextType: Everything the auth system provides to components
 */
interface AuthContextType {
  user: AuthUser | null; // null = not logged in
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
    options?: { isCreator?: boolean; preferredStyles?: string[]; creatorStyle?: string }
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

/**
 * Create the context object
 * All components that use useAuth() will read from this context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * Wraps your entire app and manages authentication state
 * 
 * Usage: In main.tsx, wrap <App /> with <AuthProvider>
 * 
 * Data flow:
 * 1. Component calls useAuth() hook
 * 2. Hook accesses AuthContext value
 * 3. Context provides current user, isAuthenticated, login/logout functions
 * 4. When login() is called, state updates → component re-renders
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State: Keep track of user, loading, and error states
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * useEffect: On app load, check if user has a stored session
   * 
   * Why? If user closed the browser and comes back, we want to remember them
   * We check localStorage for the auth token, then verify it's still valid
   * 
   * This runs ONCE when app mounts (empty dependency array [])
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Check for saved token in browser storage
        const token = localStorage.getItem('authToken');
        const userJson = localStorage.getItem('authUser');

        if (token && userJson) {
          // Token exists, restore user from cache
          const cachedUser = JSON.parse(userJson);
          setUser(cachedUser);
        }
      } catch (err) {
        // If there's any error restoring session, clear it
        // (storage corruption, etc)
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      } finally {
        // Loading is complete, whether session was restored or not
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * login: Authenticate user with email + password
   * 
   * Steps:
   * 1. Call backend API with credentials
   * 2. Backend returns JWT token + user info
   * 3. Store token and user in localStorage for future sessions
   * 4. Update React state → component re-renders
   * 5. App can now show protected pages (creator dashboard, etc)
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authLogin({ email, password });

      // Success! Store the token and user
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('authUser', JSON.stringify(response.user));

      // Update React state so app knows user is logged in
      setUser(response.user);
    } catch (err) {
      // API call failed - extract user-friendly error message
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err; // Re-throw so component can handle if needed
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * signup: Create new user account
   * Similar to login, but also takes user's name
   */
  const signup = async (
    email: string,
    password: string,
    name: string,
    options?: { isCreator?: boolean; preferredStyles?: string[]; creatorStyle?: string }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authSignup({
        email,
        password,
        name,
        isCreator: options?.isCreator,
        preferredStyles: options?.preferredStyles,
        creatorStyle: options?.creatorStyle,
      });

      // Success! Store token and auto-login
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('authUser', JSON.stringify(response.user));
      if (options?.preferredStyles?.length) {
        localStorage.setItem('preferredArtStyles', JSON.stringify(options.preferredStyles));
      }
      if (options?.creatorStyle) {
        localStorage.setItem('creatorStyle', options.creatorStyle);
      }

      setUser(response.user);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * logout: Clear user session
   * Called when user clicks "Logout" button
   * Clears both React state AND localStorage
   */
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
    setError(null);
  };

  /**
   * clearError: Allow components to dismiss error messages
   */
  const clearError = () => {
    setError(null);
  };

  // Prepare context value
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * 
 * Custom hook to access auth state from any component
 * 
 * Usage: 
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * This is much cleaner than importing AuthContext directly
 * and calling useContext(AuthContext) everywhere
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap your app with <AuthProvider> in main.tsx'
    );
  }

  return context;
};

export default AuthContext;
