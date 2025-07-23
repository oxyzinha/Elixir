// src/lib/authContext.jsx
// Função de registro de usuário
export async function registerUser(username, email, password) {
  const response = await apiFetch('/api/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response;
}
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/services/api';

// Funções de autenticação
// ALTERADO: Agora aceita 'email' em vez de 'username' para o login
export async function loginUser(email, password) {
  const response = await apiFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }), // <-- ALTERADO AQUI: envia 'email'
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.token) {
    localStorage.setItem('auth_token', response.token);
  }
  return response;
}

export function logoutUser() {
  localStorage.removeItem('auth_token');
}

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// Contexto global
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}