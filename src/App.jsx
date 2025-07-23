// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { ActivityNotificationProvider } from '@/context/ActivityNotificationContext';

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
import CommunityDetails from '@/pages/CommunityDetails'; // Importa o novo componente da versão Front

function App() {
  return (
    <>
      <Helmet>
        {/* Título ajustado para "Consultas" */}
        <title>Cadence - Colaboração Dinâmica e Gestão de Consultas</title>
        {/* Meta descrição ajustada para "consultas" */}
        <meta name="description" content="Plataforma de colaboração dinâmica e gestão de consultas em tempo real. Conecte-se, colabore e gerencie suas consultas de forma eficiente." />
      </Helmet>

      <Router>
        {/* Envolvendo a aplicação com ActivityNotificationProvider da versão Front */}
        <ActivityNotificationProvider>
          {/* Cor de fundo da aplicação da versão Front */}
          <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-light-primary)' }}>
            <Routes>
              {/* Todas as rotas existentes */}
              <Route path="/" element={<Auth />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/communities" element={<Communities />} />
              {/* Rota dinâmica para CommunityDetails da versão Front */}
              <Route path="/communities/:communityId" element={<CommunityDetails />} /> 
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/meeting/:id" element={<MeetingRoom />} />
            </Routes>
            <Toaster />
          </div>
        </ActivityNotificationProvider>
      </Router>
    </>
  );
}

export default App;