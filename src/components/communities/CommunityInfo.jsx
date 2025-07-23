// src/components/communities/CommunityInfo.jsx
import React from 'react';

const CommunityInfo = ({ community }) => {
  if (!community) {
    return (
      <div className="p-6 text-center text-gray-500">
        Informações da comunidade não disponíveis.
      </div>
    );
  }

  return (
    <div // Mudado para div normal se framer-motion não for necessário aqui
      className="p-6 overflow-y-auto flex-1" // Permite scroll se o conteúdo for grande
      style={{ color: 'var(--text-light-primary)' }}
    >
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>
        Sobre a Comunidade
      </h2>
      <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-light-secondary)' }}>
        {community.longDescription || community.description || "Nenhuma descrição detalhada disponível para esta comunidade."}
      </p>

      {community.type === 'clinic' && (
        <>
          <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--text-light-primary)' }}>
            Especialidades
          </h3>
          <ul className="list-disc list-inside mb-4 pl-4" style={{ color: 'var(--text-light-secondary)' }}>
            {(community.specialties && community.specialties.length > 0) ? (
              community.specialties.map((spec, index) => <li key={index}>{spec}</li>)
            ) : (
              <li>Não especificado.</li>
            )}
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--text-light-primary)' }}>
            Horário de Atendimento
          </h3>
          <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-light-secondary)' }}>
            {(community.openingHours && community.openingHours.length > 0) ? (
              community.openingHours.map((hour, index) => <span key={index}>{hour}<br/></span>)
            ) : (
              "Não disponível."
            )}
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--text-light-primary)' }}>
            Contactos
          </h3>
          <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-light-secondary)' }}>
            Email: {community.contactEmail || "Não disponível."}<br/>
            Telefone: {community.contactPhone || "Não disponível."}
          </p>
        </>
      )}

      {community.type === 'support' && (
        <>
          <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--text-light-primary)' }}>
            Tópicos Abordados
          </h3>
          <ul className="list-disc list-inside mb-4 pl-4" style={{ color: 'var(--text-light-secondary)' }}>
            {(community.topics && community.topics.length > 0) ? (
              community.topics.map((topic, index) => <li key={index}>{topic}</li>)
            ) : (
              <li>Tópicos gerais de suporte.</li>
            )}
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--text-light-primary)' }}>
            Regras da Comunidade
          </h3>
          <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-light-secondary)' }}>
            {community.rules || "Por favor, mantenha o respeito e a empatia nas interações. Sem spam ou conteúdo ofensivo."}
          </p>
        </>
      )}

      <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--text-light-primary)' }}>
        Membros
      </h3>
      <p className="leading-relaxed" style={{ color: 'var(--text-light-secondary)' }}>
        Esta comunidade tem {community.membersCount || 0} membros.
      </p>
    </div>
  );
};

export default CommunityInfo;