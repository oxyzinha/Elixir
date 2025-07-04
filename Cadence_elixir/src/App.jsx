import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';

// Importa todas as tuas páginas
import Dashboard from '@/pages/Dashboard';
import Calendar from '@/pages/Calendar';
import MeetingRoom from '@/pages/MeetingRoom';
import Conversations from '@/pages/Conversations';
import Communities from '@/pages/Communities';
import Meetings from '@/pages/Meetings';
import Activity from '@/pages/Activity';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';

function App() {
  // Já não precisas de lógica complexa de layout aqui
  return (
    <>
      <Helmet>
        <title>Cadence - Colaboração Dinâmica e Gestão de Reuniões</title>
        <meta name="description" content="Plataforma de colaboração dinâmica e gestão de reuniões em tempo real. Conecte-se, colabore e gerencie suas reuniões de forma eficiente." />
      </Helmet>
      
      <Router>
        {/* O fundo da aplicação pode ser definido aqui ou em index.css */}
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-dark-primary)' }}>
          <Routes>
            {/* Todas as rotas são diretas para os componentes das páginas */}
            <Route path="/" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/meeting/:id" element={<MeetingRoom />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </>
  );
}

export default App; 