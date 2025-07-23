// src/components/chat/CommunityChat.jsx (O seu código fornecido)
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Pode não ser usado diretamente, mas mantido se necessário para outros inputs
import { useToast } from '@/components/ui/use-toast';
import { fetchCommunityMessages, sendCommunityMessage } from '@/services/conversations'; // Estes serviços precisarão de ser mockados ou lidar com a falta de backend

const CommunityChat = ({ communityId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true); // Adicionado estado de carregamento para as mensagens
  const [errorMessages, setErrorMessages] = useState(null); // Adicionado estado de erro para as mensagens

  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadMessages() {
      if (!communityId) {
        setIsLoadingMessages(false); // Se não houver ID, não há o que carregar
        return;
      }
      setIsLoadingMessages(true); // Começa a carregar
      setErrorMessages(null); // Limpa erros anteriores
      try {
        // MOCKAR O COMPORTAMENTO DE fetchCommunityMessages
        // Substitua esta linha por um mock local se não tiver um serviço de conversação real
        // const msgs = await fetchCommunityMessages(communityId); 
        const msgs = [
            { id: 'mock1', from: 'Sistema', text: 'Bem-vindo ao chat mock da comunidade!', timestamp: new Date(Date.now() - 60000).toISOString() },
            { id: 'mock2', from: 'Eu', text: 'Olá a todos!', timestamp: new Date(Date.now() - 30000).toISOString() },
            { id: 'mock3', from: 'Dr. João', text: 'Como posso ajudar?', timestamp: new Date(Date.now() - 10000).toISOString() },
        ];
        setMessages(msgs);
      } catch (err) {
        console.error("Erro ao carregar mensagens da comunidade:", err);
        setErrorMessages("Não foi possível carregar as mensagens do chat."); // Define a mensagem de erro
        toast({
          title: "Erro de chat.",
          description: "Não foi possível carregar as mensagens do chat da comunidade.",
          variant: "destructive",
        });
        setMessages([]); // Limpa as mensagens em caso de erro
      } finally {
        setIsLoadingMessages(false); // Termina o carregamento, independentemente do sucesso ou erro
      }
    }
    loadMessages();
  }, [communityId, toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Logic para "está a escrever..."
    if (newMessage.trim() === '') {
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    const typingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 1500); // 1.5 segundos sem digitar para parar "a escrever"
    return () => clearTimeout(typingTimeout);
  }, [newMessage]);

  const handleSend = async () => {
    const messageToSend = newMessage.trim();
    if (!messageToSend || !communityId) return;

    try {
      // Simulação de mensagem do utilizador antes de enviar para o backend
      const tempMessage = {
        id: `temp-${Date.now()}`, // ID temporário
        from: currentUserId,
        text: messageToSend,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]); // Adiciona mensagem temporária
      setNewMessage(''); // Limpa o input imediatamente
      setIsTyping(false); // Reseta o status de digitação

      // MOCKAR O COMPORTAMENTO DE sendCommunityMessage
      // Simula um delay e depois "confirma" a mensagem
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay de rede
      const sentMsg = { ...tempMessage, id: `real-${Date.now()}` }; // Simula ID real do backend
      
      // Atualiza a mensagem temporária com a mensagem real do "backend" mockado
      setMessages((prev) => 
        prev.map(m => m.id === tempMessage.id ? sentMsg : m)
      );

    } catch (err) {
      console.error("Erro ao enviar mensagem para a comunidade:", err);
      toast({
        title: "Erro de envio.",
        description: "Não foi possível enviar a sua mensagem. Tente novamente.",
        variant: "destructive",
      });
      // Remover a mensagem temporária se o envio falhar
      setMessages((prev) => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  const handleKeyDown = (e) => {
    // Permite Shift + Enter para nova linha
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Previne nova linha padrão
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-light-secondary)] rounded-xl shadow-inner border" style={{ borderColor: 'var(--border-color)' }}>
      {/* Container das mensagens com scrollbar personalizada */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-4 chat-messages-container"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-primary) var(--bg-light-secondary)' }}
      >
        {isLoadingMessages ? ( // Exibe estado de carregamento
          <div className="text-center py-20" style={{ color: 'var(--text-light-secondary)' }}>
            A carregar mensagens...
          </div>
        ) : errorMessages ? ( // Exibe estado de erro
          <div className="text-center py-20 text-red-500">
            {errorMessages}
          </div>
        ) : messages.length === 0 ? ( // Exibe se não houver mensagens após o carregamento
          <div className="text-center text-gray-500 py-10">
            Ainda não há mensagens nesta comunidade. Seja o primeiro a começar!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start ${
                msg.from === currentUserId ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Avatar do Outro Membro */}
              {msg.from !== currentUserId && (
                <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0">
                  {msg.from ? msg.from.substring(0, 1).toUpperCase() : '?'} {/* Exemplo: primeira letra do nome do utilizador */}
                </div>
              )}
              {/* Balão da Mensagem */}
              <div
                className={`rounded-xl px-4 py-3 text-base max-w-[70%] shadow-sm break-words chat-message ${
                  msg.from === currentUserId ? 'bg-[var(--color-primary)] text-white own' : 'bg-[var(--bg-light-primary)] text-[var(--text-light-primary)]'
                }`}
                style={{ lineHeight: '1.4' }}
              >
                {/* Nome do remetente, se não for o utilizador atual */}
                {msg.from !== currentUserId && (
                  <div className="font-semibold text-xs mb-1" style={{ color: 'var(--color-primary)' }}>
                    {msg.from}
                  </div>
                )}
                {msg.text}
                <div className="text-right text-xs mt-1" style={{ color: msg.from === currentUserId ? 'rgba(255,255,255,0.7)' : 'var(--text-light-secondary)' }}>
                  {new Date(msg.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {/* Avatar do Utilizador Atual */}
              {msg.from === currentUserId && (
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-white font-bold text-sm ml-3 flex-shrink-0">
                  Eu
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Indicador "Usuário está a escrever..." */}
      {isTyping && (
        <div
          className="px-6 pb-2 italic text-sm flex items-center gap-2"
          style={{ color: 'var(--color-primary)' }}
          aria-live="polite"
        >
          <svg
            className="animate-pulse h-4 w-4"
            style={{ color: 'var(--color-primary)' }}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
          A escrever...
        </div>
      )}

      {/* Barra de escrever */}
      <div
        className="p-4 flex items-center gap-4 border-t"
        style={{
          backgroundColor: 'var(--bg-light-secondary)',
          borderColor: 'var(--border-color)'
        }}
      >
        <textarea
          rows={1}
          maxLength={500}
          placeholder="Escreva a sua mensagem..."
          className="flex-1 px-5 py-2 rounded-full resize-none leading-relaxed"
          style={{
            backgroundColor: 'var(--bg-light-primary)',
            color: 'var(--text-light-primary)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px',
            maxHeight: '4.5rem'
          }}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Escreva a sua mensagem"
        />
        <Button
          onClick={handleSend}
          className="btn-primary px-6 py-3 rounded-full text-lg font-semibold shadow-md transition-all"
          aria-label="Enviar mensagem"
          disabled={!newMessage.trim()} // Desativa o botão se a mensagem estiver vazia
        >
          Enviar
        </Button>
      </div>
    </div>
  );
};

export default CommunityChat;