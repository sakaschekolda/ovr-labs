import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('API URL:', API_URL); // Добавляем логирование для отладки

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем интерцептор для автоматического добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Добавляем интерцептор для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response); // Добавляем логирование для отладки
    return response;
  },
  (error) => {
    console.error('API Error:', error); // Добавляем логирование для отладки
    if (error.response?.status === 401) {
      // Очищаем токен, но не перенаправляем
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token_expiry');
    }
    return Promise.reject(error);
  }
); 