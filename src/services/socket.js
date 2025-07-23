// src/services/socket.js
import { Socket, Presence } from "phoenix"; // <-- Importa Presence aqui!

// Variável para armazenar a instância única do socket
let phoenixSocketInstance = null;

const setupPhoenixSocket = (userId, token) => {
  // Se já existe uma instância, retorne-a para garantir um único socket
  if (phoenixSocketInstance) {
    return phoenixSocketInstance;
  }

  const socketUrl = `ws://localhost:4000/socket`;

  const socketOptions = {
    params: {
      user_id: userId,
      token: token || "", // Garante que seja uma string
      vsn: "2.0.0"
    },
    reconnectAfterMs: (tries) => [1000, 3000, 5000, 10000][tries - 1] || 10000,
    logger: (kind, msg, data) => {
      const colorMap = {
        'open': '#4CAF50', 'error': '#F44336', 'close': '#FF9800',
        'socket': '#2196F3', 'channel': '#9C27B0', 'push': '#00BCD4',
        'receive': '#CDDC39'
      };
      const color = colorMap[kind] || '#000000';
      console.log(`%cSocket ${kind}: ${msg}`, `color: ${color}; font-weight: bold;`, data);
    },
    timeout: 30000,
    heartbeatIntervalMs: 20000
  };

  const socket = new Socket(socketUrl, socketOptions);

  socket.onOpen(() => {
    console.log("%c✅ Phoenix Socket conectado", 'color: #4CAF50; font-weight: bold;');
  });

  socket.onError((error) => {
    console.error("%c❌ Erro no Socket:", 'color: #F44346; font-weight: bold;', error);
  });

  socket.onClose((event) => {
    console.log(
      `%c⚠️ Socket desconectado (Código: ${event.code})`,
      'color: #FF9800; font-weight: bold;',
      event
    );
  });

  try {
    socket.connect();
    phoenixSocketInstance = socket;
  } catch (error) {
    console.error("%c⛔ Falha crítica ao conectar:", 'color: #F44346; font-weight: bold;', error);
    throw error;
  }

  return socket;
};

// **Exporta setupPresence como um named export**
export const setupPresence = (channel, onUpdateCallback) => {
    let presence = new Presence(channel);

    presence.onSync(() => {
        let presences = [];
        presence.list((id, { metas: [first, ...rest] }) => {
            presences.push({
                id: id,
                user_id: id,
                name: first.user_name || `Utilizador ${id}`,
                avatar: first.user_avatar || '',
                micOn: first.mic_on === true,
                videoOn: first.video_on === true,
                isHost: first.is_host === true
            });
        });
        onUpdateCallback(presences, presence.state);
    });

    return presence;
};

// Exporta setupPhoenixSocket como default
export default setupPhoenixSocket;