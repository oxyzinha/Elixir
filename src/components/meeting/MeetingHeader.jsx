// src/components/meeting/MeetingHeader.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const MeetingHeader = ({ meetingName, onLeave }) => {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex items-center justify-end px-6 py-3 z-20"
      style={{
        backgroundColor: 'var(--bg-dark-secondary)',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold truncate" style={{ color: 'var(--text-light-primary)' }}>
        {meetingName}
      </h1>
      <Button
        onClick={onLeave}
        className="bg-red-600 hover:bg-red-700 text-white"
        size="sm"
      >
        Sair da Consulta
      </Button>
    </motion.header>
  );
};

export default MeetingHeader;