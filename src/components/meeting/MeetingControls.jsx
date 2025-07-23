// src/components/meeting/MeetingControls.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, Phone, Hand, Circle } from 'lucide-react';

const ControlButton = ({ icon: Icon, offIcon: OffIcon, active, onClick, isDanger = false }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`meeting-control w-14 h-14 flex items-center justify-center ${active ? 'active' : ''} ${isDanger ? 'danger' : ''}`}
  >
    {active ? <Icon size={24} /> : (OffIcon ? <OffIcon size={24} /> : <Icon size={24} />)}
  </motion.button>
);

const MeetingControls = ({ controls, onToggle, onLeave }) => {
  const controlButtons = [
    { id: 'mic', icon: Mic, offIcon: MicOff, active: controls.mic },
    { id: 'video', icon: Video, offIcon: VideoOff, active: controls.video },
    { id: 'screen', icon: Monitor, offIcon: MonitorOff, active: controls.screen },
    { id: 'hand', icon: Hand, active: controls.hand },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-dark-secondary)', borderTop: '1px solid var(--border-color)' }}
    >
      <div className="flex items-center space-x-6">
        {controlButtons.map(btn => (
          <ControlButton
            key={btn.id}
            icon={btn.icon}
            offIcon={btn.offIcon}
            active={btn.active}
            onClick={() => onToggle(btn.id)}
          />
        ))}
        <ControlButton
          icon={Phone}
          active={true}
          onClick={onLeave}
          isDanger={true}
        />
      </div>
    </motion.div>
  );
};

export default MeetingControls;