import { apiRequest } from './api';

export interface User {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  register: (data: RegisterData) =>
    apiRequest<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  login: (data: LoginData) =>
    apiRequest<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  logout: () =>
    apiRequest<void>('/api/auth/logout', {
      method: 'POST',
    }),
  
  getCurrentUser: () =>
    apiRequest<User>('/api/auth/me'),
};
