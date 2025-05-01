import { api } from './config';
import { storage } from '../utils/storage';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ResetPasswordResponse {
  success: boolean;
  message?: string;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    if (data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    storage.set('token', response.data.token);
    storage.set('user', response.data.user);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    if (data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    console.log('Register request data:', data);
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    console.log('Register response:', response.data);
    return response.data;
  },

  async logout(): Promise<void> {
    storage.remove('token');
    storage.remove('user');
  },

  getCurrentUser() {
    return storage.get('user');
  },

  isAuthenticated(): boolean {
    return !!storage.get('token');
  },

  resetPassword: async (email: string, newPassword: string): Promise<ResetPasswordResponse> => {
    try {
      const response = await api.post('/api/auth/reset-password', { email, newPassword });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}; 