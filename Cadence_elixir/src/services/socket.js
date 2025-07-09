import { Socket } from "phoenix";

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

export default setupPhoenixSocket;