import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Calendar,
  Users,
  Activity,
  Video,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button'; // Verifique o caminho
import { useToast } from '@/components/ui/use-toast'; // Verifique o caminho

const Navbar = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/conversations', icon: MessageCircle, label: 'Conversa' },
    { path: '/meetings', icon: Video, label: 'Consultas' },
    { path: '/communities', icon: Users, label: 'Comunidades' },
    { path: '/calendar', icon: Calendar, label: 'Calendário' },
    { path: '/activity', icon: Activity, label: 'Atividade' },
  ];

  const handleNavClick = (e, path) => {
    const allowedPaths = [
      '/dashboard',
      '/conversations',
      '/calendar',
      '/communities',
      '/meetings',
      '/activity',
      '/code',
      '/profile',
    ];
    if (!allowedPaths.includes(path)) {
      e.preventDefault();
      toast({
        title: '🚧 Esta funcionalidade ainda não foi implementada....',
        duration: 3000,
      });
    } else {
      setIsMobileOpen(false); // fecha menu mobile ao clicar em um item de navegação
    }
  };

  return (
    <>
      {/* Botão Mobile (Ícone de Hambúrguer) - Visível apenas em telas pequenas */}
      {/* Posição fixa, topo esquerdo, com um z-index alto para garantir que esteja sempre por cima */}
      <div className="md:hidden fixed top-4 left-4 z-[1000]">
        {!isMobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Abrir menu"
            // Estilos adicionados para melhor visibilidade do botão em qualquer fundo
            className="bg-[var(--bg-light-primary)] shadow-md rounded-full p-2 text-[var(--text-light-primary)]"
          >
            <Menu size={24} />
          </Button>
        )}
      </div>

      {/* NAVBAR DESKTOP - Visível apenas em telas médias (md) e maiores */}
      {/* Posição fixa à esquerda, não ocupa espaço no fluxo do documento */}
      <motion.nav
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col bg-bg-light-primary border-r border-border-color z-40"
      >
        <div className="p-6 border-b border-border-color">
          <Link to="/dashboard">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Cadence
            </h1>
          </Link>
        </div>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.div
                key={item.path}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item.path)}
                  className={`navbar-item flex items-center space-x-3 px-4 py-3 text-sm font-medium ${
                    isActive ? 'active' : 'text-text-light-primary'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.nav>

      {/* NAVBAR MOBILE - Visível apenas quando 'isMobileOpen' é true */}
      {/* Posição fixa à esquerda, com z-index ainda mais alto para sobrepor o botão de menu e a dashboard */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.nav
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-screen w-64 bg-bg-light-primary border-r border-border-color z-[1001] p-4 flex flex-col shadow-lg"
          >
            {/* Botão fechar (X) */}
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Fechar menu"
                className="text-text-light-primary"
              >
                <X size={24} />
              </Button>
            </div>

            {/* Logo dentro do menu mobile */}
            <h1 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Cadence
            </h1>

            {/* Itens do Menu Mobile */}
            <div className="space-y-2 overflow-y-auto flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item.path)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded text-sm font-medium ${
                      isActive ? 'active' : 'text-text-light-primary'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;