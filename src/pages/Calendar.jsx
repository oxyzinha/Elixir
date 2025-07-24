// src/pages/Calendar.jsx
import React, { useState, useEffect } from 'react';
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

const mockEventsByMonth = {
  // Mock data for demonstration
  // January (0)
  0: {
    15: { title: 'Consulta Geral', time: '10:00', doctorName: 'Dr. Silva' },
    20: { title: 'Reunião de Equipe', time: '14:30', description: 'Reunião mensal para alinhamento de projetos.' },
  },
  // February (1)
  1: {
    5: { title: 'Check-up Anual', time: '09:00', doctorName: 'Dra. Costa' },
    14: { title: 'Workshop de Produtividade', time: '16:00' },
  },
  // July (6) - current month for easy testing with present date
  6: {
    24: { title: 'Demonstração de Produto', time: '11:00', description: 'Apresentação para novos clientes.' },
    25: { title: 'Sessão de Feedback', time: '10:00', doctorName: 'Dr. Santos' },
    26: { title: 'Planeamento Estratégico', time: '15:00', description: 'Definição de metas para o próximo trimestre.' },
  },
};

const Calendar = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Mês');
  const [selectedEvent, setSelectedEvent] = useState(null);
  // Novo estado para o mês selecionado na vista anual
  const [selectedMonthInYearView, setSelectedMonthInYearView] = useState(null);

  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStartDate, setNewEventStartDate] = useState('');
  const [newEventStartTime, setNewEventStartTime] = '';
  const [newEventEndDate, setNewEventEndDate] = useState('');
  const [newEventEndTime, setNewEventEndTime] = useState('');
  const [newEventDoctorName, setNewEventDoctorName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [events, setEvents] = useState([]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Função para buscar eventos do backend (a ser implementada no futuro)
  useEffect(() => {
    const fetchEvents = async () => {
      const year = currentDate.getFullYear();
      const fetchedMockEvents = Object.entries(mockEventsByMonth).flatMap(([monthIdxStr, daysEvents]) => {
        const month = parseInt(monthIdxStr);
        return Object.entries(daysEvents).map(([day, eventData]) => {
          const date = new Date(year, month, parseInt(day));
          const [hour, minute] = eventData.time.split(':').map(Number);

          const start = new Date(date);
          start.setHours(hour, minute, 0, 0);

          const end = new Date(date);
          end.setHours(hour + 1, minute, 0, 0);

          return {
            id: `mock-${month}-${day}-${Date.now()}`,
            title: eventData.title,
            start: start,
            end: end,
            participants: eventData.participants || [],
            description: eventData.description || eventData.title,
            type: 'mock',
            read: false,
            doctorName: eventData.doctorName || '',
          };
        });
      });
      setEvents(fetchedMockEvents);
    };

    fetchEvents();
  }, [currentDate]);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Mês') newDate.setMonth(currentDate.getMonth() - 1);
    else if (viewMode === 'Semana') newDate.setDate(currentDate.getDate() - 7);
    else if (viewMode === 'Dia') newDate.setDate(currentDate.getDate() - 1);
    else if (viewMode === 'Ano') newDate.setFullYear(currentDate.getFullYear() - 1);
    setCurrentDate(newDate);
    setSelectedEvent(null);
    setSelectedMonthInYearView(null); // Limpa seleção de mês ao mudar de ano
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Mês') newDate.setMonth(currentDate.getMonth() + 1);
    else if (viewMode === 'Semana') newDate.setDate(currentDate.getDate() + 7);
    else if (viewMode === 'Dia') newDate.setDate(currentDate.getDate() + 1);
    else if (viewMode === 'Ano') newDate.setFullYear(currentDate.getFullYear() + 1);
    setCurrentDate(newDate);
    setSelectedEvent(null);
    setSelectedMonthInYearView(null); // Limpa seleção de mês ao mudar de ano
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedEvent(null);
    setSelectedMonthInYearView(null); // Limpa seleção de mês ao ir para "Hoje"
  };

  const handleOpenNewEventModal = () => {
    setIsNewEventModalOpen(true);
    setNewEventTitle('');
    setNewEventStartDate('');
    setNewEventStartTime('');
    setNewEventEndDate('');
    setNewEventEndTime('');
    setNewEventDoctorName('');
    setNewEventDescription('');
  };

  const handleScheduleNewEvent = async (e) => {
    e.preventDefault();

    if (!newEventTitle || !newEventStartDate || !newEventStartTime || !newEventEndDate || !newEventEndTime) {
      toast({
        title: "Campos obrigatórios.",
        description: "Por favor, preencha todos os campos obrigatórios do evento.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const startDateTime = new Date(`${newEventStartDate}T${newEventStartTime}`);
    const endDateTime = new Date(`${newEventEndDate}T${newEventEndTime}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      toast({
        title: "Formato de data/hora inválido.",
        description: "Por favor, selecione datas e horas válidas.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (startDateTime >= endDateTime) {
      toast({
        title: "Erro de datas.",
        description: "A data/hora de início deve ser anterior à data/hora de fim.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const newEvent = {
      id: `event-${Date.now()}`,
      title: newEventTitle,
      start: startDateTime,
      end: endDateTime,
      participants: [],
      description: newEventDescription,
      type: 'custom',
      read: false,
      doctorName: newEventDoctorName,
    };

    setEvents(prevEvents => [...prevEvents, newEvent]);

    toast({
      title: "Evento agendado com sucesso!",
      description: `"${newEvent.title}" agendado para ${startDateTime.toLocaleDateString('pt-PT')} ${startDateTime.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}.`,
      duration: 3000,
    });
    setIsNewEventModalOpen(false);
  };

  // --- Funções Auxiliares para Vistas ---

  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 (Dom) a 6 (Sáb)
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
    return days;
  };

  const getDaysInWeek = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const isToday = (dateObj) => {
    if (!dateObj) return false;
    const today = new Date();
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForSpecificDay = (targetDate) => {
    if (!targetDate) return [];
    return events.filter(event =>
      event.start.getFullYear() === targetDate.getFullYear() &&
      event.start.getMonth() === targetDate.getMonth() &&
      event.start.getDate() === targetDate.getDate()
    );
  };

  const getEventsForYear = (year) => {
    const yearEvents = {};
    events.filter(event => event.start.getFullYear() === year)
            .sort((a,b) => a.start - b.start)
            .forEach(event => {
              const month = event.start.getMonth();
              const day = event.start.getDate();
              if (!yearEvents[month]) {
                yearEvents[month] = {};
              }
              if (!yearEvents[month][day]) {
                yearEvents[month][day] = [];
              }
              yearEvents[month][day].push(event);
            });
    return yearEvents;
  };

  // Nova função para obter eventos para um mês específico dentro do ano
  const getEventsForMonthInYear = (year, month) => {
    const monthEvents = {};
    events.filter(event =>
      event.start.getFullYear() === year &&
      event.start.getMonth() === month
    )
    .sort((a,b) => a.start - b.start)
    .forEach(event => {
      const day = event.start.getDate();
      if (!monthEvents[day]) {
        monthEvents[day] = [];
      }
      monthEvents[day].push(event);
    });
    return monthEvents;
  };


  const handleDayClick = (dateObj) => {
    if (!dateObj) {
      setSelectedEvent(null);
      return;
    }

    const eventsOnDay = getEventsForSpecificDay(dateObj);
    if (eventsOnDay.length > 0) {
      setSelectedEvent({ date: dateObj, events: eventsOnDay });
    } else {
      setSelectedEvent(null);
      toast({
        title: `Dia ${dateObj.toLocaleDateString('pt-PT')} selecionado`,
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
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-light-primary)' }}>
        <Navbar />
        {/* Adjusted for responsiveness: ml-0 on smaller screens, ml-64 on large screens */}
        <div className="flex-1 lg:ml-64">
          <Header />
          {/* Aumentar o padding-top para PCs (md:pt-32) para empurrar o conteúdo para baixo */}
          <main className="pt-24 p-4 md:p-8 md:pt-32"> {/* Alterado de pt-24 para md:pt-32 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-7xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8"> {/* Flex-col on small, flex-row on small-medium and up */}
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-0" // Adjusted font size, added margin-bottom for small screens
                  style={{ color: 'var(--text-light-primary)' }}
                >
                  Calendário
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <Button
                    onClick={handleOpenNewEventModal}
                    className="btn-primary font-semibold flex items-center space-x-2 px-4 py-2 rounded-lg shadow-md transition w-full sm:w-auto" // Full width on small screens
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
                className="flex flex-col sm:flex-row items-center justify-between mb-6 p-3 sm:p-4 rounded-lg shadow-sm border" // Reduced padding on small screens
                style={{
                  backgroundColor: 'var(--bg-light-primary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto mb-4 sm:mb-0"> {/* Stack on small, row on small-medium and up */}
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handlePrevious}
                      variant="ghost"
                      size="sm"
                      className="p-2 rounded-lg transition hover:bg-[var(--color-primary)] hover:bg-opacity-20"
                      style={{ color: 'var(--text-light-primary)', backgroundColor: 'transparent' }}
                      aria-label="Anterior"
                    >
                      <ChevronLeft size={18} />
                    </Button>
                    <Button
                      onClick={handleNext}
                      variant="ghost"
                      size="sm"
                      className="p-2 rounded-lg transition hover:bg-[var(--color-primary)] hover:bg-opacity-20"
                      style={{ color: 'var(--text-light-primary)', backgroundColor: 'transparent' }}
                      aria-label="Proximo"
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                  <Button
                    onClick={handleToday}
                    variant="outline"
                    size="sm"
                    className="rounded-lg transition hover:bg-[var(--color-primary)] hover:bg-opacity-20 w-full sm:w-auto" // Full width on small screens
                    style={{
                      color: 'var(--text-light-primary)',
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-light-primary)'
                    }}
                  >
                    Hoje
                  </Button>
                  <h2
                    className="text-lg sm:text-2xl font-semibold select-none text-center sm:text-left mt-2 sm:mt-0" // Adjusted font size, added text alignment for responsiveness
                    style={{ color: 'var(--text-light-primary)' }}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {viewMode === 'Mês' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                    {viewMode === 'Semana' && `Semana de ${new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })} a ${new Date(currentDate.setDate(currentDate.getDate() + 6)).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}, ${currentDate.getFullYear()}`}
                    {viewMode === 'Dia' && `${currentDate.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`}
                    {viewMode === 'Ano' && `${currentDate.getFullYear()}`}
                  </h2>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-lg transition hover:bg-[var(--color-primary)] hover:bg-opacity-20 w-full sm:w-auto" // Full width on small screens
                      style={{
                        color: 'var(--text-light-primary)',
                        borderColor: 'var(--border-color)',
                        backgroundColor: 'var(--bg-light-primary)'
                      }}
                      aria-label="Selecionar modo de visualização"
                    >
                      {viewMode}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    style={{
                      backgroundColor: 'var(--bg-light-primary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-light-primary)'
                    }}
                  >
                    {['Dia', 'Semana', 'Mês', 'Ano'].map((mode) => (
                      <DropdownMenuItem
                        key={mode}
                        onSelect={() => {
                          setViewMode(mode);
                          setSelectedEvent(null);
                          setSelectedMonthInYearView(null); // Limpa seleção de mês ao mudar de vista
                        }}
                        style={{ color: 'var(--text-light-primary)' }}
                      >
                        {mode}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              {/* Grid principal do calendário, ajusta as colunas com base no viewMode */}
              {/* Changed to flex-col on small screens, then grid for md and up */}
              <div className={`flex flex-col ${viewMode === 'Dia' ? 'md:grid-cols-1' : 'md:grid md:grid-cols-4'} gap-6`}>
                {/* Visualização de Mês */}
                {viewMode === 'Mês' && (
                  <Card
                    className="md:col-span-3 shadow-sm border"
                    style={{
                      backgroundColor: 'var(--bg-light-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <CardContent className="p-4">
                      <div
                        className="grid grid-cols-7 border-b pb-2 mb-2 select-none text-xs sm:text-base" // Adjusted font size for week days
                        style={{ borderColor: 'var(--border-color)' }}
                      >
                        {weekDays.map((day) => (
                          <div
                            key={day}
                            className="text-center font-semibold"
                            style={{ color: 'var(--text-light-primary)' }}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 sm:gap-2"> {/* Reduced gap on small screens */}
                        {getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()).map((dateObj, idx) => {
                          const hasEvent = dateObj && getEventsForSpecificDay(dateObj).length > 0;
                          const isCurrentDay = isToday(dateObj);

                          return (
                            <button
                              key={idx}
                              onClick={() => handleDayClick(dateObj)}
                              className={`
                                h-12 sm:h-16 flex flex-col items-center justify-center rounded-lg text-sm sm:text-base
                                transition calendar-day
                                ${isCurrentDay ? 'calendar-day-today-highlight' : ''}
                                ${hasEvent ? 'calendar-day-has-event' : ''}
                                ${dateObj ? 'cursor-pointer' : 'cursor-default'}
                                ${selectedEvent && selectedEvent.date && selectedEvent.date.toDateString() === (dateObj && dateObj.toDateString()) ? 'bg-[var(--color-primary)] bg-opacity-20' : ''}
                              `}
                              style={{ color: 'var(--text-light-primary)', backgroundColor: dateObj ? 'var(--bg-light-primary)' : 'transparent' }}
                              aria-label={
                                dateObj
                                  ? `${dateObj.getDate()} de ${monthNames[dateObj.getMonth()]}`
                                  : 'Espaço vazio'
                              }
                            >
                              {dateObj ? dateObj.getDate() : ''}
                              {hasEvent && (
                                <span
                                  className="mt-1 w-2 h-2 rounded-full"
                                  style={{ backgroundColor: 'var(--color-primary)' }}
                                ></span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Visualização de Semana */}
                {viewMode === 'Semana' && (
                  <Card
                    className="md:col-span-3 shadow-sm border"
                    style={{
                      backgroundColor: 'var(--bg-light-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <CardContent className="p-4">
                      <div
                        className="grid grid-cols-7 border-b pb-2 mb-2 select-none text-xs sm:text-base" // Adjusted font size for week days
                        style={{ borderColor: 'var(--border-color)' }}
                      >
                        {getDaysInWeek().map((date, idx) => (
                          <div
                            key={idx}
                            className="text-center font-semibold"
                            style={{ color: 'var(--text-light-primary)' }}
                          >
                            {weekDays[date.getDay()]} <br/> {date.getDate()}/{date.getMonth() + 1}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 sm:gap-2 h-96 overflow-y-auto"> {/* Reduced gap on small screens */}
                        {getDaysInWeek().map((date, idx) => {
                          const eventsOnDay = getEventsForSpecificDay(date);
                          const isCurrentDay = isToday(date);

                          return (
                            <div
                              key={idx}
                              className={`
                                flex flex-col items-center border rounded-lg p-1 sm:p-2 text-xs sm:text-sm relative cursor-pointer
                                ${isCurrentDay ? 'calendar-day-today-highlight' : ''}
                                ${selectedEvent && selectedEvent.date && selectedEvent.date.toDateString() === date.toDateString() ? 'bg-[var(--color-primary)] bg-opacity-20' : ''}
                              `}
                              style={{ color: 'var(--text-light-primary)', backgroundColor: 'var(--bg-light-primary)', borderColor: 'var(--border-color)' }}
                              onClick={() => handleDayClick(date)}
                            >
                              <span className="font-bold mb-1">{date.getDate()}</span>
                              {eventsOnDay.map((event, eventIdx) => (
                                <span
                                  key={event.id || eventIdx}
                                  className="w-full text-xs truncate mt-1 px-1 rounded cursor-pointer"
                                  style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                                  title={`${event.title} (${event.start.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })})`}
                                >
                                  {event.start.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} {event.title}
                                </span>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Visualização de Dia */}
                {viewMode === 'Dia' && (
                  <Card
                    className="md:col-span-4 shadow-sm border"
                    style={{
                      backgroundColor: 'var(--bg-light-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <CardContent className="p-4">
                      <h3
                        className="text-lg sm:text-xl font-semibold mb-4 text-center" // Adjusted font size
                        style={{ color: 'var(--text-light-primary)' }}
                      >
                        Eventos para {currentDate.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="h-96 overflow-y-auto">
                        {getEventsForSpecificDay(currentDate).length > 0 ? (
                          getEventsForSpecificDay(currentDate)
                            .sort((a, b) => a.start - b.start)
                            .map((event, idx) => (
                              <div
                                key={event.id || idx}
                                className="mb-4 p-3 rounded-lg flex flex-col"
                                style={{
                                  borderLeft: '4px solid var(--color-primary)',
                                  backgroundColor: 'var(--bg-light-primary)',
                                  color: 'var(--text-light-primary)',
                                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                }}
                              >
                                <h4 className="font-bold text-base sm:text-lg mb-1">{event.title}</h4> {/* Adjusted font size */}
                                {event.description && (
                                    <p className="text-xs sm:text-sm italic mb-1" style={{ color: 'var(--text-light-secondary)' }}> {/* Adjusted font size */}
                                        {event.description}
                                    </p>
                                )}
                                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-light-secondary)' }}> {/* Adjusted font size */}
                                  <span className="font-semibold">Início:</span> {event.start.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-light-secondary)' }}> {/* Adjusted font size */}
                                  <span className="font-semibold">Fim:</span> {event.end.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {event.doctorName && (
                                    <p className="text-xs sm:text-sm" style={{ color: 'var(--text-light-secondary)' }}> {/* Adjusted font size */}
                                        <span className="font-semibold">Médico:</span> {event.doctorName}
                                    </p>
                                )}
                              </div>
                            ))
                        ) : (
                          <p className="text-center mt-8 text-sm sm:text-base" style={{ color: 'var(--text-light-secondary)' }}> {/* Adjusted font size */}
                            Nenhum evento agendado para este dia.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Visualização de Ano */}
                {viewMode === 'Ano' && (
                  <>
                    <Card
                      className="md:col-span-3 shadow-sm border"
                      style={{
                        backgroundColor: 'var(--bg-light-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      <CardContent className="p-4">
                        <h3
                          className="text-lg sm:text-xl font-semibold mb-4 text-center" // Adjusted font size
                          style={{ color: 'var(--text-light-primary)' }}
                        >
                          {currentDate.getFullYear()}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 max-h-[80vh] overflow-y-auto"> {/* Adjusted grid cols for responsiveness */}
                          {monthNames.map((monthName, monthIndex) => (
                            <button
                              key={monthIndex}
                              onClick={() => setSelectedMonthInYearView(prev => prev === monthIndex ? null : monthIndex)}
                              className={`p-2 sm:p-3 border rounded-lg transition-all duration-200
                                ${selectedMonthInYearView === monthIndex ? 'bg-[var(--color-primary)] bg-opacity-20 border-[var(--color-primary)]' : ''}
                              `}
                              style={{
                                borderColor: 'var(--border-color)',
                                backgroundColor: 'var(--bg-light-primary)',
                                color: 'var(--text-light-primary)'
                              }}
                            >
                              <h4 className="text-sm sm:text-md font-semibold mb-1 sm:mb-2 text-center" style={{ color: 'var(--text-light-primary)' }}>{monthName}</h4> {/* Adjusted font size */}
                              <div className="grid grid-cols-7 gap-0.5 text-xs text-center">
                                {weekDays.map(day => (
                                  <div key={day} className="font-bold" style={{ color: 'var(--text-light-secondary)' }}>{day.charAt(0)}</div>
                                ))}
                                {getDaysInMonth(currentDate.getFullYear(), monthIndex).map((dateObj, dayIdx) => {
                                  const hasEvent = dateObj && getEventsForSpecificDay(dateObj).length > 0;
                                  const isCurrentDay = isToday(dateObj);

                                  return (
                                    <div
                                      key={dayIdx}
                                      className={`w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full text-xs
                                        ${isCurrentDay ? 'calendar-day-today-highlight-year' : ''}
                                        ${hasEvent && !isCurrentDay ? 'bg-[var(--color-primary)] text-white' : ''}
                                        `}
                                      style={{
                                        backgroundColor: isCurrentDay ? 'var(--color-primary)' : (hasEvent ? 'rgba(123, 63, 188, 0.4)' : 'transparent'),
                                        color: (hasEvent || isCurrentDay) ? 'white' : 'var(--text-light-primary)'
                                      }}
                                    >
                                      {dateObj ? dateObj.getDate() : ''}
                                    </div>
                                  );
                                })}
                              </div>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    {selectedMonthInYearView !== null && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="md:col-span-1"
                      >
                        <Card className="shadow-sm border h-full" style={{ backgroundColor: 'var(--bg-light-primary)', borderColor: 'var(--border-color)' }}>
                          <CardContent className="p-4">
                            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center" style={{ color: 'var(--text-light-primary)' }}>
                              Eventos em {monthNames[selectedMonthInYearView]} de {currentDate.getFullYear()}
                            </h3>
                            <div className="h-96 overflow-y-auto">
                              {Object.entries(getEventsForMonthInYear(currentDate.getFullYear(), selectedMonthInYearView)).length > 0 ? (
                                Object.entries(getEventsForMonthInYear(currentDate.getFullYear(), selectedMonthInYearView)).map(([day, eventsOnDay]) => (
                                  <div key={day} className="mb-4">
                                    <h4 className="font-bold text-base sm:text-lg mb-2" style={{ color: 'var(--text-light-primary)' }}>
                                      Dia {day}
                                    </h4>
                                    {eventsOnDay.map((event, eventIdx) => (
                                      <div
                                        key={event.id || eventIdx}
                                        className="mb-2 p-3 rounded-lg flex flex-col"
                                        style={{
                                          borderLeft: '4px solid var(--color-primary)',
                                          backgroundColor: 'var(--bg-light-primary)',
                                          color: 'var(--text-light-primary)',
                                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                        }}
                                      >
                                        <p className="font-semibold text-sm sm:text-base">{event.title}</p>
                                        <p className="text-xs sm:text-sm" style={{ color: 'var(--text-light-secondary)' }}>
                                          {event.start.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} - {event.end.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {event.doctorName && (
                                          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-light-secondary)' }}>Médico: {event.doctorName}</p>
                                        )}
                                        {event.description && (
                                          <p className="text-xs sm:text-sm italic" style={{ color: 'var(--text-light-secondary)' }}>{event.description}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ))
                              ) : (
                                <p className="text-center mt-8 text-sm sm:text-base" style={{ color: 'var(--text-light-secondary)' }}>
                                  Nenhum evento agendado para este mês.
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Painel de Detalhes do Evento (para Mês e Semana) */}
                {(viewMode === 'Mês' || viewMode === 'Semana') && selectedEvent && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="md:col-span-1"
                  >
                    <Card className="shadow-sm border h-full" style={{ backgroundColor: 'var(--bg-light-primary)', borderColor: 'var(--border-color)' }}>
                      <CardContent className="p-4">
                        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center" style={{ color: 'var(--text-light-primary)' }}>
                          Eventos para {selectedEvent.date.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="h-96 overflow-y-auto">
                          {selectedEvent.events.length > 0 ? (
                            selectedEvent.events
                              .sort((a, b) => a.start - b.start)
                              .map((event, idx) => (
                                <div
                                  key={event.id || idx}
                                  className="mb-4 p-3 rounded-lg flex flex-col"
                                  style={{
                                    borderLeft: '4px solid var(--color-primary)',
                                    backgroundColor: 'var(--bg-light-primary)',
                                    color: 'var(--text-light-primary)',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                  }}
                                >
                                  <h4 className="font-bold text-base sm:text-lg mb-1">{event.title}</h4>
                                  {event.description && (
                                    <p className="text-xs sm:text-sm italic mb-1" style={{ color: 'var(--text-light-secondary)' }}>
                                      {event.description}
                                    </p>
                                  )}
                                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-light-secondary)' }}>
                                    <span className="font-semibold">Início:</span> {event.start.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-light-secondary)' }}>
                                    <span className="font-semibold">Fim:</span> {event.end.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                  {event.doctorName && (
                                    <p className="text-xs sm:text-sm" style={{ color: 'var(--text-light-secondary)' }}>
                                      <span className="font-semibold">Médico:</span> {event.doctorName}
                                    </p>
                                  )}
                                </div>
                              ))
                          ) : (
                            <p className="text-center mt-8 text-sm sm:text-base" style={{ color: 'var(--text-light-secondary)' }}>
                              Nenhum evento selecionado ou agendado para este dia.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Modal para Novo Evento */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[var(--bg-light-primary)] rounded-lg p-6 w-full max-w-md shadow-lg border"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-light-primary)' }}>Agendar Novo Evento</h3>
            <form onSubmit={handleScheduleNewEvent}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-light-secondary)' }}>Título do Evento *</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-light-input)',
                    color: 'var(--text-light-primary)'
                  }}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-light-secondary)' }}>Data de Início *</label>
                  <input
                    type="date"
                    value={newEventStartDate}
                    onChange={(e) => setNewEventStartDate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    style={{
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-light-input)',
                      color: 'var(--text-light-primary)'
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-light-secondary)' }}>Hora de Início *</label>
                  <input
                    type="time"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    style={{
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-light-input)',
                      color: 'var(--text-light-primary)'
                    }}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-light-secondary)' }}>Data de Fim *</label>
                  <input
                    type="date"
                    value={newEventEndDate}
                    onChange={(e) => setNewEventEndDate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    style={{
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-light-input)',
                      color: 'var(--text-light-primary)'
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-light-secondary)' }}>Hora de Fim *</label>
                  <input
                    type="time"
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    style={{
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-light-input)',
                      color: 'var(--text-light-primary)'
                    }}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-light-secondary)' }}>Nome do Médico (Opcional)</label>
                <input
                  type="text"
                  value={newEventDoctorName}
                  onChange={(e) => setNewEventDoctorName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-light-input)',
                    color: 'var(--text-light-primary)'
                  }}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-light-secondary)' }}>Descrição (Opcional)</label>
                <textarea
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  className="w-full p-2 border rounded-md min-h-[80px]"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-light-input)',
                    color: 'var(--text-light-primary)'
                  }}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  variant="outline"
                  className="px-4 py-2 rounded-md"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-light-primary)',
                    color: 'var(--text-light-primary)'
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 rounded-md btn-primary"
                >
                  Agendar Evento
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Calendar;