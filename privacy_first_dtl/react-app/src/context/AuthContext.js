import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userJson = localStorage.getItem('user');
        
        if (token && userJson) {
          const parsedUser = JSON.parse(userJson);
          setUser(parsedUser);
          
          // Verify token is still valid
          try {
            await authService.verifyToken();
          } catch (err) {
            // Token expired
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      const { token, user: returnedUser } = response.data || response;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(returnedUser));
      setUser(returnedUser);
      
      return returnedUser;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      const { token, user: returnedUser } = response.data || response;
      
      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(returnedUser));
        setUser(returnedUser);
      }
      
      return returnedUser;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    userRole: user?.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
