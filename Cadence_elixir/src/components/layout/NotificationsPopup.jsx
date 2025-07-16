//src\components\layout\NotificationsPopup.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Calendar, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Mapeamento de ícones por tipo de notificação
const iconMap = {
  message: { icon: MessageSquare, color: 'var(--color-accent-blue)' },
  meeting: { icon: Calendar, color: 'var(--color-primary)' },
  file: { icon: FileText, color: 'var(--color-accent-green)' },
};

// Componente para item individual de notificação
const NotificationItem = ({ notification, onClick }) => {
  const { icon: Icon, color } = iconMap[notification.type] || iconMap.message;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(notification)}
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
          <span className="font-bold">{notification.user}</span> {notification.description}{' '}
          <span className="font-semibold" style={{ color }}>
            "{notification.context}"
          </span>.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-light-secondary)' }}>
          {notification.timestamp}
        </p>
      </div>
      <div className={`w-2 h-2 rounded-full self-center transition-opacity duration-300 ${notification.read ? 'opacity-30' : 'opacity-100'}`} style={{ backgroundColor: notification.read ? 'var(--text-light-secondary)' : 'var(--color-primary)' }}></div>
    </motion.div>
  );
};

// Componente principal do popup de notificações
const NotificationsPopup = ({ isVisible }) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Busca notificações do backend
  useEffect(() => {
    if (!isVisible) return;
    setLoading(true);
    setError(null);
    fetch('/api/notifications', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}` // ajuste conforme seu auth
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar notificações');
        return res.json();
      })
      .then(data => {
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch((err) => {
        setNotifications([]);
        setError(err.message);
        setLoading(false);
      });
  }, [isVisible]);

  // Handler para clicar em uma notificação
  const handleNotificationClick = (notification) => {
    toast({
      title: notification.title || 'Notificação',
      description: notification.description || 'Sem detalhes.',
      duration: 3000,
    });
    // Aqui você pode implementar navegação ou marcar como lida
  };

  // Handler para marcar todas como lidas (placeholder)
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({...notification, read: true})));
    toast({
      title: 'Todas as notificações marcadas como lidas.',
      duration: 3000,
    });
  };

  // Renderização condicional
  const renderContent = () => {
    if (loading) {
      return <div className="p-4 text-center text-sm">Carregando...</div>;
    }
    if (error) {
      return <div className="p-4 text-center text-sm text-red-500">{error}</div>;
    }
    if (notifications.length === 0) {
      return <div className="p-4 text-center text-sm">Nenhuma notificação.</div>;
    }
    return notifications.map((notification) => (
      <NotificationItem key={notification.id} notification={notification} onClick={handleNotificationClick} />
    ));
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
            {renderContent()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPopup;