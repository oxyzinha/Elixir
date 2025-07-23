import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { fetchMessages, sendMessage } from '@/services/conversations';

const Conversations = () => {
  const [contacts, setContacts] = useState([
    { id: '1', name: 'João', lastMessage: 'Olá!', messages: [] },
    { id: '2', name: 'Maria', lastMessage: 'Como estás?', messages: [] },
    { id: '3', name: 'Carlos', lastMessage: 'Até logo!', messages: [] }
  ]);
  const [selectedContactId, setSelectedContactId] = useState('1');
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const selectedContact = contacts.find(c => c.id === selectedContactId);
  const messages = selectedContact?.messages || [];

  useEffect(() => {
    async function loadMessages() {
      try {
        const msgs = await fetchMessages(selectedContactId);
        setContacts((prev) =>
          prev.map((c) =>
            c.id === selectedContactId ? { ...c, messages: msgs } : c
          )
        );
      } catch (err) {
        console.error('Erro ao carregar mensagens:', err);
      }
    }
    loadMessages();
  }, [selectedContactId]);

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
      const msg = await sendMessage(newMessage.trim(), selectedContactId);
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selectedContactId
            ? {
                ...c,
                messages: [...c.messages, msg],
                lastMessage: msg.text
              }
            : c
        )
      );
      setNewMessage('');
      setIsTyping(false);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddContact = () => {
    const name = prompt('Digite o nome do novo contacto:');
    if (name && name.trim() !== '') {
      const newId = (contacts.length + 1).toString();
      const newContact = { id: newId, name: name.trim(), lastMessage: '', messages: [] };
      setContacts([...contacts, newContact]);
      setSelectedContactId(newId);
    }
  };

  return (
    <>
      <Helmet>
        <title>Conversas - Cadence</title>
        <meta name="description" content="Veja e gerencie todas as suas conversas na plataforma Cadence." />
      </Helmet>

      <div
        className="min-h-screen flex"
        style={{
          backgroundColor: 'var(--bg-light-primary)',
          color: 'var(--text-light-primary)',
        }}
      >
        <Navbar />

        <div className="flex-1 ml-64 flex">
          {/* Lista de Contatos */}
          <div className="w-64 border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto flex flex-col">
            <div className="pt-[60px]">
              <h2 className="text-xl font-bold p-4 border-b dark:border-gray-700 flex justify-between items-center">
                Conversas
                <Button onClick={handleAddContact} className="text-sm px-3 py-1">
                  + Novo
                </Button>
              </h2>

              <div className="flex-1 overflow-auto">
                {contacts.map((contact, index) => (
                  <React.Fragment key={contact.id}>
                    <div
                      onClick={() => setSelectedContactId(contact.id)}
                      className={`p-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors mb-2 ${
                        selectedContactId === contact.id
                          ? 'bg-purple-300 dark:bg-purple-800 font-semibold shadow-md'
                          : 'bg-transparent'
                      }`}
                      style={{ userSelect: 'none' }}
                    >
                      <div className="text-purple-900 dark:text-purple-200 text-lg">{contact.name}</div>
                      <div
                        className="text-sm truncate"
                        style={{
                          color: 'black', // cor preta no modo claro
                        }}
                        className="dark:text-gray-300" // cinza claro no modo escuro
                      >
                        {contact.lastMessage}
                      </div>
                    </div>
                    {index !== contacts.length - 1 && (
                      <div className="border-t border-gray-300 dark:border-gray-700 mx-4" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 px-6 flex flex-col items-center">
            <Header />
            <div className="mt-20 w-full max-w-3xl flex flex-col flex-grow relative">
              <h1
                className="text-center text-4xl font-bold mb-6 select-none"
                style={{ color: 'var(--color-primary)' }}
              >
                {selectedContact?.name || 'Conversa'}
              </h1>

              <div
                className="flex-1 overflow-y-auto pr-4 space-y-6 chat-messages-container"
                style={{ maxHeight: '600px' }}
              >
                {messages.map(({ id, from, text }) => (
                  <div key={id} className={`flex items-end ${from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {from === 'agent' && (
                      <img
                        src="/avatars/agent-avatar.png"
                        alt="Agente"
                        className="w-12 h-12 rounded-full mr-3 select-none avatar"
                        loading="lazy"
                      />
                    )}
                    <div
                      className={`rounded-3xl px-6 py-4 text-lg max-w-[75%] shadow-sm break-words chat-message ${
                        from === 'user' ? 'own' : ''
                      }`}
                      style={{ lineHeight: '1.5', userSelect: 'text' }}
                    >
                      {text}
                    </div>
                    {from === 'user' && (
                      <img
                        src="/avatars/user-avatar.png"
                        alt="Usuário"
                        className="w-12 h-12 rounded-full ml-3 select-none avatar"
                        loading="lazy"
                      />
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {isTyping && (
                <div
                  className="absolute bottom-28 left-6 right-6 italic font-medium text-lg flex items-center gap-2 select-none"
                  style={{ color: 'var(--color-primary)' }}
                  aria-live="polite"
                >
                  <svg
                    className="animate-pulse h-5 w-5"
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
                  Usuário está a escrever...
                </div>
              )}

              <div
                className="sticky bottom-0 pt-3 pb-3 flex items-center gap-4 border-t"
                style={{
                  backgroundColor: 'var(--bg-light-primary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <textarea
                  rows={1}
                  maxLength={300}
                  placeholder="Escreva a sua mensagem..."
                  className="flex-1 px-5 py-2 rounded-full resize-none leading-relaxed input"
                  style={{
                    backgroundColor: 'var(--bg-light-primary)',
                    color: 'var(--text-light-primary)',
                    borderColor: 'var(--border-color)',
                    maxHeight: '3rem',
                  }}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Escreva a sua mensagem"
                />
                <Button
                  onClick={handleSend}
                  className="btn-primary px-7 py-3 rounded-full text-lg font-semibold shadow-md transition-all select-none"
                  aria-label="Enviar mensagem"
                >
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Conversations;
  