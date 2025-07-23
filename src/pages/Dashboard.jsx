// src/pages/Dashboard.jsx
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
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

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

      {/* Fundo principal branco e texto principal */}
      <div className="relative flex min-h-screen font-sans bg-[var(--bg-light-primary)] text-[var(--text-light-primary)]">
        <Navbar />

        <div className="flex-1 ml-64 flex flex-col bg-[var(--bg-light-primary)]">
          <Header />

          <main className="pt-28 px-16 py-12 flex-1 max-w-7xl mx-auto w-full select-none">
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
                  className="text-5xl font-semibold tracking-wide leading-tight text-[var(--text-light-primary)]"
                  style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
                >
                  Bem-vindo ao Painel de Saúde Cadence, João Silva
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                  className="text-lg mt-4 text-[var(--text-light-secondary)] leading-relaxed"
                  style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
                >
                  Uma visão geral clara e simples para acompanhar suas consultas, mensagens e lembretes.
                </motion.p>
              </div>

              {/* Grid de cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {/* Card: Mensagem Segura */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                >
                  <Card
                    className="flex flex-col justify-between h-full p-10 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-light-primary)] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardHeader className="p-0 mb-8 flex items-center space-x-5">
                      {/* Cor primaria: #7B3FBC */}
                      <div className="p-5 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(123, 63, 188, 0.1)' }}>
                        <MessageCircle size={36} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-semibold tracking-wide text-[var(--text-light-primary)]">
                          Enviar Mensagem Segura
                        </CardTitle>
                        <CardDescription className="text-md mt-2 text-[var(--text-light-secondary)] leading-relaxed max-w-xs">
                          Comunique diretamente com os seus profissionais de saúde.
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleStartSecureChat}
                      className="w-full h-14 text-lg font-semibold rounded-xl"
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
                  <Card className="flex flex-col justify-between h-full p-10 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-light-primary)] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="p-0 mb-8 flex items-center space-x-5">
                      {/* Cor accent-green: #4CAF50 */}
                      <div className="p-5 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                        <Video size={36} style={{ color: 'var(--color-accent-green)' }} />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-semibold tracking-wide text-[var(--text-light-primary)]">
                          Iniciar Teleconsulta
                        </CardTitle>
                        <CardDescription className="text-md mt-2 text-[var(--text-light-secondary)] leading-relaxed max-w-xs">
                          Inicie uma consulta de vídeo agendada ou urgente.
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleStartUrgentConsultation}
                      className="w-full h-14 text-lg font-semibold rounded-xl"
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
                  <Card className="flex flex-col justify-between h-full p-10 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-light-primary)] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="p-0 mb-8 flex items-center space-x-5">
                      {/* Cor warning: #DAA520 (RGB: 218, 165, 32) */}
                      <div className="p-5 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(218, 165, 32, 0.1)' }}>
                        <CalendarCheck size={36} style={{ color: 'var(--color-warning)' }} />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-semibold tracking-wide text-[var(--text-light-primary)]">
                          Próxima Consulta
                        </CardTitle>
                        <CardDescription className="text-md mt-2 text-[var(--text-light-secondary)] leading-relaxed max-w-xs">
                          Com Dr. Silva - 28 Junho, 10:00
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleViewAppointmentDetails}
                      className="w-full h-14 text-lg font-semibold rounded-xl" // Removida a classe 'border'
                      style={{
                        backgroundColor: 'rgba(218, 165, 32, 0.2)', // Fundo amarelo com 20% de opacidade
                        color: 'var(--color-warning)', // Texto com a cor da warning
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(218, 165, 32, 0.3)'} // Fundo mais escuro ao hover
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(218, 165, 32, 0.2)'} // Volta ao normal ao sair
                    >
                      Ver Detalhes
                    </Button>
                  </Card>
                </motion.div>

                {/* Card: Lembretes de Medicação */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                >
                  <Card className="flex flex-col justify-between h-full p-10 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-light-primary)] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="p-0 mb-8 flex items-center space-x-5">
                      {/* Cor accent-pink: #D84D9C (RGB: 216, 77, 156) */}
                      <div className="p-5 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(216, 77, 156, 0.1)' }}>
                        <Pill size={36} style={{ color: 'var(--color-accent-pink)' }} />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-semibold tracking-wide text-[var(--text-light-primary)]">
                          Lembretes de Medicação
                        </CardTitle>
                        <CardDescription className="text-md mt-2 text-[var(--text-light-secondary)] leading-relaxed max-w-xs">
                          Mantenha o controle das suas doses diárias.
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleViewMedicationReminders}
                      className="w-full h-14 text-lg font-semibold rounded-xl"
                      style={{
                        backgroundColor: 'rgba(216, 77, 156, 0.2)',
                        color: 'var(--color-accent-pink)',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(216, 77, 156, 0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(216, 77, 156, 0.2)'}
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
                  <Card className="flex flex-col justify-between h-full p-10 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-light-primary)] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="p-0 mb-8 flex items-center space-x-5">
                      {/* Cor accent-blue: #007BFF (RGB: 0, 123, 255) */}
                      <div className="p-5 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(0, 123, 255, 0.1)' }}>
                        <FileText size={36} style={{ color: 'var(--color-accent-blue)' }} />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-semibold tracking-wide text-[var(--text-light-primary)]">
                          Documentos Recentes
                        </CardTitle>
                        <CardDescription className="text-md mt-2 text-[var(--text-light-secondary)] leading-relaxed max-w-xs">
                          Acesse seus exames e relatórios mais recentes.
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleViewRecentDocuments}
                      className="w-full h-14 text-lg font-semibold rounded-xl"
                      style={{
                        backgroundColor: 'rgba(0, 123, 255, 0.2)',
                        color: 'var(--color-accent-blue)',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.2)'}
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