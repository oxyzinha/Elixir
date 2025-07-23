// src/pages/Activity.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, MessageSquare, FileText, CalendarClock, Code2, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ActivityItem from '@/components/activity/ActivityItem';
import { useToast } from '@/components/ui/use-toast';

// --- Atividades de Exemplo (Funções de Comunicação, Consultas e Medicações) ---
const initialActivities = [
  // Exemplo 1: Mensagem de Comunidade
  {
    id: 'ex1',
    type: 'message', // Reutiliza o tipo 'message'
    user: 'Dr. João Costa',
    avatarFallback: 'JC',
    description: "enviou uma nova mensagem na comunidade",
    context: "'Suporte Diabéticos'",
    timestamp: "Há 10 minutos",
    link: "/communities"
  },
  // Exemplo 2: Teleconsulta Agendada (Ajustado para "Consulta")
  {
    id: 'ex2',
    type: 'meeting', // Reutiliza o tipo 'meeting' genérico
    user: 'Dra. Ana Pereira',
    avatarFallback: 'AP',
    description: "agendou uma nova teleconsulta com ",
    context: "'Maria Antunes'",
    timestamp: "Há 30 minutos",
    link: "/calendar"
  },
  // Exemplo 3: Lembrete de Medicação Adicionado
  {
    id: 'ex3',
    type: 'medicacao', // Novo tipo 'medicacao' para o ActivityItem
    user: 'Enf. Rui Santos',
    avatarFallback: 'RS',
    description: "adicionou um lembrete de medicação para",
    context: "'Sr. António' - 'Insulina'",
    timestamp: "Há 1 hora",
    link: "/dashboard" 
  },
  // Exemplo 4: Nova Receita de Medicamento Adicionada
  {
    id: 'ex4',
    type: 'file', // Reutiliza o tipo 'file' ou cria um novo 'receita'
    user: 'Dr. Ricardo Lima',
    avatarFallback: 'RL',
    description: "adicionou uma nova receita de medicamento para",
    context: "'Dona Laura' - 'Paracetamol'",
    timestamp: "Há 2 horas",
    link: "/dashboard" 
  },
];

const Activity = () => {
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState('Todas');
  const [dateFilter, setDateFilter] = useState('Sempre');
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar reuniões do backend e combiná-las com atividades iniciais
  useEffect(() => {
    const fetchAndCombineActivities = async () => {
      let fetchedMeetings = [];
      try {

///////////////////////////////////////////////////////////////

        // COMENTÁRIO PARA O BACKEND: 
        // PROXIMOS PASSOS PARA EVITAR ERROS!!
        // 1. AUTENTICAÇÃO: O `Authorization` header precisa de um token JWT válido.
        //    Atualmente está vazio, o que resultará em erros 401 Unauthorized.
        //    Deve ser preenchido com o token do utilizador após o login.
        //    Exemplo: 'Authorization': `Bearer ${userToken}`
        // 2. ENDPOINT: O endpoint `http://localhost:4000/api/meetings` é usado para buscar consultas.
        //    Certifiquem-se de que este endpoint está a retornar os dados no formato esperado.
        // 3. ESTRUTURA DOS DADOS: Os dados retornados são mapeados para a estrutura ActivityItem.
        //    Propriedades como `id`, `start_time`, `name`, `participants` são esperadas.
        //    O `m.participants[0].name` ou `m.participants[0].id` é usado para identificar o utilizador.
        //    Se a estrutura da API mudar, este mapeamento precisará de ser ajustado.

///////////////////////////////////////////////////////////////

        const response = await fetch('http://localhost:4000/api/meetings', {
          headers: {
            'Authorization': `Bearer `, // <<-- BACKEND: Precisa do token de autenticação aqui
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          const errorText = await response.text(); 
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        fetchedMeetings = data.meetings.map(m => ({
          id: m.id,
          type: 'meeting-full', // Tipo específico para reuniões detalhadas da API
          user: m.participants && m.participants.length > 0 ? m.participants[0].name || m.participants[0].id : m.name,
          description: `Consulta agendada`,
          context: `com ${m.name || 'N/A'}`, 
          timestamp: new Date(m.start_time).toLocaleString('pt-PT', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'}),
          link: `/meeting/${m.id}`,
          avatarFallback: (m.participants && m.participants.length > 0 && m.participants[0].name) ? m.participants[0].name.charAt(0).toUpperCase() : 'C',
          fullMeetingData: m
        }));

      } catch (error) {
        console.error("Erro ao buscar consultas para atividades:", error); 
        toast({
          title: "Erro ao carregar atividades de consultas.",
          description: "Não foi possível buscar as consultas do servidor.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setAllActivities([...initialActivities, ...fetchedMeetings]);
        setLoading(false);
      }
    };

    fetchAndCombineActivities();
  }, [toast]);


  const typeFilters = [
    "Todas",
    "Mensagens",
    "Ficheiros",
    "Consultas", 
    "Comunidade",
    "Lembretes", 
  ];
  const dateFilters = ["Sempre", "Hoje", "Últimos 7 dias", "Últimos 30 dias"];

  const filteredActivities = allActivities.filter(item => {
    let itemTypeFormatted;
    switch(item.type) {
      case 'message': itemTypeFormatted = 'Mensagens'; break;
      case 'file': itemTypeFormatted = 'Ficheiros'; break;
      case 'meeting':
      case 'meeting-full': 
      case 'teleconsulta': 
      case 'proxima-consulta-dash': itemTypeFormatted = 'Consultas'; break; 
      case 'code': itemTypeFormatted = 'Código'; break;
      case 'community': itemTypeFormatted = 'Comunidade'; break;
      case 'medicacao': itemTypeFormatted = 'Lembretes'; break;
      case 'documentos': itemTypeFormatted = 'Ficheiros'; break; 
      case 'chat': itemTypeFormatted = 'Mensagens'; break; 
      default: itemTypeFormatted = 'Outros';
    }

    const typeMatch = typeFilter === 'Todas' || itemTypeFormatted === typeFilter;
    const dateMatch = true; 

    return typeMatch && dateMatch;
  });

  return (
    <>
      <Helmet>
        <title>Atividade - Cadence</title>
        <meta name="description" content="Veja toda a atividade recente na plataforma Cadence." />
      </Helmet>
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-light-primary)', color: 'var(--text-light-primary)' }}>
        <Navbar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="pt-24 p-8"> 
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl font-bold" 
                  style={{ color: 'var(--text-light-primary)' }} 
                >
                  Atividade Recente
                </motion.h1>
              </div>

              <div
                className="p-6 rounded-xl shadow-md border mb-8 flex flex-col md:flex-row items-center justify-between gap-4"
                style={{ backgroundColor: 'var(--bg-light-primary)', borderColor: 'var(--border-color)' }}
              >
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-light-secondary)' }} size={20} />
                  <Input
                    placeholder="Procurar atividade..."
                    className="pl-10 py-2 text-base rounded-md w-full"
                    style={{
                      border: '1px solid var(--border-color)', 
                      backgroundColor: 'var(--bg-light-primary)', 
                      color: 'var(--text-light-primary)' 
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium mr-2" style={{ color: 'var(--text-light-secondary)' }}>Tipo:</span> 
                  {typeFilters.map(f => (
                    <Button
                      key={f}
                      variant="ghost"
                      onClick={() => setTypeFilter(f)}
                      size="sm"
                      className={`px-5 py-2 rounded-full font-medium text-sm transition`}
                      style={{
                        backgroundColor: typeFilter === f ? 'var(--color-primary)' : 'rgba(123, 63, 188, 0.1)',
                        color: typeFilter === f ? 'white' : 'var(--color-primary)',
                        '--tw-ring-color': 'rgba(123, 63, 188, 0.5)', 
                        ...(typeFilter === f && {
                          ':hover': {
                            backgroundColor: 'color-mix(in srgb, var(--color-primary) 90%, black)', 
                          }
                        }),
                        ...(typeFilter !== f && {
                          ':hover': {
                            backgroundColor: 'rgba(123, 63, 188, 0.2)', 
                          }
                        })
                      }}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium mr-2" style={{ color: 'var(--text-light-secondary)' }}>Data:</span>
                  {dateFilters.map(f => (
                    <Button
                      key={f}
                      variant="ghost"
                      onClick={() => setDateFilter(f)}
                      size="sm"
                      className={`px-5 py-2 rounded-full font-medium text-sm transition`}
                      style={{
                        backgroundColor: dateFilter === f ? 'var(--color-primary)' : 'rgba(123, 63, 188, 0.1)',
                        color: dateFilter === f ? 'white' : 'var(--color-primary)',
                        '--tw-ring-color': 'rgba(123, 63, 188, 0.5)', 
                        ...(dateFilter === f && {
                          ':hover': {
                            backgroundColor: 'color-mix(in srgb, var(--color-primary) 90%, black)', 
                          }
                        }),
                        ...(dateFilter !== f && {
                          ':hover': {
                            backgroundColor: 'rgba(123, 63, 188, 0.2)', 
                          }
                        })
                      }}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="text-center" style={{ color: 'var(--text-light-secondary)' }}>Carregando atividades...</div> 
              ) : filteredActivities.length === 0 ? (
                <div className="text-center" style={{ color: 'var(--text-light-secondary)' }}>Nenhuma atividade encontrada.</div> 
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.07,
                      },
                    },
                  }}
                  className="space-y-6"
                >
                  {filteredActivities.map((item) => (
                    <ActivityItem key={item.id} item={item} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Activity;