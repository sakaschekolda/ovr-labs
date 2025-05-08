import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';
import { setAuth, clearAuth } from './authSlice';

function mapErrorToRussian(message: string) {
  if (!message) return 'Произошла ошибка';
  if (message.includes('Invalid credentials')) return 'Неверный email или пароль';
  if (message.includes('User already exists')) return 'Пользователь с таким email уже существует';
  if (message.includes('Validation failed')) return 'Ошибка валидации данных';
  if (message.includes('Password must be at least')) return 'Пароль должен быть не менее 8 символов';
  if (message.includes('Passwords do not match')) return 'Пароли не совпадают';
  if (message.includes('Email is required')) return 'Введите email';
  return message;
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      dispatch(setAuth(response.data));
      return response.data;
    } catch (error: any) {
      // Логируем ошибку для отладки
      console.error('Login error:', error.response?.data);
      const data = error.response?.data;
      let message = 'Ошибка входа';
      if (data?.errors && typeof data.errors === 'object') {
        message = Object.values(data.errors).join(', ');
      } else if (data?.message) {
        message = data.message;
      } else if (error.response?.status === 401) {
        message = 'Неверный email или пароль';
      }
      return rejectWithValue(mapErrorToRussian(message));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error: any) {
      let message = error.response?.data?.message || 'Ошибка регистрации';
      if (error.response?.data?.errors && typeof error.response.data.errors === 'object') {
        message = Object.values(error.response.data.errors).join(', ');
      }
      return rejectWithValue(mapErrorToRussian(message));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    dispatch(clearAuth());
  }
); 