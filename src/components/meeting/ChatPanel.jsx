import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const initialMessages = [
  { id: 1, sender: 'Maria Santos', message: 'Bom dia a todos!', time: '10:30', isOwn: false },
  { id: 2, sender: 'Você', message: 'Olá! Vamos começar?', time: '10:31', isOwn: true },
  { id: 3, sender: 'Pedro Costa', message: 'Estou pronto para a apresentação', time: '10:32', isOwn: false },
];

const ChatMessage = ({ msg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className={`chat-message p-3 rounded-lg max-w-xs ${msg.isOwn ? 'own ml-auto' : 'mr-auto'}`}
  >
    {!msg.isOwn && (
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-accent-pink)' }}>{msg.sender}</p>
    )}
    <p className="text-sm" style={{ color: 'var(--text-light-primary)' }}>{msg.message}</p>
    <p className="text-xs text-right mt-1" style={{ color: 'var(--text-light-secondary)' }}>{msg.time}</p>
  </motion.div>
);

const ChatPanel = () => {
  const { toast } = useToast();
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState(initialMessages);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      toast({
        title: "Mensagem enviada!",
        description: "🚧 Chat em tempo real ainda não implementado!",
        duration: 2000,
      });
      setChatMessage('');
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
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--text-light-primary)' }}>Chat da Consulta</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => <ChatMessage key={msg.id} msg={msg} delay={i} />)}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex space-x-2">
          <Input
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
          />
          <Button type="submit" size="icon" className="btn-primary flex-shrink-0">
            <Send size={18} />
          </Button>
        </div>
      </form>
    </motion.aside>
  );
};

export default ChatPanel;