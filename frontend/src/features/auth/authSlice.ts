import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loginUser, registerUser, logoutUser, updateProfile } from './authThunks';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  role: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

// Получаем начальное состояние из localStorage
const getInitialState = (): AuthState => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return {
    user,
    token,
    isAuthenticated: !!(token && user),
    isLoading: false,
    isError: false,
    errorMessage: null
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setAuth: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isError = false;
      state.errorMessage = null;
      
      // Сохраняем в localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isError = false;
      state.errorMessage = null;
      
      // Очищаем localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setError: (state, action: PayloadAction<string>) => {
      state.isError = true;
      state.errorMessage = action.payload;
    },
    clearError: (state) => {
      state.errorMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        console.log('Login fulfilled, user data:', action.payload.user);
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.errorMessage = null;
        
        // Сохраняем в localStorage
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.errorMessage = action.error.message || 'An error occurred during login';
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.errorMessage = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.error.message || 'An error occurred during registration';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.errorMessage = null;
        
        // Очищаем localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.errorMessage = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.error.message || 'An error occurred during profile update';
      });
  }
});

export const { setAuth, clearAuth, setError, clearError } = authSlice.actions;
export default authSlice.reducer; 