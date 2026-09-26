import { apiRequest } from './api';

import type { TraceRole } from "./onboarding";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: TraceRole;
  created_at: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  role: TraceRole;
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
