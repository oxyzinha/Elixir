import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Video,
  CalendarCheck,
  Pill,
  FileText
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar'; // **IMPORTANTE: Confirme este caminho!**
import Header from '@/components/layout/Header'; // Assumindo que você tem este componente
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Verifique o caminho
import { Button } from '@/components/ui/button'; // Verifique o caminho
import { useToast } from '@/components/ui/use-toast'; // Verifique o caminho

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleStartSecureChat = () => {
    navigate('/conversations');
  };

  const handleStartUrgentConsultation = () => {
    toast({
      title: "A iniciar teleconsulta urgente...",
      duration: 1500,
    });
    navigate('/meeting/urgent-call');
  };

  const handleViewAppointmentDetails = () => {
    navigate('/calendar');
  };

  const handleViewMedicationReminders = () => {
    navigate('/activity');
    toast({ title: "Visualizando lembretes de medicação...", duration: 1500 });
  };

  const handleViewRecentDocuments = () => {
    navigate('/activity');
    toast({ title: "Visualizando documentos recentes...", duration: 1500 });
  };

  return (
    <>
      <Helmet>
        <title>Painel de Saúde - Cadence</title>
        <meta name="description" content="O seu portal de saúde Cadence: teleconsultas, agendamentos e lembretes de medicação." />
      </Helmet>

      {/* Fundo principal e container flex para o layout geral */}
      <div className="relative flex min-h-screen font-sans bg-[var(--bg-light-primary)] text-[var(--text-light-primary)]">
        {/* A Navbar é renderizada aqui. Ela é fixed, então não ocupa espaço no fluxo normal. */}
        <Navbar />

        {/* CONTAINER PRINCIPAL DO CONTEÚDO DA DASHBOARD */}
        {/* md:ml-64: Adiciona margem à esquerda APENAS em telas desktop, para compensar a largura da Navbar. */}
        {/* Em telas menores, esta margem não é aplicada, permitindo que o conteúdo comece do canto esquerdo e a Navbar mobile o sobreponha. */}
        <div className="flex-1 flex flex-col bg-[var(--bg-light-primary)] md:ml-64">
          <Header /> {/* Seu componente Header deve estar aqui */}

          <main className="pt-28 px-6 sm:px-12 md:px-16 py-12 flex-1 max-w-7xl mx-auto w-full select-none">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Título */}
              <div className="mb-16 max-w-4xl">
                <motion.h1
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.8, ease: 'easeOut' }}
                  className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-wide leading-tight text-[var(--text-light-primary)]"
                  style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
                >
                  Bem-vindo ao Painel de Saúde Cadence, João Silva
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                  className="text-sm sm:text-base md:text-lg mt-4 text-[var(--text-light-secondary)] leading-relaxed"
                  style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
                >
                  Uma visão geral clara e simples para acompanhar suas consultas, mensagens e lembretes.
                </motion.p>
              </div>

              {/* Grid de cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                {/* Card: Mensagem Segura */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                >
                  <Card
                    className="flex flex-col justify-between h-full p-8 sm:p-10 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-light-primary)] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardHeader className="p-0 mb-6 flex items-center space-x-4 sm:space-x-5">
                      <div className="p-4 sm:p-5 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(123, 63, 188, 0.1)' }}>
                        <MessageCircle size={28} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-wide text-[var(--text-light-primary)]">
                          Enviar Mensagem Segura
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-md mt-1 sm:mt-2 text-[var(--text-light-secondary)] leading-relaxed max-w-xs">
                          Comunique diretamente com os seus profissionais de saúde.
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleStartSecureChat}
                      className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl"
                      style={{
                        backgroundColor: 'rgba(123, 63, 188, 0.2)',
                        color: 'var(--color-primary)',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(123, 63, 188, 0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(123, 63, 188, 0.2)'}
                    >
                      Iniciar Chat
                    </Button>
                  </Card>
                </motion.div>

                {/* Card: Teleconsulta */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                >
                  <Card className="flex flex-col justify-between h-full p-8 sm:p-10 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-light-primary)] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="p-0 mb-6 flex items-center space-x-4 sm:space-x-5">
                      <div className="p-4 sm:p-5 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                        <Video size={28} style={{ color: 'var(--color-accent-green)' }} />
                      </div>
                      <div>
                        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-wide text-[var(--text-light-primary)]">
                          Iniciar Teleconsulta
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-md mt-1 sm:mt-2 text-[var(--text-light-secondary)] leading-relaxed max-w-xs">
                          Inicie uma consulta de vídeo agendada ou urgente.
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleStartUrgentConsultation}
                      className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl"
                      style={{
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        color: 'var(--color-accent-green)',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(76, 175, 80, 0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(76, 175, 80, 0.2)'}
                    >
                      Entrar na Consulta
                    </Button>
                  </Card>
                </motion.div>

                {/* Card: Próxima Consulta */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                >
                  <Card className="flex flex-col justify-between h-full p-8 sm:p-10 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-light-primary)] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="p-0 mb-6 flex items-center space-x-4 sm:space-x-5">
                      <div className="p-4 sm:p-5 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                        <CalendarCheck size={28} style={{ color: 'var(--color-accent-yellow)' }} />
                      </div>
                      <div>
                        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-wide text-[var(--text-light-primary)]">
                          Próxima Consulta
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-md mt-1 sm:mt-2 text-[var(--text-light-secondary)] leading-relaxed max-w-xs">
                          Consulte detalhes e altere sua agenda.
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleViewAppointmentDetails}
                      className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl"
                      style={{
                        backgroundColor: 'rgba(255, 193, 7, 0.2)',
                        color: 'var(--color-accent-yellow)',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 193, 7, 0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 193, 7, 0.2)'}
                    >
                      Ver Agenda
                    </Button>
                  </Card>
                </motion.div>

                {/* Card: Lembretes de Medicação */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                >
                  <Card className="flex flex-col justify-between h-full p-8 sm:p-10 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-light-primary)] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="p-0 mb-6 flex items-center space-x-4 sm:space-x-5">
                      <div className="p-4 sm:p-5 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(3, 169, 244, 0.1)' }}>
                        <Pill size={28} style={{ color: 'var(--color-accent-blue)' }} />
                      </div>
                      <div>
                        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-wide text-[var(--text-light-primary)]">
                          Lembretes de Medicação
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-md mt-1 sm:mt-2 text-[var(--text-light-secondary)] leading-relaxed max-w-xs">
                          Acompanhe e gerencie seus horários de remédio.
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleViewMedicationReminders}
                      className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl"
                      style={{
                        backgroundColor: 'rgba(3, 169, 244, 0.2)',
                        color: 'var(--color-accent-blue)',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(3, 169, 244, 0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(3, 169, 244, 0.2)'}
                    >
                      Ver Lembretes
                    </Button>
                  </Card>
                </motion.div>

                {/* Card: Documentos Recentes */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
                >
                  <Card className="flex flex-col justify-between h-full p-8 sm:p-10 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-light-primary)] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="p-0 mb-6 flex items-center space-x-4 sm:space-x-5">
                      <div className="p-4 sm:p-5 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(233, 30, 99, 0.1)' }}>
                        <FileText size={28} style={{ color: 'var(--color-accent-pink)' }} />
                      </div>
                      <div>
                        <CardTitle className="text-xl sm:text-2xl font-semibold tracking-wide text-[var(--text-light-primary)]">
                          Documentos Recentes
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-md mt-1 sm:mt-2 text-[var(--text-light-secondary)] leading-relaxed max-w-xs">
                          Veja seus relatórios e resultados.
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleViewRecentDocuments}
                      className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl"
                      style={{
                        backgroundColor: 'rgba(233, 30, 99, 0.2)',
                        color: 'var(--color-accent-pink)',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(233, 30, 99, 0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(233, 30, 99, 0.2)'}
                    >
                      Ver Documentos
                    </Button>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;