// src/services/api.ts
import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Dados salvos pelo Zustand em 'auth-storage'
  const authStorageString = localStorage.getItem('auth-storage');
  
  if (authStorageString) {
    try {
      const authStorage = JSON.parse(authStorageString);
      // Dados persistidos dentro de 'state'
      const token = authStorage?.state?.token; 
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Erro ao ler token do storage", e);
    }
  }
  
  return config;
});
