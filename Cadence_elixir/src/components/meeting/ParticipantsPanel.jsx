import React from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Code, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const participants = [
  { id: 1, name: 'João Silva', avatar: '', initials: 'JS', micOn: true, videoOn: true, isHost: true },
  { id: 2, name: 'Maria Santos', avatar: '', initials: 'MS', micOn: false, videoOn: true, isHost: false },
  { id: 3, name: 'Pedro Costa', avatar: '', initials: 'PC', micOn: true, videoOn: false, isHost: false },
  { id: 4, name: 'Ana Ferreira', avatar: '', initials: 'AF', micOn: true, videoOn: true, isHost: false },
];

const ParticipantItem = ({ participant, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: delay * 0.1 + 0.2 }}
    className="flex items-center space-x-3 p-2 rounded-lg transition-colors hover:bg-opacity-10"
    style={{ backgroundColor: 'var(--bg-dark-primary)' }}
  >
    <Avatar className="h-9 w-9">
      <AvatarImage src={participant.avatar} alt={participant.name} />
      <AvatarFallback>{participant.initials}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-light-primary)' }}>
        {participant.name}
      </p>
      {participant.isHost && (
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
          Host
        </span>
      )}
    </div>
    <div className="flex items-center space-x-2">
      {participant.micOn ? <Mic size={16} style={{ color: 'var(--color-accent-green)' }} /> : <MicOff size={16} style={{ color: 'var(--color-error)' }} />}
      {participant.videoOn ? <Video size={16} style={{ color: 'var(--color-accent-green)' }} /> : <VideoOff size={16} style={{ color: 'var(--color-error)' }} />}
    </div>
  </motion.div>
);

const ParticipantsPanel = ({ activeTab, onTabClick }) => {
  const tabs = [
    { id: 'participants', icon: Users, label: 'Participantes' },
  ];

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-72 flex flex-col"
      style={{
        backgroundColor: 'var(--bg-dark-secondary)',
        borderRight: '1px solid var(--border-color)'
      }}
    >
      <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id ? '' : 'hover:bg-opacity-10'}`}
              style={{ color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--text-light-secondary)' }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  layoutId="underline"
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {activeTab === 'participants' && participants.map((p, i) => (
          <ParticipantItem key={p.id} participant={p} delay={i} />
        ))}
      </div>
    </motion.aside>
  );
};

export default ParticipantsPanel;