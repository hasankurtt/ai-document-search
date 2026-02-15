export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  emoji: string;
  document_count: number;
  message_count: number;
  created_at: string;
}

export interface DocumentFile {
  id: string;
  filename: string;
  uploaded_at: string;
  processed: boolean;
}

export interface Source {
  filename: string;
  page?: number;
}

export interface Message {
  id?: string;
  message_type: 'user' | 'ai';
  content: string;
  sources?: Source[];
  timestamp?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}