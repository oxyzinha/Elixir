import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Importa Link para tornar o cartão clicável

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Mapeamento de descrições para URLs de imagens placeholder da Unsplash
// Podes adicionar mais mappings ou mudar as URLs para imagens tuas na pasta public/
const getImageSrc = (imageDescription) => {
  switch (imageDescription) {
    case 'A family doctor consulting a patient':
      return 'https://images.unsplash.com/photo-1576091160550-fd422b969630?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    case 'Heart monitor on a dark background':
      return 'https://images.unsplash.com/photo-1582719500732-c6517a65971a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    case 'Happy child with doctor':
      return 'https://images.unsplash.com/photo-1576091160550-fd422b969630?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    case 'Abstract image representing mental wellness':
      return 'https://images.unsplash.com/photo-1557804506-613d9435a229?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    case 'Dermatologist examining skin':
      return 'https://images.unsplash.com/photo-1596495632145-6679dc6e8644?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    case 'Healthy food assortment':
      return 'https://images.unsplash.com/photo-1498837146031-4a5a5700d2b7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    default:
      return 'https://images.unsplash.com/photo-1498050108023-c5249f4cd085?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Imagem padrão
  }
};

const CommunityCard = ({ community }) => {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg" // Removido cursor-pointer daqui
      style={{
        transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
      }}
    >
      <Link to={community.path || '#'} className="block h-full w-full cursor-pointer"> {/* Torna o Link um bloco clicável */}
        <img 
          alt={community.imageDescription || community.name} // Usar imageDescription ou name para o alt
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          src={getImageSrc(community.imageDescription)} // AQUI: Imagem dinâmica
        />
        
        {/* Overlay escuro que aparece no hover */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-all duration-500 ease-in-out"></div>

        {/* TAG TEMPLATE */}
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold py-1 px-3 rounded-full z-10">
          TEMPLATE
        </div>

        {/* Informação da Comunidade (Visível por Padrão) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 group-hover:opacity-0">
          <h3 className="text-white font-bold text-lg truncate">{community.name}</h3>
          <p className="text-sm text-gray-300">{community.description || ''}</p> {/* Usa description */}
        </div>

        {/* Texto "Abrir Comunidade" (Visível no Hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white font-bold text-lg">Abrir Comunidade</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default CommunityCard;