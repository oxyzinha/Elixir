// src/services/communities.js

// Importa a função apiFetch (mantemos a consistência, mesmo que seja para mockar)
// import { apiFetch } from './api'; // Descomente esta linha se tiver um ficheiro api.js com apiFetch

// Dados mock para simular comunidades (para exploração)
const MOCK_ALL_COMMUNITIES = [
  {
    id: '1',
    name: 'Clínica Geral e Familiar',
    description: 'Especialistas em medicina familiar e preventiva.',
    longDescription: 'A nossa Clínica Geral e Familiar dedica-se a fornecer cuidados de saúde abrangentes e personalizados para todas as idades. Focamos na prevenção, diagnóstico precoce e tratamento de diversas condições, promovendo o bem-estar de toda a família.',
    image: 'https://images.unsplash.com/photo-1584515933617-649060b0e784?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'clinic',
    membersCount: 120,
    isJoined: false,
    specialties: ['Medicina Familiar', 'Pediatria', 'Vacinação', 'Check-ups anuais'],
    openingHours: ['Seg-Sex: 09:00 - 18:00', 'Sáb: 09:00 - 13:00'],
    contactEmail: 'geral@clinicageral.com',
    contactPhone: '+351 210 000 001',
  },
  {
    id: '2',
    name: 'Cardiologia Avançada',
    description: 'Consultas e exames cardiológicos com tecnologia de ponta.',
    longDescription: 'A equipa de Cardiologia Avançada oferece o que há de mais moderno em diagnóstico e tratamento de doenças cardiovasculares. Dispomos de tecnologia de ponta para exames como ecocardiogramas, testes de esforço e holter, garantindo a melhor saúde para o seu coração.',
    image: 'https://images.unsplash.com/photo-1579154202358-1a5c3639433c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'clinic',
    membersCount: 85,
    isJoined: false,
    specialties: ['Cardiologia Clínica', 'Ecocardiografia', 'Hipertensão', 'Arritmias'],
    openingHours: ['Seg-Qui: 08:30 - 17:30'],
    contactEmail: 'cardio@clinicageral.com',
    contactPhone: '+351 210 000 002',
  },
  {
    id: '3',
    name: 'Pediatria Cadence',
    description: 'Cuidados de saúde dedicados aos mais jovens.',
    longDescription: 'A Pediatria Cadence é um espaço acolhedor e seguro para os seus filhos. A nossa equipa de pediatras experientes oferece desde consultas de rotina e vacinação até o acompanhamento de doenças infantis, sempre com foco no desenvolvimento saudável e no bem-estar das crianças.',
    image: 'https://images.unsplash.com/photo-1542884705-eb8b7c7b45dd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'clinic',
    membersCount: 200,
    isJoined: false,
    specialties: ['Pediatria Geral', 'Desenvolvimento Infantil', 'Alergologia Pediátrica'],
    openingHours: ['Seg-Sex: 09:00 - 19:00'],
    contactEmail: 'pediatria@clinicageral.com',
    contactPhone: '+351 210 000 003',
  },
  {
    id: '4',
    name: 'Saúde Mental Online',
    description: 'Apoio psicológico e psiquiátrico acessível.',
    longDescription: 'Esta comunidade oferece um espaço seguro e anónimo para partilhar experiências e encontrar apoio em questões de saúde mental. Com a moderação de profissionais, promovemos discussões construtivas e o acesso a recursos valiosos para o bem-estar psicológico.',
    image: 'https://images.unsplash.com/photo-1534349735948-dad724948d39?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'support',
    membersCount: 350,
    isJoined: true, // Já pertence a esta
    topics: ['Ansiedade', 'Depressão', 'Stress', 'Coping', 'Mindfulness', 'Autocuidado'],
    rules: 'Mantenha o respeito. Sem julgamentos ou conselhos médicos não solicitados. Apenas partilha de experiências e apoio mútuo.',
  },
  {
    id: '5',
    name: 'Dermatologia Estética',
    description: 'Diagnóstico e tratamento de condições de pele.',
    longDescription: 'A nossa clínica de Dermatologia Estética combina o rigor médico com as últimas inovações em tratamentos de beleza da pele. Oferecemos soluções para acne, manchas, rugas e outras condições dermatológicas, sempre com o objetivo de restaurar a saúde e a confiança na sua pele.',
    image: 'https://images.unsplash.com/photo-1596496350711-b0e6e7d6b8f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'clinic',
    membersCount: 60,
    isJoined: false,
    specialties: ['Acne', 'Manchas', 'Preenchimentos', 'Botox', 'Psoríase', 'Eczema'],
    openingHours: ['Ter-Sáb: 10:00 - 18:00'],
    contactEmail: 'derma@clinicageral.com',
    contactPhone: '+351 210 000 004',
  },
  {
    id: '6',
    name: 'Nutrição e Bem-Estar',
    description: 'Aconselhamento personalizado para uma vida saudável.',
    longDescription: 'Neste grupo, partilhamos dicas, receitas e experiências sobre nutrição e bem-estar. Desde dietas específicas a estilos de vida saudáveis, encontre apoio para os seus objetivos nutricionais e promova um estilo de vida mais equilibrado.',
    image: 'https://images.unsplash.com/photo-1540420773-ee692e76bb99?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'support',
    membersCount: 150,
    isJoined: false,
    topics: ['Dietas saudáveis', 'Alimentação consciente', 'Receitas', 'Perda de peso', 'Hidratação'],
    rules: 'Partilhe informações baseadas em ciência e seja respeitoso com as escolhas alimentares de cada um.',
  },
  // Novas comunidades para exploração
  {
    id: '7',
    name: 'Suporte para Diabetes Tipo 2',
    description: 'Grupo de apoio para quem vive com diabetes tipo 2 e seus familiares.',
    longDescription: 'Uma comunidade dedicada a fornecer apoio, partilhar informações e experiências para pessoas que vivem com diabetes tipo 2 e seus familiares. Discutimos gestão de glicemia, alimentação, exercício e como viver uma vida plena com a condição.',
    image: 'https://images.unsplash.com/photo-1620021665427-bc5b9a8f4c6a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'support',
    membersCount: 80,
    isJoined: false,
    topics: ['Controlo glicémico', 'Dieta para diabetes', 'Exercício físico', 'Medicação', 'Prevenção de complicações'],
    rules: 'Foco em partilhas de experiência. Não substitui o aconselhamento médico profissional.',
  },
  {
    id: '8',
    name: 'Exercício e Reabilitação',
    description: 'Dicas e partilhas sobre exercícios e fisioterapia para diversas condições.',
    longDescription: 'Para quem procura recuperar de lesões, manter a mobilidade ou simplesmente encontrar a melhor forma de se exercitar, esta comunidade é o seu lugar. Partilhamos rotinas, conselhos de fisioterapeutas e motivação para uma reabilitação eficaz e um estilo de vida ativo.',
    image: 'https://images.unsplash.com/photo-1517838562723-5e9c0c1b4b2c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'support',
    membersCount: 110,
    isJoined: false,
    topics: ['Fisioterapia', 'Exercícios em casa', 'Recuperação de lesões', 'Mobilidade', 'Força'],
    rules: 'Consulte sempre um profissional de saúde antes de iniciar qualquer programa de exercícios, especialmente após uma lesão.',
  },
  {
    id: '9',
    name: 'Bem-Estar na Gravidez',
    description: 'Comunidade para futuras mães e pais, partilhando experiências e conselhos.',
    longDescription: 'Um espaço carinhoso e informativo para futuras mães e pais navegarem pela jornada da gravidez e maternidade/paternidade. Discutimos tudo, desde a saúde pré-natal, preparação para o parto, até os primeiros meses com o bebé.',
    image: 'https://images.unsplash.com/photo-1574005086053-48777176166a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'support',
    membersCount: 230,
    isJoined: false,
    topics: ['Gravidez', 'Parto', 'Pós-parto', 'Amamentação', 'Cuidados com o bebé', 'Saúde materna'],
    rules: 'Compartilhe com amor e respeito. As informações aqui não substituem o aconselhamento de um médico ou enfermeiro.',
  },
  {
    id: '10',
    name: 'Saúde Pediátrica Tópicos',
    description: 'Discussões sobre saúde e desenvolvimento infantil para pais e cuidadores.',
    longDescription: 'Esta comunidade é um ponto de encontro para pais e cuidadores trocarem conhecimentos e experiências sobre a saúde e o desenvolvimento dos seus filhos. Abordamos temas desde doenças comuns da infância até questões de nutrição e educação.',
    image: 'https://images.unsplash.com/photo-1543881260-bd44ee77053e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'support',
    membersCount: 175,
    isJoined: false,
    topics: ['Doenças infantis', 'Vacinação', 'Desenvolvimento motor', 'Alimentação infantil', 'Sono do bebé'],
    rules: 'As informações partilhadas são para fins de discussão e apoio. Procure sempre orientação profissional para a saúde dos seus filhos.',
  }
];

// SIMULAÇÃO: Quais comunidades o "utilizador atual" já se juntou.
let MOCK_USER_JOINED_COMMUNITY_IDS = ['1', '4']; // Alterado para string para consistência

// --- Funções de Serviço para Comunidades ---

/**
 * Simula a obtenção de todas as comunidades disponíveis.
 * Marca as comunidades às quais o utilizador já se juntou.
 * @returns {Promise<Array>} Lista de comunidades.
 */
export async function fetchAllCommunities() {
  console.log('API Call: Fetching all communities...');
  await new Promise(resolve => setTimeout(resolve, 500));

  const communitiesWithJoinedStatus = MOCK_ALL_COMMUNITIES.map(community => ({
    ...community,
    isJoined: MOCK_USER_JOINED_COMMUNITY_IDS.includes(community.id),
  }));

  return communitiesWithJoinedStatus;
}

/**
 * Simula a obtenção das comunidades às quais o utilizador atual se juntou.
 * @returns {Promise<Array>} Lista de comunidades do utilizador.
 */
export async function fetchUserJoinedCommunities() {
  console.log('API Call: Fetching user joined communities...');
  await new Promise(resolve => setTimeout(resolve, 300));

  const userCommunities = MOCK_ALL_COMMUNITIES.filter(community =>
    MOCK_USER_JOINED_COMMUNITY_IDS.includes(community.id)
  );

  return userCommunities;
}

/**
 * Simula a obtenção de uma comunidade pelo seu ID.
 * @param {string} communityId O ID da comunidade a ser buscada.
 * @returns {Promise<object|null>} Os dados da comunidade ou null se não for encontrada.
 */
export async function fetchCommunityById(communityId) {
  console.log(`API Call: Fetching community by ID: ${communityId}...`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simula atraso da rede

  const community = MOCK_ALL_COMMUNITIES.find(c => c.id === communityId);
  return community ? { ...community, isJoined: MOCK_USER_JOINED_COMMUNITY_IDS.includes(community.id) } : null;
}


/**
 * Simula a ação de juntar-se a uma comunidade.
 * @param {string} communityId O ID da comunidade a que se juntar.
 * @returns {Promise<boolean>} True se a operação for bem-sucedida.
 */
export async function joinCommunity(communityId) {
  console.log(`API Call: Joining community ${communityId}...`);
  await new Promise(resolve => setTimeout(resolve, 400));

  if (!MOCK_USER_JOINED_COMMUNITY_IDS.includes(communityId)) {
    MOCK_USER_JOINED_COMMUNITY_IDS.push(communityId);
    console.log(`Successfully joined community ${communityId}.`);
    return true;
  }
  console.log(`Already a member of community ${communityId}.`);
  return false;
}

/**
 * Simula a criação de uma nova comunidade.
 * @param {object} communityData Dados da nova comunidade (nome, descrição, imagem, tipo).
 * @returns {Promise<object>} A nova comunidade criada (com um ID simulado).
 */
export async function createCommunity(communityData) {
  console.log('API Call: Creating new community...', communityData);
  await new Promise(resolve => setTimeout(resolve, 700));

  // Gera um novo ID como string para consistência
  const newId = String(MOCK_ALL_COMMUNITIES.length > 0 ? Math.max(...MOCK_ALL_COMMUNITIES.map(c => parseInt(c.id))) + 1 : 1);
  
  const newCommunity = {
    id: newId,
    name: communityData.name,
    description: communityData.description,
    image: communityData.image ? URL.createObjectURL(communityData.image) : 'https://via.placeholder.com/150', // Se a imagem for um File object
    type: communityData.type || 'support',
    membersCount: 1,
    isJoined: true,
  };
  MOCK_ALL_COMMUNITIES.push(newCommunity);
  MOCK_USER_JOINED_COMMUNITY_IDS.push(newId);
  console.log('New community created:', newCommunity);
  return newCommunity;
}