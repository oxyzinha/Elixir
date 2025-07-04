import React from 'react';
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
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Navbar = () => {
 const location = useLocation();
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
    title: "🚧 Esta funcionalidade ainda não foi implementada....",
    duration: 3000,
   });
  }
 };

 const handleInviteClick = () => {
  toast({
   title: "🚧 Esta funcionalidade ainda não foi implementada....",
   duration: 3000,
  });
 };

 return (
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
 );
};

export default Navbar;