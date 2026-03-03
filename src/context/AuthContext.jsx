import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
          localStorage.setItem('auth_user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Initial auth check failed:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid email or password');
    }
  };

  const register = async (fullName, email, password, confirmPassword) => {
    try {
      const response = await api.post('/auth/register', { fullName, email, password, confirmPassword });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      localStorage.setItem('reset_email', email);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reset code');
    }
  };

  const verifyResetCode = async (code) => {
    const email = localStorage.getItem('reset_email');
    try {
      const response = await api.post('/auth/verify-code', { email, code });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid or expired verification code');
    }
  };

  const resetPassword = async (email, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { email, password: newPassword });
      localStorage.removeItem('reset_email');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const updateProfile = async (updatedData) => {
    try {
      const response = await api.put('/auth/profile', updatedData);
      const newUser = response.data;
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, requestPasswordReset, verifyResetCode, resetPassword, logout, updateProfile, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
