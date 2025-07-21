import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
 MessageCircle, 
 Calendar, 
 Users, 
 Activity, 
 Video,
 ChevronDown,
 UserPlus,
 Code,
  LayoutDashboard,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '../../services/api';

const Navbar = () => {
 const location = useLocation();
 const [inviteModalOpen, setInviteModalOpen] = useState(false);
 const [inviteEmail, setInviteEmail] = useState("");
 const { toast } = useToast();

 const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/conversations', icon: MessageCircle, label: 'Conversa' }, 
  { path: '/meetings', icon: Video, label: 'Reuniões' },
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
      '/profile'
    ]; 
    if (!allowedPaths.includes(path)) {
    e.preventDefault();
    toast({
      title: "Esta funcionalidade está em desenvolvimento.",
      duration: 3000,
    });
  }
 };

  const handleInviteClick = () => {
    setInviteModalOpen(true);
  };

  const handleInviteSend = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({
        title: "Por favor, insira um e-mail válido.",
        duration: 3000,
        variant: "destructive"
      });
      return;
    }
    try {
      const token = localStorage.getItem('token') || '';
      const response = await apiFetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });
      if (response.ok) {
        toast({
          title: `Convite enviado para ${inviteEmail}!`,
          duration: 3000,
        });
        setInviteModalOpen(false);
        setInviteEmail("");
      } else {
        const data = await response.json();
        toast({
          title: data.error || "Erro ao enviar convite.",
          duration: 3000,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Erro de conexão com o servidor.",
        duration: 3000,
        variant: "destructive"
      });
    }
  };

 return (
  <>
  <motion.nav
   initial={{ x: -300 }}
   animate={{ x: 0 }}
   transition={{ duration: 0.5, ease: 'easeOut' }}
   className="fixed left-0 top-0 h-full w-64 flex flex-col"
   style={{ 
    backgroundColor: 'var(--bg-dark-secondary)',
    borderRight: '1px solid var(--border-color)'
   }}
  >
   {/* Logo */}
   <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
    <Link to="/dashboard">
     <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
      Cadence
     </h1>
    </Link>
   </div>

   {/* Navigation Items */}
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
         isActive ? 'active' : ''
        }`}
        style={{
         color: isActive ? 'white' : 'var(--text-light-primary)'
        }}
       >
        <Icon size={20} />
        <span>{item.label}</span>
       </Link>
      </motion.div>
     );
    })}

    {/* Scroll indicator */}
    <div className="flex justify-center pt-4">
     <ChevronDown 
      size={16} 
      className="opacity-50" 
      style={{ color: 'var(--text-light-secondary)' }}
     />
    </div>
   </div>

   {/* Invite Button */}
   <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
    <Button
     onClick={handleInviteClick}
     className="w-full btn-primary flex items-center justify-center space-x-2"
    >
     <UserPlus size={18} />
     <span>Convidar para Cadence</span>
    </Button>
   </div>
  </motion.nav>
  {/* Modal de convite */}
  {inviteModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={() => setInviteModalOpen(false)}
          aria-label="Fechar modal"
          type="button"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Convidar para Cadence</h2>
        <form onSubmit={handleInviteSend}>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 mb-3 text-gray-800"
            placeholder="E-mail do convidado"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
            autoFocus
          />
          <Button type="submit" className="w-full btn-primary">Enviar convite</Button>
        </form>
      </div>
    </div>
  )}
  </>
 );
};

export default Navbar;