// src/components/ui/dialog.jsx
import React from 'react';

// Um Dialog básico para o nosso caso
export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={() => onOpenChange(false)} // Fecha o modal ao clicar fora
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro feche o modal
      >
        {children}
      </div>
    </div>
  );
};

// Sub-componentes para estruturar o conteúdo do Dialog
export const DialogContent = ({ children }) => {
  return <div>{children}</div>;
};

export const DialogHeader = ({ children }) => {
  return <div className="mb-4">{children}</div>;
};

export const DialogTitle = ({ children }) => {
  return <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-light-primary)' }}>{children}</h3>;
};

export const DialogDescription = ({ children }) => {
  return <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{children}</p>;
};

export const DialogFooter = ({ children }) => {
  return <div className="flex justify-end gap-2 mt-6">{children}</div>;
};