// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para verificar se a resposta é válida
api.interceptors.response.use(
  (response) => {
    try {
      // Verifica se os dados da resposta são um JSON válido
      if (response.data && typeof response.data === 'object') {
        return response;
      } else {
        return Promise.reject(new Error('Resposta inválida da API'));
      }
    } catch (error) {
      console.error('Erro ao analisar a resposta da API:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Erro na resposta da API:', error);
    return Promise.reject(error);
  }
);

export default api;
