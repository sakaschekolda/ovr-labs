import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/config';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface TokenData {
  token: string;
  expiresIn: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TOKEN_KEY = 'token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const setToken = (tokenData: TokenData) => {
    const expiryDate = new Date().getTime() + tokenData.expiresIn * 1000;
    localStorage.setItem(TOKEN_KEY, tokenData.token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toString());
  };

  const getToken = (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) return null;
    
    const expiryDate = parseInt(expiry);
    if (new Date().getTime() > expiryDate) {
      clearToken();
      return null;
    }
    
    return token;
  };

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    setUser(null);
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      setToken({ token, expiresIn: 3600 });
      setUser(user);
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Произошла ошибка при входе';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.post('/api/auth/register', { name, email, password });
      const { token, user } = response.data;
      setToken({ token, expiresIn: 3600 });
      setUser(user);
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка при регистрации';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearToken();
      navigate('/');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 