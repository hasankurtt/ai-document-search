import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../constants';
import { AuthResponse, Room, User, DocumentFile, Message } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.hash = '#/';
    }
    return Promise.reject(error);
  }
);

// Helper to format error messages
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data as any;
    
    // Backend returns 'detail' field (FastAPI default)
    const backendMsg = data?.detail || data?.message;

    if (status === 429) return "Daily limit reached. Try again tomorrow.";
    if (status === 413) return "File too large. Maximum 2MB allowed.";
    if (status === 422) return "Invalid request. Please check your input.";
    if (backendMsg) return backendMsg;
    if (status === 404) return "Resource not found.";
    if (status === 500) return "Server error. Please try again later.";
  }
  return "An unexpected error occurred.";
};

export const authApi = {
  login: (data: any) => api.post<AuthResponse>('/auth/login', data),
  register: (data: any) => api.post<AuthResponse>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
};

export const roomApi = {
  getAll: () => api.get<Room[]>('/rooms'),
  create: (data: Partial<Room>) => api.post<Room>('/rooms', data),
  getOne: (id: string) => api.get<Room>(`/rooms/${id}`),
  update: (id: string, data: Partial<Room>) => api.put<Room>(`/rooms/${id}`, data),
  delete: (id: string) => api.delete(`/rooms/${id}`),
};

export const docApi = {
  upload: (roomId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/documents/upload/${roomId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: (roomId: string) => api.get<DocumentFile[]>(`/documents/room/${roomId}`),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export const chatApi = {
  sendMessage: (roomId: string, question: string) =>
    api.post<{ answer: string; sources: any[] }>(`/chat/${roomId}`, { question }),
  getHistory: (roomId: string) => api.get<Message[]>(`/chat/history/${roomId}`),
};