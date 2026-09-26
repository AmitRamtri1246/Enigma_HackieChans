// Base URL is empty because Vite proxies /api to the backend
const API_BASE = '';

export interface ApiError {
  detail: string;
}

export class ApiRequestError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: 'An unexpected error occurred.' }));
    throw new ApiRequestError(response.status, body.detail || 'An unexpected error occurred.');
  }
  
  // Handle 204 No Content
  if (response.status === 204) return undefined as T;
  return response.json();
}
