// src/services/api.ts
import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // O Zustand salva tudo dentro de um JSON chamado 'auth-storage'
  const authStorageString = localStorage.getItem('auth-storage');
  
  if (authStorageString) {
    try {
      const authStorage = JSON.parse(authStorageString);
      // O Zustand coloca os seus dados dentro da propriedade 'state'
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