// src/services/conversations.js
// Simulação de dados de mensagens para diferentes comunidades
const mockCommunityMessages = {
  '1': [ // Comunidade ID '1'
    { id: 'msg1', from: 'user123', text: 'Olá a todos! Como estão hoje?', timestamp: '2025-07-20T10:00:00Z' },
    { id: 'msg2', from: 'agent456', text: 'Bem-vindos ao chat da comunidade! Sintam-se à vontade para partilhar.', timestamp: '2025-07-20T10:01:00Z' },
    { id: 'msg3', from: 'user789', text: 'Estou a ter um dia difícil, mas este grupo ajuda muito.', timestamp: '2025-07-20T10:05:00Z' },
    { id: 'msg4', from: 'user123', text: 'Força! Estamos aqui para apoiar.', timestamp: '2025-07-20T10:06:00Z' },
  ],
  '2': [ // Comunidade ID '2'
    { id: 'msgA', from: 'clinicAdmin', text: 'Bem-vindos à comunidade da Clínica Geral! Podem colocar as vossas questões aqui.', timestamp: '2025-07-19T09:00:00Z' },
    { id: 'msgB', from: 'user123', text: 'Olá! Tenho uma dúvida sobre os horários de atendimento.', timestamp: '2025-07-19T09:10:00Z' },
  ],
  // Adicione mais comunidades e mensagens simuladas conforme necessário
};

export const fetchCommunityMessages = async (communityId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Retorna as mensagens para o communityId fornecido, ou um array vazio se não existir
      resolve(mockCommunityMessages[communityId] || []);
    }, 500); // Simula um atraso de rede
  });
};

export const sendCommunityMessage = async (communityId, message) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!mockCommunityMessages[communityId]) {
        mockCommunityMessages[communityId] = [];
      }
      // Simula a adição da mensagem e atribui um ID "real"
      const newMessage = { ...message, id: `msg-${Date.now()}` };
      mockCommunityMessages[communityId].push(newMessage);
      resolve(newMessage);
    }, 300); // Simula um atraso de rede
  });
};

// As funções fetchMessages e sendMessage originais de Conversations.jsx
// Se Conversations.jsx ainda existir e usar estas funções, pode mantê-las.
// Caso contrário, pode removê-las se o Conversations.jsx for substituído.
export const fetchMessages = async () => {
  // Esta função pode ser removida se Conversations.jsx for totalmente substituído
  // ou adaptada para buscar conversas gerais, não de comunidade.
  console.warn("fetchMessages (geral) chamado. Considere usar fetchCommunityMessages.");
  return []; // Retorna vazio ou dados simulados gerais
};

export const sendMessage = async (text) => {
  // Esta função pode ser removida se Conversations.jsx for totalmente substituído
  console.warn("sendMessage (geral) chamado. Considere usar sendCommunityMessage.");
  return { id: `temp-${Date.now()}`, from: 'user', text, timestamp: new Date().toISOString() };
};