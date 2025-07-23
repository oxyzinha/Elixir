// src/components/communities/CommunityCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'; // Certifique-se de que está importado

const CommunityCard = ({ community, onJoin }) => { // onJoin pode ser mantido se tiver outros botões condicionais
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={cardVariants}
      className="bg-[var(--bg-light-primary)] rounded-xl shadow-md overflow-hidden border cursor-pointer hover:shadow-lg transition-shadow duration-300"
      style={{ borderColor: 'var(--border-color)' }}
    >
      {community.image && (
        <img
          src={community.image}
          alt={community.name}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-light-primary)' }}>
          {community.name}
        </h3>
        <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--text-light-secondary)' }}>
          {community.description}
        </p>
        <div className="flex items-center justify-between text-sm mb-4" style={{ color: 'var(--text-light-secondary)' }}>
          <span>{community.type === 'clinic' ? 'Clínica' : 'Suporte'}</span>
          <span>{community.membersCount} Membros</span>
        </div>
        
        {/* O botão "Ver Chat" que navega para a página de detalhes da comunidade */}
        <Link to={`/communities/${community.id}`}>
          <Button className="w-full btn-primary">
            Ver Chat
          </Button>
        </Link>

        {/* Exemplo de botão condicional para "Juntar-me", se a comunidade não for já junta.
            Descomente e adapte se precisar desta funcionalidade.
        { !community.isJoined && (
          <Button onClick={() => onJoin(community.id)} className="w-full mt-2 btn-secondary">
            Juntar-me
          </Button>
        )}
        */}
      </div>
    </motion.div>
  );
};

export default CommunityCard;