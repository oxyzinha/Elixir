import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { fetchMessages, sendMessage } from '@/services/conversations';
import { ChevronLeft } from 'lucide-react';

const Conversations = () => {
  const [contacts, setContacts] = useState([
    { id: '1', name: 'João', lastMessage: 'Olá!', messages: [] },
    { id: '2', name: 'Maria', lastMessage: 'Como estás?', messages: [] },
    { id: '3', name: 'Carlos', lastMessage: 'Até logo!', messages: [] }
  ]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const messagesEndRef = useRef(null);

  const selectedContact = contacts.find(c => c.id === selectedContactId);
  const messages = selectedContact?.messages || [];

  // Helper para verificar se está em mobile (uso direto, sem useCallback para simplificar)
  const isMobile = () => window.innerWidth < 768; // Use 768px as md breakpoint

  // Efeito para inicializar o contato selecionado e gerenciar a visibilidade do painel
  useEffect(() => {
    // 1. Seleciona o primeiro contato se nenhum estiver selecionado e houver contatos
    if (!selectedContactId && contacts.length > 0) {
      setSelectedContactId(contacts[0].id);
    }

    // 2. Função para ajustar a visibilidade do painel com base na largura da tela
    const adjustPanelVisibility = () => {
      if (isMobile()) {
        setShowChatPanel(!!selectedContactId); // Se houver contato selecionado, mostra o chat, senão a lista
      } else {
        setShowChatPanel(true); // Em desktop, sempre mostra o chat panel (ambos visíveis)
      }
    };

    adjustPanelVisibility(); // Ajusta a visibilidade na montagem e em cada alteração

    // Adiciona listener para redimensionamento da janela
    window.addEventListener('resize', adjustPanelVisibility);

    // Limpa o listener ao desmontar o componente
    return () => window.removeEventListener('resize', adjustPanelVisibility);
  }, [selectedContactId, contacts]); // Dependências do useEffect

  // Efeito para carregar mensagens do contato selecionado
  useEffect(() => {
    if (selectedContactId) {
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
    }
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
    if (!newMessage.trim() || !selectedContactId) return;
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
      if (isMobile()) {
        setShowChatPanel(true);
      }
    }
  };

  const handleContactClick = (contactId) => {
    setSelectedContactId(contactId);
    if (isMobile()) {
      setShowChatPanel(true);
    }
  };

  const handleBackToContacts = () => {
    setShowChatPanel(false); // Volta para a lista de contatos em mobile
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

        {/* Container principal de conteúdo (chat e painel de contatos) */}
        {/* ml-0 em mobile, md:ml-64 em desktop para compensar a Navbar */}
        <div className="flex-1 flex flex-col ml-0 md:ml-64">
          {/* Header está aqui, acima do conteúdo principal */}
          <Header />

          {/* Adicione um padding-top ao div que contém o chat para dar espaço ao Header e ao botão de voltar */}
          <div className="flex flex-1 overflow-hidden relative pt-16 md:pt-0"> {/* Ajustado aqui: pt-16 em mobile, pt-0 em desktop */}

            {/* Painel da Lista de Contatos */}
            <div
              className={`w-full md:w-64 border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto flex-col
              ${showChatPanel ? 'hidden' : 'flex'} md:flex`}
            >
              <div className="pt-[60px] flex flex-col flex-1"> {/* Este pt-60px é para o header interno da lista, se houver */}
                <h2 className="text-xl font-bold p-4 border-b dark:border-gray-700 flex justify-between items-center">
                  Conversas
                  <Button onClick={handleAddContact} className="text-sm px-3 py-1">
                    + Novo
                  </Button>
                </h2>

                <div className="flex-1 overflow-y-auto">
                  {contacts.map((contact, index) => (
                    <React.Fragment key={contact.id}>
                      <div
                        onClick={() => handleContactClick(contact.id)}
                        className={`p-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors mb-2 ${
                          selectedContactId === contact.id
                            ? 'bg-purple-300 dark:bg-purple-800 font-semibold shadow-md'
                            : 'bg-transparent'
                        }`}
                        style={{ userSelect: 'none' }}
                      >
                        <div className="text-purple-900 dark:text-purple-200 text-lg">{contact.name}</div>
                        <div
                          className="text-sm truncate dark:text-gray-300"
                          style={{ color: 'black' }}
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

            {/* Painel do Chat */}
            <div
              className={`flex-1 px-4 sm:px-6 flex-col items-center overflow-hidden relative
              ${showChatPanel ? 'flex' : 'hidden'} md:flex`}
            >
              {/* Botão "Voltar para Contatos" - Visível apenas em mobile e quando o chat está visível */}
              {isMobile() && showChatPanel && (
                <div className="absolute top-4 left-4 z-20"> {/* Aumentado z-index para z-20 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToContacts}
                    aria-label="Voltar para contactos"
                    className="bg-[var(--bg-light-primary)] shadow-md rounded-full p-2 text-[var(--text-light-primary)]"
                  >
                    <ChevronLeft size={24} />
                  </Button>
                </div>
              )}

              {/* Ajuste do mt-20 para pt-8 em mobile (se o Header também tiver height similar) */}
              <div className="mt-8 md:mt-20 w-full max-w-3xl flex flex-col flex-grow relative"> {/* Ajustado mt-8 para mobile */}
                <h1
                  className="text-center text-3xl sm:text-4xl font-bold mb-6 select-none"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {selectedContact?.name || 'Selecione um contato'}
                </h1>

                {selectedContactId ? (
                  <>
                    <div
                      className="flex-1 overflow-y-auto pr-2 sm:pr-4 space-y-4 sm:space-y-6 chat-messages-container"
                      style={{ maxHeight: 'calc(100vh - 250px)' }}
                    >
                      {messages.map(({ id, from, text }) => (
                        <div key={id} className={`flex items-end ${from === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {from === 'agent' && (
                            <img
                              src="/avatars/agent-avatar.png"
                              alt="Agente"
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 select-none avatar"
                              loading="lazy"
                            />
                          )}
                          <div
                            className={`rounded-3xl px-4 py-2 sm:px-6 sm:py-4 text-sm sm:text-lg max-w-[75%] shadow-sm break-words chat-message ${
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
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ml-2 sm:ml-3 select-none avatar"
                              loading="lazy"
                            />
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {isTyping && (
                      <div
                        className="absolute bottom-28 left-6 right-6 italic font-medium text-sm sm:text-lg flex items-center gap-2 select-none"
                        style={{ color: 'var(--color-primary)' }}
                        aria-live="polite"
                      >
                        <svg
                          className="animate-pulse h-4 w-4 sm:h-5 sm:w-5"
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
                      className="sticky bottom-0 pt-3 pb-3 flex items-center gap-2 sm:gap-4 border-t"
                      style={{
                        backgroundColor: 'var(--bg-light-primary)',
                        borderColor: 'var(--border-color)',
                      }}
                    >
                      <textarea
                        rows={1}
                        maxLength={300}
                        placeholder="Escreva a sua mensagem..."
                        className="flex-1 px-4 py-2 sm:px-5 sm:py-2 rounded-full resize-none leading-relaxed text-sm sm:text-base input"
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
                        className="btn-primary px-5 py-2 sm:px-7 sm:py-3 rounded-full text-sm sm:text-lg font-semibold shadow-md transition-all select-none"
                        aria-label="Enviar mensagem"
                      >
                        Enviar
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-gray-500 text-lg sm:text-xl">
                    Selecione um contato para começar a conversar.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Conversations;