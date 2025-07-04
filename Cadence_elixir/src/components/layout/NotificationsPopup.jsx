//src\components\layout\NotificationsPopup.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Calendar, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const notificationsData = [
  {
    id: 1,
    type: 'message',
    user: 'Ana Costa',
    description: 'enviou uma nova mensagem',
    context: 'Equipa Frontend',
    timestamp: '2 min atrás',
    read: false,
  },
  {
    id: 2,
    type: 'meeting',
    user: 'Pedro Ramos',
    description: 'convidou-o para a reunião',
    context: 'Revisão do Sprint',
    timestamp: '15 min atrás',
    read: false,
  },
  {
    id: 3,
    type: 'file',
    user: 'Maria Antunes',
    description: 'atualizou o ficheiro',
    context: 'Plano de Projeto.docx',
    timestamp: '1 hora atrás',
    read: true,
  },
  {
    id: 4,
    type: 'message',
    user: 'Carlos Pereira',
    description: 'mencionou-o em',
    context: 'Canal #geral',
    timestamp: 'Ontem',
    read: false,
  },
  {
    id: 5,
    type: 'meeting',
    user: 'Sofia Alves',
    description: 'aceitou o seu convite para',
    context: 'Brainstorming Cadence V2',
    timestamp: '2 dias atrás',
    read: true,
  },
];

const iconMap = {
  message: { icon: MessageSquare, color: 'var(--color-accent-blue)' },
  meeting: { icon: Calendar, color: 'var(--color-primary)' },
  file: { icon: FileText, color: 'var(--color-accent-green)' },
};

const NotificationItem = ({ notification }) => {
  const { icon: Icon, color } = iconMap[notification.type];
  const { toast } = useToast();

  const handleNotificationClick = () => {
    toast({
      title: "Redirecionando para a notificação...",
      description: "Esta funcionalidade ainda não está implementada.",
      duration: 3000,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onClick={handleNotificationClick}
      className="flex items-start gap-4 p-3 transition-colors duration-200 rounded-lg cursor-pointer hover:bg-white/5"
    >
      <div className="relative mt-1">
        <div className="p-2 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {!notification.read && (
          <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)', border: '2px solid var(--bg-dark-secondary)' }}></span>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm" style={{ color: 'var(--text-light-primary)' }}>
          <span className="font-bold">{notification.user}</span> {notification.description} <span className="font-semibold" style={{ color }}>"{notification.context}"</span>.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-light-secondary)' }}>
          {notification.timestamp}
        </p>
      </div>
      <div className={`w-2 h-2 rounded-full self-center transition-opacity duration-300 ${notification.read ? 'opacity-30' : 'opacity-100'}`} style={{ backgroundColor: notification.read ? 'var(--text-light-secondary)' : 'var(--color-primary)' }}></div>
    </motion.div>
  );
};

const NotificationsPopup = ({ isVisible }) => {
  const { toast } = useToast();

  const handleMarkAllAsRead = () => {
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada....",
      duration: 3000,
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 10, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl shadow-2xl z-30"
          style={{ backgroundColor: 'var(--bg-dark-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold" style={{ color: 'var(--text-light-primary)' }}>
                Notificações
              </h3>
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-white"
                style={{ color: 'var(--text-light-secondary)' }}
              >
                <CheckCircle size={14} />
                Marcar como lidas
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {notificationsData.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPopup;