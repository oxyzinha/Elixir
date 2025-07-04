// src/socket.js
import { Socket } from "phoenix";

/**
 * Configura e retorna uma instância do Phoenix Socket.
 * Esta função deve ser chamada apenas uma vez para o socket global da aplicação.
 *
 * @param {string} userId - O ID do usuário autenticado.
 * @param {string} token - O token de autenticação do usuário.
 * @returns {Socket} A instância do Phoenix Socket.
 */
const setupPhoenixSocket = (userId, token) => {
  // CORRIGIDO: Agora a URL aponta para a porta do seu backend Elixir (4000).
  // O Phoenix.js vai automaticamente adicionar '/websocket' e lidar com ws:// ou wss://
  const socket = new Socket("ws://localhost:4000/socket", { // <--- AQUI ESTÁ A MUDANÇA
    params: { token: token, user_id: userId } // Estes parâmetros são enviados para o connect/3 do seu UserSocket no Elixir
  });

  socket.connect(); // Inicia a conexão WebSocket

  // Opcional: Adicionar listeners globais para o socket
  socket.onOpen(() => console.log("Phoenix Socket conectado com sucesso!"));
  socket.onError((error) => console.error("Phoenix Socket erro:", error));
  socket.onClose(() => console.log("Phoenix Socket desconectado."));

  return socket;
};

export default setupPhoenixSocket;