import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Briefcase, Calendar } from 'lucide-react';

const Profile = () => {
  const { toast } = useToast();

  const handleEditProfile = () => {
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada.",
      description: "Mas você pode solicitá-la no seu próximo prompt! 🚀",
      duration: 3000,
    });
  };

  return (
    <>
      <Helmet>
        <title>O Meu Perfil - Cadence</title>
        <meta name="description" content="Página de perfil do utilizador na plataforma Cadence." />
      </Helmet>

      <div className="flex min-h-screen">
        <Navbar />
        
        <div className="flex-1 ml-64">
          <Header />
          
          <main className="pt-16 p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-light-primary)' }}>
                O Meu Perfil
              </h1>

              <Card>
                <CardContent className="pt-6 flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    <Avatar className="h-32 w-32 border-4" style={{ borderColor: 'var(--color-primary)' }}>
                      <AvatarImage src="/placeholder-avatar.jpg" alt="João Silva" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <h2 className="text-3xl font-bold mt-6" style={{ color: 'var(--text-light-primary)' }}>
                    João Silva
                  </h2>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-3 h-3 rounded-full status-online"></div>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-accent-green)' }}>
                      Online
                    </span>
                  </div>
                  
                  <div className="w-full mt-8 space-y-4 text-left">
                    <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <Mail size={20} style={{ color: 'var(--text-light-secondary)' }} />
                      <span style={{ color: 'var(--text-light-primary)' }}>joao.silva@cadence.com</span>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <Briefcase size={20} style={{ color: 'var(--text-light-secondary)' }} />
                      <span style={{ color: 'var(--text-light-primary)' }}>Desenvolvedor Frontend</span>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <Calendar size={20} style={{ color: 'var(--text-light-secondary)' }} />
                      <span style={{ color: 'var(--text-light-primary)' }}>Membro desde: Junho 2025</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleEditProfile}
                    className="w-full mt-8 btn-primary"
                  >
                    Editar Perfil
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Profile;