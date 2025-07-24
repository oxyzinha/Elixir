// src/pages/Communities.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, Stethoscope, PlusCircle, Users, Image as ImageIcon } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import CommunityCard from '@/components/communities/CommunityCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

import { fetchAllCommunities, fetchUserJoinedCommunities, joinCommunity, createCommunity } from '@/services/communities';

const Communities = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [allCommunities, setAllCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDescription, setNewCommunityDescription] = useState('');
  const [newCommunityImage, setNewCommunityImage] = useState(null);
  const [newCommunityType, setNewCommunityType] = useState('support');
  const [sortOrder, setSortOrder] = useState('recent');
  const [filterType, setFilterType] = useState('all');

  const exploreSectionRef = useRef(null);

  useEffect(() => {
    const loadCommunities = async () => {
      setIsLoading(true);
      try {
        const all = await fetchAllCommunities();
        const userJoined = await fetchUserJoinedCommunities();
        setAllCommunities(all);
        setMyCommunities(userJoined);
      } catch (error) {
        console.error("Failed to load communities:", error);
        toast({
          title: "Erro ao carregar comunidades.",
          description: "Não foi possível carregar a lista de comunidades.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadCommunities();
  }, []);

  const exploreCommunities = allCommunities
    .filter(entity =>
      !entity.isJoined && (
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) && (
        filterType === 'all' || entity.type === filterType
      )
    )
    .sort((a, b) => {
      if (sortOrder === 'recent') {
        return b.id - a.id;
      } else if (sortOrder === 'members') {
        return b.membersCount - a.membersCount;
      }
      return 0;
    });

  const handleExploreSpecialties = () => {
    if (exploreSectionRef.current) {
      exploreSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      const success = await joinCommunity(communityId);
      if (success) {
        toast({
          title: "Sucesso!",
          description: "Juntaste-te à comunidade com sucesso.",
        });
        const all = await fetchAllCommunities();
        const userJoined = await fetchUserJoinedCommunities();
        setAllCommunities(all);
        setMyCommunities(userJoined);
      } else {
        toast({
          title: "Já és membro",
          description: "Já fazes parte desta comunidade.",
          variant: "info",
        });
      }
    } catch (error) {
      console.error("Failed to join community:", error);
      toast({
        title: "Erro ao juntar-se.",
        description: "Não foi possível juntar-se à comunidade.",
        variant: "destructive",
      });
    }
  };

  const handleCreateNewCommunity = async (e) => {
    e.preventDefault();
    if (!newCommunityName.trim() || !newCommunityDescription.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e a descrição da comunidade.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCommunity({
        name: newCommunityName,
        description: newCommunityDescription,
        image: newCommunityImage,
        type: newCommunityType,
      });
      toast({
        title: "Comunidade Criada!",
        description: `${newCommunityName} foi criada com sucesso.`,
      });
      setIsCreateCommunityModalOpen(false);
      setNewCommunityName('');
      setNewCommunityDescription('');
      setNewCommunityImage(null);
      setNewCommunityType('support');
      const all = await fetchAllCommunities();
      const userJoined = await fetchUserJoinedCommunities();
      setAllCommunities(all);
      setMyCommunities(userJoined);
    } catch (error) {
      console.error("Failed to create community:", error);
      toast({
        title: "Erro ao criar comunidade.",
        description: "Não foi possível criar a nova comunidade.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Comunidades - Cadence</title>
        <meta name="description" content="Conecte-se e encontre suporte em comunidades de saúde na plataforma Cadence." />
      </Helmet>
      <div className="flex min-h-screen">
        <Navbar />
        {/* Adicionado ml-0 para telas pequenas e ml-64 para telas médias e maiores */}
        <div className="flex-1 flex flex-col ml-0 md:ml-64">
          <Header />
          {/* Removido o style fixo do main. O ml-0 md:ml-64 do pai já faz o trabalho */}
          <main className="pt-24 p-4 md:p-8 flex-1 overflow-y-auto"> {/* Ajustado padding */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-7xl mx-auto"
            >
              {/* Título Principal e Botões de Ação */}
              {/* flex-col em telas pequenas, flex-row em telas médias, justify-between */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"> {/* Ajustado items-start */}
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-2xl sm:text-3xl font-bold text-center md:text-left w-full md:w-auto" // Ajustado tamanho e alinhamento
                  style={{ color: 'var(--text-light-primary)' }}
                >
                  Comunidades e Grupos de Suporte
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto" // Empilha botões em telas menores
                >
                  <Button onClick={() => setIsCreateCommunityModalOpen(true)} className="btn-secondary flex items-center gap-2 w-full sm:w-auto">
                    <PlusCircle size={18} />
                    Criar Nova Comunidade
                  </Button>
                  <Button onClick={handleExploreSpecialties} className="btn-primary flex items-center gap-2 w-full sm:w-auto">
                    <Stethoscope size={18} />
                    Explorar Especialidades
                  </Button>
                </motion.div>
              </div>

              {/* Seção 1: As Minhas Comunidades */}
              <div className="mb-12">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6" style={{ color: 'var(--text-light-primary)' }}> {/* Ajustado tamanho do título */}
                  As Minhas Comunidades
                  <Users className="inline-block ml-2 text-blue-500" size={24} />
                </h2>
                {isLoading ? (
                  <div className="text-center py-10" style={{ color: 'var(--text-light-secondary)' }}>A carregar as suas comunidades...</div>
                ) : myCommunities.length > 0 ? (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.1 } },
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8" // Ajustado gap
                  >
                    {myCommunities.map((entity) => (
                      <CommunityCard key={entity.id} community={entity} onJoin={() => { /* Botão "Ver Chat" ou "Aceder" aqui */ }} />
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-10" style={{ color: 'var(--text-light-secondary)' }}>
                    Ainda não se juntou a nenhuma comunidade. Comece a explorar abaixo!
                  </div>
                )}
              </div>

              <hr className="my-10 border-t border-gray-200 dark:border-gray-700" />

              {/* Seção 2: Explorar Novas Comunidades - Com a ref para scroll */}
              <div ref={exploreSectionRef}>
                {/* O container dos filtros e pesquisa com fundo, borda e sombra */}
                {/* flex-col em telas pequenas, flex-row em telas médias. Adicionado mb-4 em telas pequenas para h2 */}
                <div
                  className="p-4 md:p-6 rounded-xl shadow-md border mb-8 flex flex-col md:flex-row items-center justify-between gap-4" /* Ajustado padding */
                  style={{ backgroundColor: 'var(--bg-light-primary)', borderColor: 'var(--border-color)' }}
                >
                  <h2 className="text-xl sm:text-2xl font-semibold md:hidden mb-4 md:mb-0" style={{ color: 'var(--text-light-primary)' }}> {/* Ajustado tamanho e margem */}
                    Explorar Novas Comunidades
                  </h2>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-light-secondary)' }} />
                    <Input
                      placeholder="Procurar comunidades..."
                      className="pl-10 py-2 text-base rounded-md w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-light-primary)',
                        color: 'var(--text-light-primary)'
                      }}
                    />
                  </div>
                  {/* Botões de Filtro e Ordenação - Estilo "pílula" */}
                  {/* flex-wrap em telas pequenas para quebrar linha. Adicionado mt-2 md:mt-0 para espaçamento */}
                  <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start mt-4 md:mt-0 w-full md:w-auto"> {/* Ajustado margem e largura */}
                    <span className="text-sm font-medium mr-2" style={{ color: 'var(--text-light-secondary)' }}>Ordenar por:</span>
                    <Button
                      variant="ghost"
                      onClick={() => setSortOrder('recent')}
                      className={`px-4 py-1.5 rounded-full font-medium text-xs sm:text-sm transition ${sortOrder === 'recent' ? 'bg-[var(--color-primary)] text-white' : 'bg-[rgba(123,63,188,0.1)] text-[var(--color-primary)] hover:bg-[rgba(123,63,188,0.2)]'}`} // Ajustado padding e tamanho da fonte
                    >
                      Mais Recente
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setSortOrder('members')}
                      className={`px-4 py-1.5 rounded-full font-medium text-xs sm:text-sm transition ${sortOrder === 'members' ? 'bg-[var(--color-primary)] text-white' : 'bg-[rgba(123,63,188,0.1)] text-[var(--color-primary)] hover:bg-[rgba(123,63,188,0.2)]'}`} // Ajustado padding e tamanho da fonte
                    >
                      Mais Pessoas
                    </Button>
                    <span className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2"></span>
                    <span className="text-sm font-medium mr-2" style={{ color: 'var(--text-light-secondary)' }}>Tipo:</span>
                    <Button
                      variant="ghost"
                      onClick={() => setFilterType('all')}
                      className={`px-4 py-1.5 rounded-full font-medium text-xs sm:text-sm transition ${filterType === 'all' ? 'bg-[var(--color-primary)] text-white' : 'bg-[rgba(123,63,188,0.1)] text-[var(--color-primary)] hover:bg-[rgba(123,63,188,0.2)]'}`} // Ajustado padding e tamanho da fonte
                    >
                      Todas
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setFilterType('clinic')}
                      className={`px-4 py-1.5 rounded-full font-medium text-xs sm:text-sm transition ${filterType === 'clinic' ? 'bg-[var(--color-primary)] text-white' : 'bg-[rgba(123,63,188,0.1)] text-[var(--color-primary)] hover:bg-[rgba(123,63,188,0.2)]'}`} // Ajustado padding e tamanho da fonte
                    >
                      Clínicas
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setFilterType('support')}
                      className={`px-4 py-1.5 rounded-full font-medium text-xs sm:text-sm transition ${filterType === 'support' ? 'bg-[var(--color-primary)] text-white' : 'bg-[rgba(123,63,188,0.1)] text-[var(--color-primary)] hover:bg-[rgba(123,63,188,0.2)]'}`} // Ajustado padding e tamanho da fonte
                    >
                      Grupos de Suporte
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-10" style={{ color: 'var(--text-light-secondary)' }}>A carregar comunidades para explorar...</div>
                ) : exploreCommunities.length > 0 ? (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.1 } },
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8" // Ajustado gap
                  >
                    {exploreCommunities.map((entity) => (
                      <CommunityCard key={entity.id} community={entity} onJoin={() => handleJoinCommunity(entity.id)} />
                    ))}
                  </motion.div>
                ) : (
                  <div className="col-span-full text-center text-lg py-10" style={{ color: 'var(--text-light-secondary)' }}>
                    Nenhuma comunidade encontrada para "{searchTerm}".
                  </div>
                )}
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Modal para Criar Nova Comunidade com o novo estilo */}
      {isCreateCommunityModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> {/* Adicionado p-4 para padding em telas pequenas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md my-8" /* Ajustado padding e adicionado my-8 para centralizar verticalmente em telas menores */
            style={{
              backgroundColor: 'var(--bg-light-primary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-light-primary)',
              borderWidth: '1px',
            }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: 'var(--text-light-primary)' }}>Criar Nova Comunidade</h2> {/* Ajustado tamanho */}
            <p className="text-sm text-gray-500 mb-4 sm:mb-6">Preencha os detalhes para criar o seu próprio grupo de apoio ou discussão.</p> {/* Ajustado margem */}
            <form onSubmit={handleCreateNewCommunity}>
              <div className="mb-4">
                <label htmlFor="newCommunityName" className="block text-sm font-bold mb-2" style={{ color: 'var(--text-light-primary)' }}>Nome da Comunidade</label>
                <input
                  id="newCommunityName"
                  type="text"
                  placeholder="Ex: Suporte para Cancro da Mama na Adolescência"
                  className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-color-primary focus:ring-color-primary focus:ring-opacity-20
                    transition-colors duration-200 ease-in-out hover:border-[var(--color-primary-light)]"
                  style={{
                    backgroundColor: 'var(--bg-light-primary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-light-primary)'
                  }}
                  value={newCommunityName}
                  onChange={(e) => setNewCommunityName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="newCommunityDescription" className="block text-sm font-bold mb-2" style={{ color: 'var(--text-light-primary)' }}>Descrição</label>
                <textarea
                  id="newCommunityDescription"
                  rows="3"
                  placeholder="Ex: Partilhe experiências e encontre apoio..."
                  className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-color-primary focus:ring-color-primary focus:ring-opacity-20
                    resize-none transition-colors duration-200 ease-in-out hover:border-[var(--color-primary-light)]"
                  style={{
                    backgroundColor: 'var(--bg-light-primary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-light-primary)'
                  }}
                  value={newCommunityDescription}
                  onChange={(e) => setNewCommunityDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="mb-4">
                <label htmlFor="community-image-upload" className="block text-sm font-bold mb-2" style={{ color: 'var(--text-light-primary)' }}>
                  Imagem da Comunidade (Opcional)
                </label>
                <div className="flex items-center space-x-2 border rounded py-2 px-3 shadow appearance-none cursor-pointer
                  transition-colors duration-200 ease-in-out hover:border-[var(--color-primary-light)]"
                  style={{
                    backgroundColor: 'var(--bg-light-primary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-light-primary)'
                  }}>
                  <ImageIcon size={20} className="text-gray-500" />
                  <label htmlFor="community-image-upload" className="cursor-pointer text-sm font-medium">
                    Escolher ficheiro
                  </label>
                  <span className="flex-1 truncate text-gray-500 ml-2">
                    {newCommunityImage ? newCommunityImage.name : 'Nenhum ficheiro selecionado'}
                  </span>
                  <input
                    id="community-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewCommunityImage(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-light-primary)' }}>Tipo de Comunidade</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between shadow appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-color-primary focus:ring-color-primary focus:ring-opacity-20
                        transition-colors duration-200 ease-in-out hover:border-[var(--color-primary-light)]"
                      style={{
                        backgroundColor: 'var(--bg-light-primary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-light-primary)'
                      }}
                    >
                      {newCommunityType === 'clinic' ? 'Clínica/Departamento' : 'Grupo de Suporte'}
                      <Users size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]"
                    style={{
                      backgroundColor: 'var(--bg-light-primary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-light-primary)'
                    }}>
                    <DropdownMenuItem onClick={() => setNewCommunityType('clinic')}
                      style={{
                        color: 'var(--text-light-primary)',
                        '--radix-dropdown-menu-item-background-color': 'var(--hover-color-light)'
                      }}>
                      Clínica/Departamento
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNewCommunityType('support')}
                      style={{
                        color: 'var(--text-light-primary)',
                        '--radix-dropdown-menu-item-background-color': 'var(--hover-color-light)'
                      }}>
                      Grupo de Suporte
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4"> {/* Ajustado para empilhar botões */}
                <Button type="button" onClick={() => setIsCreateCommunityModalOpen(false)} className="btn-secondary px-6 py-3 rounded-xl w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary px-6 py-3 rounded-xl w-full sm:w-auto">
                  Criar Comunidade
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Communities;