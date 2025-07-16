// src/services/api.js
// Serviço para consumir a API do backend

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }; console.log({token});
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    ...options,
    headers,
  });
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }
  return response.json();
}
