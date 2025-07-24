// src/pages/Meetings.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CalendarPlus, Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import MeetingItem from '@/components/meetings/MeetingItem';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/services/api';

const Meetings = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState('Todas');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newMeetingData, setNewMeetingData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    status: 'Próxima',
    type: 'Geral',
    participants: []
  });

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/api/meetings', {});

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

  const handleScheduleConsultation = () => {
    setIsFormOpen(true);
    setNewMeetingData({
      name: '',
      start_time: '',
      end_time: '',
      status: 'Próxima',
      type: 'Geral',
      participants: []
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    toast({
      title: "Agendando nova consulta...",
      duration: 2000,
    });
    try {
      const newMeetingResponse = await apiFetch('/api/meetings', {
        method: 'POST',
        body: JSON.stringify({
          meeting: {
            ...newMeetingData,
            start_time: newMeetingData.start_time ? new Date(newMeetingData.start_time).toISOString() : undefined,
            end_time: newMeetingData.end_time ? new Date(newMeetingData.end_time).toISOString() : undefined,
          }
        }),
      });

      const newMeeting = newMeetingResponse.meeting;

      setMeetings(prev => [ {
        id: newMeeting.id,
        name: newMeeting.name,
        date: newMeeting.start_time,
        endDate: newMeeting.end_time,
        status: newMeeting.status,
        participants: newMeeting.participants || [],
        type: newMeeting.type || 'Geral'
      }, ...prev]);
      toast({
        title: "Consulta agendada com sucesso!",
        duration: 3000,
      });
      setIsFormOpen(false);
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

      {/* CONTAINER PRINCIPAL: flex-row para Navbar e conteúdo à direita */}
      <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-light-primary)' }}>
        <Navbar /> {/* Navbar fixa à esquerda */}

        {/* CONTAINER DO CONTEÚDO À DIREITA (Header + Main) */}
        <div className="flex-1 flex flex-col ml-0 md:ml-64 overflow-hidden">
          <Header />

          {/* MAIN CONTENT: Ocupa o restante espaço vertical e é onde o scroll acontece */}
          <main className="pt-16 md:pt-24 p-4 md:p-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-6xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-10 gap-4">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-3xl sm:text-4xl font-bold text-center sm:text-left" style={{ color: 'var(--text-light-primary)' }}
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
                    className="btn-primary px-5 py-2 text-base rounded-xl w-full sm:w-auto"
                  >
                    <CalendarPlus className="mr-2" size={20} />
                    Agendar Consulta
                  </Button>
                </motion.div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl shadow-sm mb-8"
                   style={{ backgroundColor: 'var(--bg-light-primary)', border: '1px solid var(--border-color)' }}>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-light-secondary)' }} size={18} />
                  <Input
                    placeholder="Procurar consultas..."
                    className="pl-10 text-lg rounded-lg py-2 w-full"
                    style={{ backgroundColor: 'var(--bg-light-primary)', color: 'var(--text-light-primary)', border: '1px solid var(--border-color)' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                  {filters.map(f => (
                    <Button
                      key={f}
                      onClick={() => setFilter(f)}
                      // Classes focus-visible: removidas daqui, serão geridas no CSS global
                      className={`text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2 rounded-full transition-colors duration-200 transition-transform
                        ${filter === f
                          ? 'bg-color-primary text-white hover:shadow-md hover:shadow-color-primary/50 hover:scale-[1.01] active:bg-color-primary' // ABA SELECIONADA
                          : 'bg-gray-200 text-text-light-primary hover:bg-gray-300 hover:shadow-sm hover:shadow-gray-400/50 hover:scale-[1.01] active:bg-gray-300' // ABA NÃO SELECIONADA
                        }`}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8" style={{ color: 'var(--text-light-secondary)' }}>Carregando consultas...</div>
              ) : filteredMeetings.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'var(--text-light-secondary)' }}>Nenhuma consulta encontrada.</div>
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

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md my-8"
            style={{ backgroundColor: 'var(--bg-light-primary)' }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center" style={{ color: 'var(--text-light-primary)' }}>Agendar Nova Consulta</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label htmlFor="meetingName" className="block text-sm font-bold mb-2" style={{ color: 'var(--text-light-primary)' }}>Nome da Consulta</label>
                <Input
                  id="meetingName"
                  type="text"
                  className="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  style={{
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-light-primary)',
                    backgroundColor: 'var(--bg-light-primary)',
                    '--tw-ring-color': 'var(--color-primary)',
                    '--tw-ring-opacity': '0.2'
                  }}
                  value={newMeetingData.name}
                  onChange={(e) => setNewMeetingData({...newMeetingData, name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="startTime" className="block text-sm font-bold mb-2" style={{ color: 'var(--text-light-primary)' }}>Início (Data e Hora)</label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  className="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  style={{
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-light-primary)',
                    backgroundColor: 'var(--bg-light-primary)',
                    '--tw-ring-color': 'var(--color-primary)',
                    '--tw-ring-opacity': '0.2'
                  }}
                  value={newMeetingData.start_time}
                  onChange={(e) => setNewMeetingData({...newMeetingData, start_time: e.target.value})}
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="endTime" className="block text-sm font-bold mb-2" style={{ color: 'var(--text-light-primary)' }}>Fim (Data e Hora)</label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  className="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  style={{
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-light-primary)',
                    backgroundColor: 'var(--bg-light-primary)',
                    '--tw-ring-color': 'var(--color-primary)',
                    '--tw-ring-opacity': '0.2'
                  }}
                  value={newMeetingData.end_time}
                  onChange={(e) => setNewMeetingData({...newMeetingData, end_time: e.target.value})}
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button type="submit" className="btn-primary px-6 py-3 rounded-xl w-full sm:w-auto">
                  Agendar
                </Button>
                <Button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary px-6 py-3 rounded-xl w-full sm:w-auto">
                  Cancelar
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Meetings;