// src/services/conversations.js
import { apiFetch } from './api';

export async function fetchMessages() {
  return apiFetch('/api/conversations');
}

export async function sendMessage(text) {
  return apiFetch('/api/conversations', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}
