// src/pages/Calendar.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Calendar = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Mês');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Mês') newDate.setMonth(currentDate.getMonth() - 1);
    else if (viewMode === 'Semana') newDate.setDate(currentDate.getDate() - 7);
    else if (viewMode === 'Dia') newDate.setDate(currentDate.getDate() - 1);
    else if (viewMode === 'Ano') newDate.setFullYear(currentDate.getFullYear() - 1);
    setCurrentDate(newDate);
    setSelectedEvent(null);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Mês') newDate.setMonth(currentDate.getMonth() + 1);
    else if (viewMode === 'Semana') newDate.setDate(currentDate.getDate() + 7);
    else if (viewMode === 'Dia') newDate.setDate(currentDate.getDate() + 1);
    else if (viewMode === 'Ano') newDate.setFullYear(currentDate.getFullYear() + 1);
    setCurrentDate(newDate);
    setSelectedEvent(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedEvent(null);
  };

  const handleNewMeeting = () => {
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada...",
      duration: 3000,
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    return days;
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Eventos mockados para demonstração
  const mockEvents = {
    5: { title: 'Reunião de Equipa', time: '14:00', participants: ['João', 'Maria'] },
    12: { title: 'Apresentação do Projeto', time: '10:30', participants: ['Pedro', 'Ana', 'Carlos'] },
    18: { title: 'Discussão de Design', time: '16:00', participants: ['Sofia'] },
    25: { title: 'Planeamento Sprint', time: '09:00', participants: ['Todos'] },
  };

  const handleDayClick = (day) => {
    if (day && mockEvents[day]) {
      setSelectedEvent({ day, ...mockEvents[day] });
    } else if (day) {
      setSelectedEvent(null);
      toast({
        title: `Dia ${day} selecionado`,
        description: "Nenhum evento agendado para este dia.",
        duration: 2000,
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Calendário - Cadence</title>
        <meta
          name="description"
          content="Gerencie suas reuniões e eventos no calendário da plataforma Cadence."
        />
      </Helmet>
      <div className="flex min-h-screen bg-[#f9fafb]">
        <Navbar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="pt-24 p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-7xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl font-extrabold text-black"
                >
                  Calendário
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <Button
                    onClick={handleNewMeeting}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-semibold flex items-center space-x-2 px-4 py-2 rounded-lg shadow-md transition"
                  >
                    <Plus size={18} />
                    <span>Novo evento</span>
                  </Button>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex items-center justify-between mb-6 p-4 rounded-lg bg-white shadow-sm border border-purple-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handlePrevious}
                      variant="ghost"
                      size="sm"
                      className="p-2 text-black hover:text-black hover:bg-gray-200 rounded-lg transition"
                      aria-label="Mês anterior"
                    >
                      <ChevronLeft size={18} />
                    </Button>
                    <Button
                      onClick={handleNext}
                      variant="ghost"
                      size="sm"
                      className="p-2 text-black hover:text-black hover:bg-gray-200 rounded-lg transition"
                      aria-label="Próximo mês"
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                  <Button
                    onClick={handleToday}
                    variant="outline"
                    size="sm"
                    className="text-black border-black hover:bg-gray-200 rounded-lg transition"
                  >
                    Hoje
                  </Button>
                  <h2
                    className="text-2xl font-semibold text-black select-none"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-black border-black hover:bg-gray-200 rounded-lg transition"
                      aria-label="Selecionar modo de visualização"
                    >
                      {viewMode}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {['Dia', 'Semana', 'Mês', 'Ano'].map((mode) => (
                      <DropdownMenuItem
                        key={mode}
                        onSelect={() => {
                          setViewMode(mode);
                          setSelectedEvent(null);
                        }}
                        className="text-black"
                      >
                        {mode}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              {/* Calendário */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Calendário Mês */}
                {viewMode === 'Mês' && (
                  <Card className="lg:col-span-3 bg-white border border-gray-300 shadow-sm">
                    <CardContent>
                      {/* Dias da semana */}
                      <div className="grid grid-cols-7 border-b border-gray-300 pb-2 mb-2 select-none">
                        {weekDays.map((day) => (
                          <div
                            key={day}
                            className="text-center font-semibold text-black"
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                      {/* Dias do mês */}
                      <div className="grid grid-cols-7 gap-2">
                        {getDaysInMonth().map((day, idx) => {
                          const hasEvent = day && mockEvents[day];
                          return (
                            <button
                              key={idx}
                              onClick={() => handleDayClick(day)}
                              className={`
                                h-16 flex flex-col items-center justify-center rounded-lg
                                transition
                                ${
                                  isToday(day)
                                    ? 'bg-purple-700 text-white font-bold shadow-md'
                                    : 'text-black hover:bg-purple-100'
                                }
                                ${hasEvent ? 'border-2 border-purple-600' : ''}
                                ${day ? 'cursor-pointer' : 'cursor-default'}
                              `}
                              aria-label={
                                day
                                  ? `${day} de ${monthNames[currentDate.getMonth()]}`
                                  : 'Espaço vazio'
                              }
                            >
                              {day || ''}
                              {hasEvent && (
                                <span className="mt-1 w-2 h-2 rounded-full bg-purple-700"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lado direito: detalhes do evento */}
                <div>
                  {selectedEvent ? (
                    <Card className="bg-white border border-gray-300 shadow-sm">
                      <CardContent>
                        <h3 className="text-xl font-semibold mb-2 text-black">
                          Evento em {selectedEvent.day} de {monthNames[currentDate.getMonth()]}
                        </h3>
                        <p className="mb-1 text-black">
                          <strong>Título:</strong> {selectedEvent.title}
                        </p>
                        <p className="mb-1 text-black">
                          <strong>Hora:</strong> {selectedEvent.time}
                        </p>
                        <p className="mb-1 text-black">
                          <strong>Participantes:</strong> {selectedEvent.participants.join(', ')}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-white border border-gray-300 shadow-sm flex items-center justify-center h-full p-6">
                      <p className="text-black text-center">
                        Selecione um dia com evento para ver detalhes aqui.
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Calendar;