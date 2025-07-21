import { Socket } from "phoenix";
import { Presence } from "phoenix";

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
      // O vsn pode ser omitido aqui, Phoenix.js geralmente adiciona
      // mas não há problema em tê-lo.
      vsn: "2.0.0"
    },
    // Removido: transport: WebSocket (Phoenix.js usa o global WebSocket por padrão)
    reconnectAfterMs: (tries) => [1000, 3000, 5000, 10000][tries - 1] || 10000,
    logger: (kind, msg, data) => {
      // Use cores diferentes para cada tipo de log para facilitar a leitura
      const colorMap = {
        'open': '#4CAF50', // Verde
        'error': '#F44336', // Vermelho
        'close': '#FF9800', // Laranja
        'socket': '#2196F3', // Azul (para logs gerais do socket)
        'channel': '#9C27B0', // Roxo (para logs de canal)
        'push': '#00BCD4', // Ciano (para push de mensagens)
        'receive': '#CDDC39' // Lima (para mensagens recebidas)
      };
      const color = colorMap[kind] || '#000000'; // Default black
      console.log(`%cSocket ${kind}: ${msg}`, `color: ${color}; font-weight: bold;`, data);
    },
    timeout: 30000, // Tempo limite para o join do canal
    heartbeatIntervalMs: 20000 // Intervalo para enviar heartbeats para manter a conexão viva
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
    // Não é necessário chamar socket.connect() aqui, pois o Phoenix.js lida com reconexão automaticamente
    // Se você *quiser* um comportamento de reconexão customizado, você pode reativar isso.
    // Mas o `reconnectAfterMs` nas opções do Socket já lida com a reconexão automática.
  });

  try {
    socket.connect();
    // Armazena a instância para reutilização
    phoenixSocketInstance = socket;
  } catch (error) {
    console.error("%c⛔ Falha crítica ao conectar:", 'color: #F44346; font-weight: bold;', error);
    throw error;
  }

  return socket;
};

// Adicione esta função ao seu socket.js
export function connectToUserChannel(userId, onNotification) {
  console.log("Token enviado para o socket:", localStorage.getItem("auth_token"));
  const socket = new Socket("ws://localhost:4000/socket", {
    params: { token: localStorage.getItem("auth_token") }
  });

  socket.connect();

  const channel = socket.channel(`user:${userId}`, {});

  channel.on("new_notification", payload => {
    onNotification(payload.notification);
  });

  channel.join()
    .receive("ok", resp => { console.log("Conectado ao canal de notificações", resp); })
    .receive("error", resp => { console.error("Erro ao conectar ao canal", resp); });

  return channel;
}

// Função utilitária para gerenciar Presence em um canal
export function setupPresence(channel, onUpdate) {
  let presence = new Presence(channel);

  function syncState(state) {
    console.log("[PRESENCE] (setupPresence) state recebido:", state);
    let list = [];
    if (state && typeof state === 'object') {
      list = Object.entries(state).map(([id, { metas }]) => ({
        id,
        name: metas && metas[0] && metas[0].name ? metas[0].name : id,
      }));
    }
    console.log("[PRESENCE] (setupPresence) Array convertido:", list);
    onUpdate(list, state);
  }

  presence.onSync(() => {
    syncState(presence.state);
  });

  // Inicializa imediatamente
  syncState(presence.state);

  return presence;
}

// Converte o objeto de presenças em uma lista de participantes
function presencesToList(presences) {
  return Presence.list(presences, (id, { metas }) => ({
    id,
    name: metas[0].name
  }));
}

export default setupPhoenixSocket;