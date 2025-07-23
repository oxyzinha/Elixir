// src/pages/CommunityDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react'; // Ícones para o botão de informação e fechar

import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { useToast } from '@/components/ui/use-toast';
import { fetchCommunityById } from '@/services/communities'; // Para buscar a comunidade
import CommunityChat from '@/components/communities/CommunityChat'; // Caminho CORRIGIDO
import CommunityInfo from '@/components/communities/CommunityInfo'; // O seu componente de informação

const CommunityDetails = () => {
  const { communityId } = useParams();
  const [community, setCommunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInfoPanel, setShowInfoPanel] = useState(false); // Estado para controlar o painel de informação

  const { toast } = useToast();

  const currentUserId = "Eu"; // Mudar para o ID real do utilizador logado, se necessário

  useEffect(() => {
    const loadCommunityDetails = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCommunityById(communityId);
        setCommunity(data);
      } catch (error) {
        console.error("Failed to load community details:", error);
        toast({
          title: "Erro ao carregar detalhes da comunidade.",
          description: "Não foi possível carregar as informações desta comunidade.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (communityId) {
      loadCommunityDetails();
    }
  }, [communityId, toast]);

  // Variantes para a animação do painel lateral
  const sidebarVariants = {
    hidden: { x: '100%' }, // Começa fora da tela, à direita
    visible: { x: '0%', transition: { type: "spring", stiffness: 100, damping: 20 } }, // Desliza para dentro
    exit: { x: '100%', transition: { type: "spring", stiffness: 100, damping: 20 } }, // Desliza para fora
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1">
          <Header />
          <main className="pt-24 p-8" style={{ marginLeft: '16rem', flexGrow: 1, overflowY: 'auto' }}>
            <div className="text-center py-20" style={{ color: 'var(--text-light-secondary)' }}>
              A carregar detalhes da comunidade...
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1">
          <Header />
          <main className="pt-24 p-8" style={{ marginLeft: '16rem', flexGrow: 1, overflowY: 'auto' }}>
            <div className="text-center py-20" style={{ color: 'var(--text-light-secondary)' }}>
              Comunidade não encontrada.
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{community.name} - Comunidade - Cadence</title>
        <meta name="description" content={`Detalhes da comunidade: ${community.name}`} />
      </Helmet>
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="pt-24 p-8 flex-1 flex relative" style={{ marginLeft: '16rem', overflow: 'hidden' }}>
            {/* Conteúdo Principal (Chat e Cabeçalho da Comunidade) */}
            <div
              className="flex flex-col max-w-6xl mx-auto rounded-xl shadow-md border overflow-hidden w-full"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-light-primary)' }}
            >
              {/* Cabeçalho da Comunidade (Nome, Descrição, Imagem) */}
              <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-6">
                  {community.image && (
                    <img
                      src={community.image}
                      alt={community.name}
                      className="w-20 h-20 rounded-full object-cover border-2 flex-shrink-0"
                      style={{ borderColor: 'var(--color-primary)' }}
                    />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-light-primary)' }}>
                      {community.name}
                    </h1>
                    <p className="text-base" style={{ color: 'var(--text-light-secondary)' }}>
                      {community.type === 'clinic' ? 'Clínica/Departamento' : 'Grupo de Suporte'} - {community.membersCount || 0} Membros
                    </p>
                  </div>
                </div>
                {/* Botão de Informação */}
                <button
                  onClick={() => setShowInfoPanel(!showInfoPanel)}
                  className="p-2 rounded-full hover:bg-[var(--bg-light-secondary)] transition-colors"
                  aria-label="Mostrar/esconder informações da comunidade"
                  title="Informações da Comunidade"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <Info size={24} />
                </button>
              </div>
              {/* REMOVIDA A SECÇÃO DE DESCRIÇÃO AQUI */}
              {/* A descrição detalhada está agora apenas no painel de informações */}

              {/* Área principal de conteúdo (Chat) */}
              <div className="flex-1 flex flex-col">
                <CommunityChat communityId={communityId} currentUserId={currentUserId} />
              </div>
            </div>

            {/* Painel de Informação (Side Panel) */}
            <AnimatePresence>
              {showInfoPanel && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={sidebarVariants}
                  // z-index ajustado para 10, right-8 para alinhar com o padding da main
                  className={`fixed right-8 top-0 h-full w-80 shadow-lg border-l z-10 flex flex-col pt-24`} 
                  style={{ backgroundColor: 'var(--bg-light-primary)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-light-primary)' }}>Informações da Comunidade</h2>
                    <button
                      onClick={() => setShowInfoPanel(false)}
                      className="p-1 rounded-full hover:bg-[var(--bg-light-secondary)] transition-colors"
                      aria-label="Fechar informações da comunidade"
                      title="Fechar"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  {/* Passa o objeto 'community' completo para CommunityInfo */}
                  <CommunityInfo community={community} /> 
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </>
  );
};

export default CommunityDetails;