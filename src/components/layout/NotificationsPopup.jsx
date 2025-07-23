// src/components/layout/NotificationsPopup.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ADICIONADO: Importar Pill para medicacao
import { MessageSquare, Calendar, FileText, CheckCircle, Pill } from 'lucide-react'; 
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
// ADICIONADO: Importar o hook do contexto
import { useActivityNotifications } from '@/context/ActivityNotificationContext'; 

// Mapeamento de ícones (agora mais consistente com ActivityItem)
const iconMap = {
  message: { icon: MessageSquare, color: 'var(--color-accent-blue)' },
  meeting: { icon: Calendar, color: 'var(--color-primary)' },
  'meeting-full': { icon: Calendar, color: 'var(--color-primary)' }, // Usar o mesmo ícone para meeting-full
  file: { icon: FileText, color: 'var(--color-accent-green)' },
  medicacao: { icon: Pill, color: 'var(--color-secondary)' }, // Cor para 'medicacao'
  // Adicione outros tipos se a notificação puder ter outros types para exibir ícones corretos
};

const NotificationItem = ({ notification, onClosePopup }) => {
  // Lidar com tipos de notificação que podem não ter um ícone mapeado
  const { icon: Icon, color } = iconMap[notification.type] || { icon: MessageSquare, color: 'var(--text-light-secondary)' }; 
  const { toast } = useToast();
  const navigate = useNavigate();
  // ADICIONADO: Obter a função para marcar como lida do contexto
  const { markActivityAsRead } = useActivityNotifications(); 

  const handleNotificationClick = () => {
    // Marcar a notificação como lida ao clicar
    markActivityAsRead(notification.id);

    if (notification.link) {
      navigate(notification.link);
      if (onClosePopup) {
        onClosePopup();
      }
      toast({
        title: `A navegar para ${notification.link}...`,
        description: `Notificação de ${notification.type}.`,
        duration: 1500,
      });
    } else {
      toast({
        title: "Redirecionando para a notificação...",
        description: "Esta notificação não tem um link direto definido.",
        duration: 3000,
      });
    }
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
          <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)', border: '2px solid var(--bg-light-primary)' }}></span>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm text-text-light-primary">
          <span className="font-bold">{notification.user}</span> {notification.description} <span className="font-semibold" style={{ color }}>"{notification.context}"</span>.
        </p>
        <p className="text-xs mt-1 text-text-light-secondary">
          {notification.timestamp}
        </p>
      </div>
      {/* A bolinha de "não lido" agora depende da propriedade 'read' da notificação */}
      <div className={`w-2 h-2 rounded-full self-center transition-opacity duration-300 ${notification.read ? 'opacity-30' : 'opacity-100'}`} style={{ backgroundColor: notification.read ? 'var(--text-light-secondary)' : 'var(--color-primary)' }}></div>
    </motion.div>
  );
};

const NotificationsPopup = ({ isVisible, onClose }) => { // onUnreadCountChange não é mais necessário aqui
  const popupRef = useRef(null);
  // ADICIONADO: Obter atividades e funções de marcação do contexto
  const { activities, unreadCount, markAllActivitiesAsRead } = useActivityNotifications();

  // Filtrar apenas as notificações (atividades não lidas) para exibir
  const notificationsToDisplay = activities.filter(activity => !activity.read);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!isVisible) return;
      const bellButton = document.querySelector('.bell-notification-button');
      if (popupRef.current && 
          !popupRef.current.contains(event.target) &&
          (!bellButton || !bellButton.contains(event.target))) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside); 
    };
  }, [isVisible, onClose]);

  const handleMarkAllAsRead = () => {
    // Chamar a função do contexto para marcar todas como lidas
    markAllActivitiesAsRead();
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
          style={{ backgroundColor: 'var(--bg-light-primary)', border: '1px solid var(--border-color)' }}
          ref={popupRef}
        >
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-light-primary">
                Notificações
              </h3>
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-color-primary"
                style={{ color: 'var(--text-light-secondary)' }}
              >
                <CheckCircle size={14} />
                Marcar como lidas
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {notificationsToDisplay.length > 0 ? (
              notificationsToDisplay.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onClosePopup={onClose} 
                />
              ))
            ) : (
              <div className="text-center text-text-light-secondary py-4">
                Não tem novas notificações.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPopup;