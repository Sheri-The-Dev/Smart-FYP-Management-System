import { createContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      
      if (response.success) {
        const { token: newToken, user: userData } = response.data;
        
        // Store in localStorage
        localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        
        // Update state
        setToken(newToken);
        setUser(userData);
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and storage
      setToken(null);
      setUser(null);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'Administrator';
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};