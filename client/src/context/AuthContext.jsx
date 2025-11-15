import { createContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // ============================================
  // INITIALIZE AUTH STATE FROM LOCALSTORAGE
  // ============================================
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          console.log('✅ Auth initialized from localStorage');
        } else {
          console.log('ℹ️ No stored auth data found');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ============================================
  // LOGIN FUNCTION
  // ============================================
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
        
        console.log('✅ User logged in successfully:', userData.username);
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    }
  };

  // ============================================
  // LOGOUT FUNCTION
  // ============================================
  const logout = async () => {
    try {
      await authService.logout();
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Clear state and storage
      setToken(null);
      setUser(null);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  };

  // ============================================
  // CRITICAL FIX: UPDATE USER DATA
  // This function is crucial for updating profile picture and other user data
  // It updates both the state and localStorage to maintain consistency
  // ============================================
  const updateUser = (updatedUserData) => {
    if (!user) {
      console.warn('⚠️ Cannot update user: No user logged in');
      return;
    }

    // Merge the updated data with existing user data
    const newUserData = { 
      ...user, 
      ...updatedUserData 
    };
    
    // Update state (this triggers re-render in all components using useAuth)
    setUser(newUserData);
    
    // Update localStorage for persistence
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUserData));
    
    console.log('✅ User data updated:', Object.keys(updatedUserData).join(', '));
    
    // Debug log for profile picture updates
    if (updatedUserData.profile_picture !== undefined) {
      console.log('🖼️ Profile picture updated:', updatedUserData.profile_picture || 'removed');
    }
  };

  // ============================================
  // CHECK IF USER IS AUTHENTICATED
  // ============================================
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // ============================================
  // CHECK IF USER HAS SPECIFIC ROLE
  // ============================================
  const hasRole = (role) => {
    return user?.role === role;
  };

  // ============================================
  // CHECK IF USER IS ADMIN
  // ============================================
  const isAdmin = () => {
    return user?.role === 'Administrator';
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,        // CRITICAL: This must be included in the context
    isAuthenticated,
    hasRole,
    isAdmin
  };

  // ============================================
  // DEBUG: Log when user state changes
  // ============================================
  useEffect(() => {
    if (user) {
      console.log('👤 Current user:', {
        username: user.username,
        role: user.role,
        profile_picture: user.profile_picture || 'none'
      });
    }
  }, [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};