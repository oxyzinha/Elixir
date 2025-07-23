// src/context/ActivityNotificationContext.jsx
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const ActivityNotificationContext = createContext();

// Dados iniciais das atividades (unifica os dados)
const initialActivitiesData = [
  {
    id: 'ex1',
    type: 'message',
    user: 'Dr. João Costa',
    avatarFallback: 'JC',
    description: "enviou uma nova mensagem na comunidade",
    context: "'Suporte Diabéticos'",
    timestamp: "Há 10 minutos",
    link: "/communities",
    read: false,
  },
  {
    id: 'ex2',
    type: 'meeting',
    user: 'Dra. Ana Pereira',
    avatarFallback: 'AP',
    description: "agendou uma nova teleconsulta com ",
    context: "'Maria Antunes'",
    timestamp: "Há 30 minutos",
    link: "/calendar",
    read: false,
  },
  {
    id: 'ex3',
    type: 'medicacao',
    user: 'Enf. Rui Santos',
    avatarFallback: 'RS',
    description: "adicionou um lembrete de medicação para",
    context: "'Sr. António' - 'Insulina'",
    timestamp: "Há 1 hora",
    link: "/dashboard",
    read: false,
  },
  {
    id: 'ex4',
    type: 'file',
    user: 'Dr. Ricardo Lima',
    avatarFallback: 'RL',
    description: "adicionou uma nova receita de medicamento para",
    context: "'Dona Laura' - 'Paracetamol'",
    timestamp: "Há 2 horas",
    read: false,
  },
  {
    id: 'ex5',
    type: 'message',
    user: 'Carlos Pereira',
    avatarFallback: 'CP',
    description: 'mencionou-o em',
    context: 'Canal #geral',
    timestamp: 'Ontem',
    read: true,
    link: "/conversations"
  },
  {
    id: 'ex6',
    type: 'meeting',
    user: 'Pedro Ramos',
    avatarFallback: 'PR',
    description: 'convidou-o para a Consulta',
    context: 'Revisão do Sprint',
    timestamp: '15 min atrás',
    read: false,
    link: "/meetings"
  },
];

export const ActivityNotificationProvider = ({ children }) => {
  const { toast } = useToast();
  const [activities, setActivities] = useState(initialActivitiesData);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const ws = useRef(null); // Usar useRef para manter a instância do WebSocket

  // Função para buscar reuniões do backend e combiná-las
  useEffect(() => {
    const fetchAndCombineActivities = async () => {
      let fetchedMeetings = [];
      try {
        const response = await fetch('http://localhost:4000/api/meetings', {
          headers: {
            'Authorization': `Bearer `, // Adicione o token real aqui, se tiver um sistema de autenticação
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        fetchedMeetings = data.meetings.map(m => ({
          id: m.id,
          type: 'meeting-full', 
          user: m.participants && m.participants.length > 0 ? m.participants[0].name || m.participants[0].id : m.name,
          description: `Consulta agendada`,
          context: `com ${m.name || 'N/A'}`,
          timestamp: new Date(m.start_time).toLocaleString('pt-PT', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'}),
          link: `/meeting/${m.id}`,
          avatarFallback: (m.participants && m.participants.length > 0 && m.participants[0].name) ? m.participants[0].name.charAt(0).toUpperCase() : 'C',
          fullMeetingData: m,
          read: false, // Por padrão, reuniões novas são não lidas
        }));

      } catch (error) {
        console.error("Erro ao buscar reuniões para atividades:", error);
        toast({
          title: "Erro ao carregar atividades de consultas.",
          description: "Não foi possível buscar as consultas do servidor.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setActivities(prev => {
            const currentIds = new Set(prev.map(a => a.id));
            const newFetched = fetchedMeetings.filter(m => !currentIds.has(m.id));
            return [...prev, ...newFetched];
        });
        setLoadingActivities(false);
      }
    };

    fetchAndCombineActivities();
  }, [toast]);

  // --- Lógica WebSocket para Notificações em Tempo Real ---
  useEffect(() => {
    // Substitua 'ws://localhost:4000/socket' pela URL real do seu servidor WebSocket
    // Se estiver a usar Phoenix Channels, a URL pode ser algo como 'ws://localhost:4000/socket'
    // E precisará de usar a biblioteca Phoenix.Socket para uma integração mais robusta.
    // Para um exemplo simples de WebSocket nativo:
    ws.current = new WebSocket('ws://localhost:4000/ws'); // Exemplo de URL WebSocket

    ws.current.onopen = () => {
      console.log('Conectado ao servidor WebSocket.');
      // Pode enviar uma mensagem de autenticação aqui se necessário
      // ws.current.send(JSON.stringify({ type: 'auth', token: 'SEU_TOKEN_AQUI' }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Mensagem WebSocket recebida:', data);

      // Assumindo que o backend envia um objeto de atividade no formato esperado
      if (data.type === 'new_activity' && data.activity) {
        setActivities(prevActivities => {
          // Verifica se a atividade já existe para evitar duplicados
          if (!prevActivities.some(activity => activity.id === data.activity.id)) {
            // Adiciona a nova atividade no topo da lista e marca como não lida
            return [{ ...data.activity, read: false }, ...prevActivities];
          }
          return prevActivities;
        });
        toast({
          title: "Nova atividade!",
          description: data.activity.description,
          duration: 3000,
        });
      }
      // Pode ter outros tipos de mensagens WebSocket aqui (ex: 'update_activity', 'delete_activity')
    };

    ws.current.onclose = () => {
      console.log('Desconectado do servidor WebSocket.');
      // Tentar reconectar após um atraso, se desejar
    };

    ws.current.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
      toast({
        title: "Erro de conexão em tempo real.",
        description: "Não foi possível manter a conexão com o servidor de notificações.",
        variant: "destructive",
        duration: 3000,
      });
    };

    // Limpeza: fechar a conexão WebSocket quando o componente for desmontado
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [toast]); // O useEffect do WebSocket só deve rodar uma vez na montagem

  // Função para marcar uma atividade específica como lida
  const markActivityAsRead = (id) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id ? { ...activity, read: true } : activity
      )
    );
  };

  // Função para marcar todas as atividades como lidas
  const markAllActivitiesAsRead = () => {
    setActivities(prev => 
      prev.map(activity => ({ ...activity, read: true }))
    );
  };

  const unreadCount = activities.filter(activity => !activity.read).length;

  return (
    <ActivityNotificationContext.Provider 
      value={{ 
        activities, 
        loadingActivities, 
        markActivityAsRead, 
        markAllActivitiesAsRead, 
        unreadCount 
      }}
    >
      {children}
    </ActivityNotificationContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useActivityNotifications = () => useContext(ActivityNotificationContext);