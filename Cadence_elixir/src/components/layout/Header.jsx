import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import NotificationsPopup from '@/components/layout/NotificationsPopup';

const Header = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleFeatureClick = (feature) => {
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada...",
      duration: 3000,
    });
  };
  
  const handleLogout = () => {
    toast({
      title: "Terminando sessão...",
      duration: 1500,
    });
    setTimeout(() => navigate('/auth'), 1500);
  }

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      // ALTEIRADO: backgroundColor para branco puro (#FFFFFF) para ser sólido
      // O z-20 já está bom para a sobreposição
      className="fixed top-0 left-64 right-0 h-16 flex items-center justify-between px-6 z-20"
      style={{ 
        backgroundColor: '#FFFFFF', // Alterado para branco puro
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            size={18}
            style={{ color: 'var(--text-light-secondary)' }}
          />
          <Input
            placeholder="Procurar..."
            className="pl-10 w-full"
            onClick={() => handleFeatureClick('search')}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full transition-colors hover:bg-white/10 relative"
            style={{ 
              color: 'var(--text-light-secondary)',
              // Se quiser que o fundo do botão seja sólido e não transparente, mude 'transparent'
              backgroundColor: 'transparent' // Manter transparente ou mudar para cor sólida
            }}
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{backgroundColor: 'var(--color-primary)'}}></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{backgroundColor: 'var(--color-primary)'}}></span>
            </span>
          </motion.button>
          <NotificationsPopup isVisible={showNotifications} />
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleFeatureClick('help')}
          className="p-2 rounded-full transition-colors hover:bg-white/10"
          style={{ 
            color: 'var(--text-light-secondary)',
            // Se quiser que o fundo do botão seja sólido e não transparente, mude 'transparent'
            backgroundColor: 'transparent' // Manter transparente ou mudar para cor sólida
          }}
        >
          <HelpCircle size={20} />
        </motion.button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-light-primary)' }}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Utilizador" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium">João Silva</div>
                <div className="flex items-center space-x-1">
                  <div 
                    className="w-2 h-2 rounded-full status-online"
                  ></div>
                  <span className="text-xs" style={{ color: 'var(--text-light-secondary)' }}>
                    Online
                  </span>
                </div>
              </div>
              <ChevronDown size={16} style={{ color: 'var(--text-light-secondary)' }} />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFeatureClick('settings')}>
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFeatureClick('preferences')}>
              Preferências
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Terminar Sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
};

export default Header;