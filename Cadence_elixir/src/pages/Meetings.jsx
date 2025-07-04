//src/pages/Meetings.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CalendarPlus, Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button'; // Certifique-se de que este import está correto
import { Input } from '@/components/ui/input';   // Certifique-se de que este import está correto
import { useToast } from '@/components/ui/use-toast';
import MeetingItem from '@/components/meetings/MeetingItem';
import { useNavigate } from 'react-router-dom';

const Meetings = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState('Todas');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // --- NOVOS ESTADOS PARA O FORMULÁRIO DE AGENDAMENTO ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newMeetingData, setNewMeetingData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    status: 'Próxima', // Valor padrão
    type: 'Geral',      // Valor padrão
    participants: []    // Valor padrão
  });
  // --- FIM DOS NOVOS ESTADOS ---

  // Função para buscar reuniões do backend
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/api/meetings', {
          headers: {
            'Authorization': `Bearer `, // Ajustado para token vazio para desenvolvimento
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const formattedMeetings = data.meetings.map(m => ({
          id: m.id,
          name: m.name,
          date: m.start_time,
          endDate: m.end_time,
          status: m.status,
          participants: m.participants || [],
          type: m.type || 'Geral'
        }));
        setMeetings(formattedMeetings);
      } catch (error) {
        console.error("Erro ao buscar reuniões:", error);
        toast({
          title: "Erro ao carregar consultas.",
          description: "Não foi possível buscar as consultas do servidor.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [toast]);

  // --- FUNÇÃO PARA ABRIR O FORMULÁRIO (CHAMADA PELO BOTÃO) ---
  const handleScheduleConsultation = () => {
    setIsFormOpen(true); // Apenas abre o formulário
    // Limpa os dados do formulário a cada abertura
    setNewMeetingData({
      name: '',
      start_time: '',
      end_time: '',
      status: 'Próxima',
      type: 'Geral',
      participants: []
    });
  };
  // --- FIM DA FUNÇÃO DE ABERTURA ---

  // --- NOVA FUNÇÃO PARA SUBMETER O FORMULÁRIO (CHAMADA PELO BOTÃO DENTRO DO MODAL) ---
  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Previne o recarregamento da página

    toast({
      title: "Agendando nova consulta...",
      duration: 2000,
    });
    try {
      const response = await fetch('http://localhost:4000/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer `, // Token vazio para desenvolvimento
        },
        body: JSON.stringify({
          meeting: {
            ...newMeetingData, // Pega todos os dados do estado do formulário
            // Converte as strings de data/hora para o formato ISO string
            start_time: newMeetingData.start_time ? new Date(newMeetingData.start_time).toISOString() : undefined,
            end_time: newMeetingData.end_time ? new Date(newMeetingData.end_time).toISOString() : undefined,
          }
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newMeetingResponse = await response.json();
      const newMeeting = newMeetingResponse.meeting;

      setMeetings(prev => [...prev, {
        id: newMeeting.id,
        name: newMeeting.name,
        date: newMeeting.start_time,
        endDate: newMeeting.end_time,
        status: newMeeting.status,
        participants: newMeeting.participants || [],
        type: newMeeting.type || 'Geral'
      }]);
      toast({
        title: "Consulta agendada com sucesso!",
        duration: 3000,
      });
      setIsFormOpen(false); // Fecha o formulário após o sucesso
    } catch (error) {
      console.error("Erro ao agendar consulta:", error);
      toast({
        title: "Erro ao agendar consulta.",
        description: `Não foi possível agendar a consulta: ${error.message || error}.`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  // --- FIM DA NOVA FUNÇÃO DE SUBMISSÃO ---

  const filters = ["Todas", "Próximas", "Em Curso", "Concluídas", "Canceladas"];

  const filteredMeetings = meetings.filter(consultation => {
    const matchesFilter = () => {
      if (filter === 'Todas') return true;
      if (filter === 'Próximas') return consultation.status === 'Próxima';
      if (filter === 'Em Curso') return consultation.status === 'Ativa';
      if (filter === 'Concluídas') return consultation.status === 'Concluída';
      if (filter === 'Canceladas') return consultation.status === 'Cancelada';
      return true;
    };

    const matchesSearch = searchTerm ?
      consultation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    return matchesFilter() && matchesSearch;
  });

  return (
    <>
      <Helmet>
        <title>As Minhas Consultas - Cadence</title>
        <meta name="description" content="Gerencie todas as suas teleconsultas e agendamentos na plataforma Cadence." />
      </Helmet>

      <div className="flex min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 ml-64 flex flex-col">
          <Header />
          <main className="pt-20 p-8 flex-1 bg-gray-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-6xl mx-auto"
            >
              {/* Título e botão */}
              <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl font-bold text-gray-900"
                >
                  As Minhas Consultas
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <Button
                    onClick={handleScheduleConsultation}
                    className="btn-primary px-6 py-3 text-base rounded-xl"
                  >
                    <CalendarPlus className="mr-2" size={20} />
                    Agendar Consulta
                  </Button>
                </motion.div>
              </div>

              {/* Filtros e pesquisa */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-100 border border-gray-300 p-5 rounded-2xl shadow-sm mb-8">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Procurar consultas..."
                    className="pl-10 text-lg rounded-lg py-2 bg-white text-gray-900 border border-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {filters.map(f => (
                    <Button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`text-base px-4 py-2 rounded-full transition ${
                        filter === f ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Lista de consultas */}
              {loading ? (
                <div className="text-center text-gray-600">Carregando consultas...</div>
              ) : filteredMeetings.length === 0 ? (
                <div className="text-center text-gray-600">Nenhuma consulta encontrada.</div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                  className="space-y-4"
                >
                  {filteredMeetings.map((consultation) => (
                    <MeetingItem key={consultation.id} meeting={consultation} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          </main>
        </div>
      </div>

      {/* --- FORMULÁRIO MODAL PARA AGENDAR CONSULTA --- */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Agendar Nova Consulta</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label htmlFor="meetingName" className="block text-gray-700 text-sm font-bold mb-2">Nome da Consulta</label>
                <Input
                  id="meetingName"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newMeetingData.name}
                  onChange={(e) => setNewMeetingData({...newMeetingData, name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="startTime" className="block text-gray-700 text-sm font-bold mb-2">Início (Data e Hora)</label>
                <Input
                  id="startTime"
                  type="datetime-local" // Use datetime-local para seleção de data e hora
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newMeetingData.start_time}
                  onChange={(e) => setNewMeetingData({...newMeetingData, start_time: e.target.value})}
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="endTime" className="block text-gray-700 text-sm font-bold mb-2">Fim (Data e Hora)</label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newMeetingData.end_time}
                  onChange={(e) => setNewMeetingData({...newMeetingData, end_time: e.target.value})}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <Button type="submit" className="btn-primary px-6 py-3 rounded-xl">
                  Agendar
                </Button>
                <Button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary px-6 py-3 rounded-xl">
                  Cancelar
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* --- FIM DO FORMULÁRIO MODAL --- */}
    </>
  );
};

export default Meetings;