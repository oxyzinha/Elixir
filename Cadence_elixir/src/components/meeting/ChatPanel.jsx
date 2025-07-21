import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ChatMessage = ({ msg, isOwn, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: delay * 0.1, duration: 0.3 }}
    className={`chat-message p-3 rounded-lg max-w-xs mb-3 ${
      isOwn 
        ? 'ml-auto bg-blue-500 text-white' 
        : 'mr-auto bg-gray-700 text-gray-100'
    }`}
  >
    {!isOwn && (
      <p className="text-xs font-medium mb-1 opacity-80">{msg.sender_name}</p>
    )}
    <p className="text-sm break-words">{msg.body}</p>
    <p className="text-xs opacity-70 mt-1 text-right">
      {new Date(msg.timestamp || Date.now()).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })}
    </p>
  </motion.div>
);

const ChatPanel = ({ meetingChannel, currentUserId, currentUserName }) => {
  const { toast } = useToast();
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listener para mensagens recebidas em tempo real
  useEffect(() => {
    if (!meetingChannel) {
      console.log("[CHAT] Canal não disponível ainda");
      return;
    }

    console.log("[CHAT] Configurando listeners do canal, estado:", meetingChannel.state);

    // Listener para histórico de mensagens (quando entra na reunião)
    meetingChannel.on("chat_history", (payload) => {
      console.log("[CHAT] Histórico recebido:", payload.messages);
      const historyMessages = payload.messages.map(msg => ({
        id: msg.id || Date.now() + Math.random(),
        sender_id: msg.sender_id,
        sender_name: msg.sender_name,
        body: msg.body,
        timestamp: msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now(),
        isOwn: msg.sender_id === currentUserId
      }));
      setMessages(historyMessages);
    });

    // Listener para novas mensagens
    meetingChannel.on("new_msg", (payload) => {
      console.log("[CHAT] Nova mensagem recebida:", payload);
      const newMessage = {
        id: Date.now() + Math.random(),
        sender_id: payload.sender_id,
        sender_name: payload.sender_name,
        body: payload.body,
        timestamp: payload.timestamp ? new Date(payload.timestamp).getTime() : Date.now(),
        isOwn: payload.sender_id === currentUserId
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Notificação toast para mensagens de outros usuários
      if (payload.sender_id !== currentUserId) {
        toast({
          title: `Nova mensagem de ${payload.sender_name}`,
          description: payload.body,
          duration: 3000,
        });
      }
    });

    // Listener para usuário digitando
    meetingChannel.on("user_typing", (payload) => {
      if (payload.user_id !== currentUserId) {
        setIsTyping(true);
        // Para o indicador de digitação após 3 segundos
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    // Listener para usuário parou de digitar
    meetingChannel.on("user_stopped_typing", (payload) => {
      if (payload.user_id !== currentUserId) {
        setIsTyping(false);
      }
    });

    return () => {
      meetingChannel.off("chat_history");
      meetingChannel.off("new_msg");
      meetingChannel.off("user_typing");
      meetingChannel.off("user_stopped_typing");
    };
  }, [meetingChannel, currentUserId, currentUserName, toast]);

  // Função para enviar mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !meetingChannel || meetingChannel.state !== 'joined') {
      console.log("[CHAT] Não é possível enviar mensagem - canal não pronto:", {
        hasMessage: !!chatMessage.trim(),
        hasChannel: !!meetingChannel,
        channelState: meetingChannel?.state
      });
      return;
    }

    try {
      const messageData = {
        sender_id: currentUserId,
        sender_name: currentUserName,
        body: chatMessage.trim()
      };

      // Envia a mensagem para o canal
      meetingChannel.push("new_msg", messageData)
        .receive("ok", () => {
          console.log("[CHAT] Mensagem enviada com sucesso");
          setChatMessage('');
        })
        .receive("error", (error) => {
          console.error("[CHAT] Erro ao enviar mensagem:", error);
          toast({
            title: "Erro ao enviar mensagem",
            description: "Não foi possível enviar a mensagem. Tente novamente.",
            variant: "destructive",
            duration: 3000,
          });
        });

    } catch (error) {
      console.error("[CHAT] Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Função para indicar que está digitando
  const handleTyping = (e) => {
    setChatMessage(e.target.value);
    
    if (!meetingChannel || meetingChannel.state !== 'joined') return;

    // Limpa o timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Indica que está digitando
    meetingChannel.push("user_typing", {
      user_id: currentUserId,
      user_name: currentUserName
    });

    // Para de indicar digitação após 2 segundos sem digitar
    typingTimeoutRef.current = setTimeout(() => {
      meetingChannel.push("user_stopped_typing", {
        user_id: currentUserId,
        user_name: currentUserName
      });
    }, 2000);
  };

  // Função para lidar com Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <motion.aside
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="w-80 flex flex-col"
      style={{
        backgroundColor: 'var(--bg-dark-secondary)',
        borderLeft: '1px solid var(--border-color)'
      }}
    >
      {/* Header do Chat */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center space-x-2">
          <MessageCircle size={20} style={{ color: 'var(--color-primary)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--text-light-primary)' }}>
            Chat da Reunião
          </h3>
        </div>
        <div className="text-xs" style={{ color: 'var(--text-light-secondary)' }}>
          {messages.length} mensagens
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
              style={{ color: 'var(--text-light-secondary)' }}
            >
              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">Nenhuma mensagem ainda</p>
              <p className="text-xs mt-1">Seja o primeiro a enviar uma mensagem!</p>
            </motion.div>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage 
                key={msg.id} 
                msg={msg} 
                isOwn={msg.sender_id === currentUserId}
                delay={index} 
              />
            ))
          )}
        </AnimatePresence>

        {/* Indicador de digitação */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-xs italic ml-2"
              style={{ color: 'var(--text-light-secondary)' }}
            >
              Alguém está digitando...
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Formulário de Envio */}
      <form onSubmit={handleSendMessage} className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex space-x-2">
          <Input
            value={chatMessage}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder={meetingChannel?.state === 'joined' ? "Digite sua mensagem..." : "Conectando ao chat..."}
            className="flex-1"
            disabled={!meetingChannel || meetingChannel.state !== 'joined'}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="btn-primary flex-shrink-0"
            disabled={!chatMessage.trim() || !meetingChannel || meetingChannel.state !== 'joined'}
          >
            <Send size={18} />
          </Button>
        </div>
        
        {/* Botão de teste para mensagens de exemplo */}
        {meetingChannel && (
          <div className="mt-2 flex space-x-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                const testMessages = [
                  "Olá a todos! 👋",
                  "Como está a reunião?",
                  "Tudo pronto para começar!",
                  "Excelente apresentação!",
                  "Alguma dúvida?"
                ];
                const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
                setChatMessage(randomMessage);
              }}
              className="text-xs"
            >
              Teste
            </Button>
            <span className="text-xs opacity-70" style={{ color: 'var(--text-light-secondary)' }}>
              {!meetingChannel ? '⏳ Inicializando...' : 
               meetingChannel.state === 'joined' ? '✅ Conectado' : 
               meetingChannel.state === 'joining' ? '🔄 Conectando...' : '❌ Desconectado'}
            </span>
          </div>
        )}
      </form>
    </motion.aside>
  );
};

export default ChatPanel;