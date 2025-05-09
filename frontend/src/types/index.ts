export interface User {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  role: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
} 