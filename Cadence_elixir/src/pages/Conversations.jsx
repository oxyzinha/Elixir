import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { fetchMessages, sendMessage } from '@/services/conversations';

const Conversations = () => {
  const [messages, setMessages] = useState([]);
  // Carrega mensagens do backend ao montar
  useEffect(() => {
    async function loadMessages() {
      try {
        const msgs = await fetchMessages();
        setMessages(msgs);
      } catch (err) {
        setMessages([]);
      }
    }
    loadMessages();
  }, []);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (newMessage.trim() === '') {
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    const typingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 1500);
    return () => clearTimeout(typingTimeout);
  }, [newMessage]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const msg = await sendMessage(newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      setIsTyping(false);
    } catch (err) {
      // Trate o erro conforme necessário
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Helmet>
        <title>Conversas - Cadence</title>
        <meta
          name="description"
          content="Veja e gerencie todas as suas conversas na plataforma Cadence."
        />
      </Helmet>

      <div className="min-h-screen flex bg-[#f9f7fc] text-[#1f1f1f]">
        <Navbar />

        <div className="flex-1 ml-64 px-6 flex flex-col items-center">
          <Header />

          <div className="mt-20 w-full max-w-3xl flex flex-col flex-grow relative">
            <h1 className="text-center text-4xl font-bold text-[#5a2d82] mb-6 select-none">
              As Minhas Conversas
            </h1>

            <div
              className="flex-1 overflow-y-auto pr-4 space-y-6 scrollbar-thin scrollbar-thumb-[#a57fc9] scrollbar-track-transparent"
              style={{ maxHeight: '600px' }}
            >
              {messages.map(({ id, from, text }) => (
                <div
                  key={id}
                  className={`flex items-end ${
                    from === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {from === 'agent' && (
                    <img
                      src="/avatars/agent-avatar.png"
                      alt="Agente"
                      className="w-12 h-12 rounded-full mr-3 select-none"
                      loading="lazy"
                    />
                  )}
                  <div
                    className={`rounded-3xl px-6 py-4 text-lg max-w-[75%] shadow-sm break-words ${
                      from === 'user'
                        ? 'bg-[#6a4ea1] text-white'
                        : 'bg-[#d8c9f6] text-[#3c2a63]'
                    }`}
                    style={{ lineHeight: '1.5', userSelect: 'text' }}
                  >
                    {text}
                  </div>
                  {from === 'user' && (
                    <img
                      src="/avatars/user-avatar.png"
                      alt="Usuário"
                      className="w-12 h-12 rounded-full ml-3 select-none"
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Indicador "Usuário está a escrever..." */}
            {isTyping && (
              <div
                className="absolute bottom-28 left-6 right-6 text-[#6a4ea1] italic font-medium text-lg flex items-center gap-2 select-none"
                aria-live="polite"
              >
                <svg
                  className="animate-pulse h-5 w-5 text-[#6a4ea1]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Usuário está a escrever...
              </div>
            )}

            {/* Barra de escrever fixa */}
            <div className="sticky bottom-0 bg-[#f9f7fc] pt-3 pb-3 flex items-center gap-4 border-t border-[#d1c7e4]">
              <textarea
                rows={1}
                maxLength={300}
                placeholder="Escreva a sua mensagem..."
                className="flex-1 px-5 py-2 border border-[#b9aee1] rounded-full bg-[#f1ecfb] text-lg placeholder:text-[#a594c8] focus:outline-none focus:ring-4 focus:ring-[#a57fc9]/40 transition-all resize-none leading-relaxed"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Escreva a sua mensagem"
                style={{ maxHeight: '3rem' }}
              />
              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-[#7e64c8] to-[#5e49a1] hover:brightness-110 text-white px-7 py-3 rounded-full text-lg font-semibold shadow-md transition-all select-none"
                aria-label="Enviar mensagem"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Conversations;
