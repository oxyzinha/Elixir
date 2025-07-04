  import React from 'react';
  import { Helmet } from 'react-helmet';
  import { motion } from 'framer-motion';
  import { Plus, Search, Users, Stethoscope } from 'lucide-react'; // Ícone Hospital substituído por Users
  import Navbar from '@/components/layout/Navbar';
  import Header from '@/components/layout/Header';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { useToast } from '@/components/ui/use-toast';
  import CommunityCard from '@/components/communities/CommunityCard';

  const healthEntitiesData = [ // Renomeado communitiesData para healthEntitiesData
    { 
      id: 1, 
      name: 'Clínica Geral e Familiar', 
      description: 'Especialistas em medicina familiar e preventiva.', 
      imageDescription: 'A family doctor consulting a patient',
      path: '/communities/general'
    },
    { 
      id: 2, 
      name: 'Cardiologia Avançada', 
      description: 'Consultas e exames cardiológicos com tecnologia de ponta.', 
      imageDescription: 'Heart monitor on a dark background',
      path: '/communities/cardiology'
    },
    { 
      id: 3, 
      name: 'Pediatria Cadence', 
      description: 'Cuidados de saúde dedicados aos mais jovens.', 
      imageDescription: 'Happy child with doctor',
      path: '/communities/pediatrics'
    },
    { 
      id: 4, 
      name: 'Saúde Mental Online', 
      description: 'Apoio psicológico e psiquiátrico acessível.', 
      imageDescription: 'Abstract image representing mental wellness',
      path: '/communities/mental-health'
    },
    { 
      id: 5, 
      name: 'Dermatologia Estética', 
      description: 'Diagnóstico e tratamento de condições de pele.', 
      imageDescription: 'Dermatologist examining skin',
      path: '/communities/dermatology'
    },
    { 
      id: 6, 
      name: 'Nutrição e Bem-Estar', 
      description: 'Aconselhamento personalizado para uma vida saudável.', 
      imageDescription: 'Healthy food assortment',
      path: '/communities/nutrition'
    },
  ];

  const Communities = () => {
    const { toast } = useToast();

    const handleExploreSpecialties = () => { // Renomeado handleCreateCommunity
      toast({
        title: "🚧 A exploração de novas especialidades está em construção....",
        duration: 3000,
      });
    };

    return (
      <>
        <Helmet>
          <title>Clínicas e Especialidades - Cadence</title> {/* Novo título */}
          <meta name="description" content="Encontre clínicas, departamentos e especialidades médicas na plataforma Cadence." /> {/* Nova descrição */}
        </Helmet>
        <div className="flex min-h-screen">
          <Navbar />
          <div className="flex-1 ml-64 flex flex-col"> {/* Adicionado flex flex-col */}
            <Header />
            <main className="pt-16 p-8 flex-1"> {/* Adicionado flex-1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-7xl mx-auto"
              >
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-3xl font-bold"
                    style={{ color: 'var(--text-light-primary)' }}
                  >
                    Clínicas e Especialidades
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="flex items-center gap-4"
                  >
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-light-secondary)' }} />
                      <Input placeholder="Procurar clínicas ou especialidades..." className="pl-10" /> {/* Placeholder ajustado */}
                    </div>
                    <Button onClick={handleExploreSpecialties} className="btn-primary flex items-center gap-2"> {/* Botão ajustado */}
                      <Stethoscope size={18} /> {/* Ícone de estetoscópio */}
                      Explorar Especialidades
                    </Button>
                  </motion.div>
                </div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  {healthEntitiesData.map((entity) => (
                    <CommunityCard key={entity.id} community={entity} />
                  ))}
                </motion.div>
              </motion.div>
            </main>
          </div>
        </div>
      </>
    );
  };

  export default Communities;