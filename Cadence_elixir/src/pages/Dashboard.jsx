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
import { useAuth } from "../lib/authContext";

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

  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Painel de Saúde - Cadence</title>
        <meta name="description" content="O seu portal de saúde Cadence: teleconsultas, agendamentos e lembretes de medicação." />
      </Helmet>

      <div className="relative flex min-h-screen font-sans bg-white text-gray-900">
        <Navbar />

        <div className="flex-1 ml-64 flex flex-col bg-white">
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
                  className="text-5xl font-semibold tracking-wide leading-tight"
                  style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
                >
                  Bem-vindo ao Painel de Saúde Cadence, {user?.name ?? 'Usuário'}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                  className="text-lg mt-4 text-gray-600 leading-relaxed"
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
                    className="flex flex-col justify-between h-full p-10 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardHeader className="p-0 mb-8 flex items-center space-x-5">
                      <div className="p-5 rounded-xl flex-shrink-0 bg-indigo-100">
                        <MessageCircle size={36} className="text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-semibold tracking-wide text-gray-900">
                          Enviar Mensagem Segura
                        </CardTitle>
                        <CardDescription className="text-md mt-2 text-gray-600 leading-relaxed max-w-xs">
                          Comunique diretamente com os seus profissionais de saúde.
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleStartSecureChat}
                      className="w-full h-14 text-lg font-semibold rounded-xl bg-indigo-200 text-indigo-800 hover:bg-indigo-300 transition-colors shadow-sm"
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
                  <Card className="flex flex-col justify-between h-full p-10 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="p-0 mb-8 flex items-center space-x-5">
                      <div className="p-5 rounded-xl flex-shrink-0 bg-teal-100">
                        <Video size={36} className="text-teal-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-semibold tracking-wide text-gray-900">
                          Iniciar Teleconsulta
                        </CardTitle>
                        <CardDescription className="text-md mt-2 text-gray-600 leading-relaxed max-w-xs">
                          Inicie uma consulta de vídeo agendada ou urgente.
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleStartUrgentConsultation}
                      className="w-full h-14 text-lg font-semibold rounded-xl bg-teal-200 text-teal-800 hover:bg-teal-300 transition-colors shadow-sm"
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
                  <Card className="flex flex-col justify-between h-full p-10 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="p-0 mb-8 flex items-center space-x-5">
                      <div className="p-5 rounded-xl flex-shrink-0 bg-yellow-100">
                        <CalendarCheck size={36} className="text-yellow-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-semibold tracking-wide text-gray-900">
                          Próxima Consulta
                        </CardTitle>
                        <CardDescription className="text-md mt-2 text-gray-600 leading-relaxed max-w-xs">
                          Com Dr. Silva - 28 Junho, 10:00
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleViewAppointmentDetails}
                      className="w-full h-14 text-lg font-semibold rounded-xl border border-yellow-300 text-yellow-700 hover:bg-yellow-50 transition-colors shadow-sm"
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
                  <Card className="flex flex-col justify-between h-full p-10 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="p-0 mb-8 flex items-center space-x-5">
                      <div className="p-5 rounded-xl flex-shrink-0 bg-pink-100">
                        <Pill size={36} className="text-pink-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-semibold tracking-wide text-gray-900">
                          Lembretes de Medicação
                        </CardTitle>
                        <CardDescription className="text-md mt-2 text-gray-600 leading-relaxed max-w-xs">
                          Mantenha o controle das suas doses diárias.
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleViewMedicationReminders}
                      className="w-full h-14 text-lg font-semibold rounded-xl bg-pink-200 text-pink-800 hover:bg-pink-300 transition-colors shadow-sm"
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
                  <Card className="flex flex-col justify-between h-full p-10 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="p-0 mb-8 flex items-center space-x-5">
                      <div className="p-5 rounded-xl flex-shrink-0 bg-cyan-100">
                        <FileText size={36} className="text-cyan-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-semibold tracking-wide text-gray-900">
                          Documentos Recentes
                        </CardTitle>
                        <CardDescription className="text-md mt-2 text-gray-600 leading-relaxed max-w-xs">
                          Acesse seus exames e relatórios mais recentes.
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <Button
                      onClick={handleViewRecentDocuments}
                      className="w-full h-14 text-lg font-semibold rounded-xl bg-cyan-200 text-cyan-800 hover:bg-cyan-300 transition-colors shadow-sm"
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
