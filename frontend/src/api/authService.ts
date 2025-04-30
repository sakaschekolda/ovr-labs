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

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    storage.set('token', response.data.token);
    storage.set('user', response.data.user);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
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
}; 