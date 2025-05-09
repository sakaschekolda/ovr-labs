import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';
import { AxiosError } from 'axios';
import { User } from '../../types';

// Configure axios
api.defaults.baseURL = 'http://localhost:5000';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  password: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    role: string;
    gender: 'male' | 'female' | 'other';
    birthDate: string;
  };
}

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  middleName: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<LoginResponse>('/api/auth/login', credentials);
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to login');
      }
      throw error;
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterData) => {
    try {
      console.log('Sending registration data:', data);
      const response = await api.post<LoginResponse>('/api/auth/register', data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Registration error response:', error.response?.data);
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          if (errors.email) {
            throw new Error(errors.email);
          }
          throw new Error(Object.values(errors)[0] as string);
        }
        throw new Error(error.response?.data?.message || 'Failed to register');
      }
      throw error;
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('token');
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: UpdateProfileData) => {
    try {
      const response = await api.put<{ data: User }>('/api/profile', data);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update profile');
      }
      throw error;
    }
  }
); 