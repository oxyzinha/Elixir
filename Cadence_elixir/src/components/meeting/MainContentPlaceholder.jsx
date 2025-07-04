import React from 'react';
import { motion } from 'framer-motion';
import { Monitor } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const MainContentPlaceholder = () => {
  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex-1 flex items-center justify-center p-8"
    >
      <Card className="w-full h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
              className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-blue))' }}
            >
              <Monitor size={48} color="white" />
            </motion.div>
            <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-light-primary)' }}>
              Conteúdo Principal Dinâmico
            </h3>
            <p style={{ color: 'var(--text-light-secondary)' }}>
              Editor de Código / Documentos / Vídeo / Partilha de Ecrã
            </p>
            <p className="text-sm" style={{ color: 'var(--text-light-secondary)' }}>
              🚧 Esta área será implementada com funcionalidades avançadas!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.main>
  );
};

export default MainContentPlaceholder;