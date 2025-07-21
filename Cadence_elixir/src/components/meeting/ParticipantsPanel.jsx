import React, { useEffect, useState, useRef } from "react";
import { motion } from 'framer-motion';
import { Users, FileText, Code, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { connectToUserChannel, setupPresence } from "../../services/socket";

const ParticipantItem = ({ participant, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: delay * 0.1 + 0.2 }}
    className="flex items-center space-x-3 p-2 rounded-lg transition-colors hover:bg-opacity-10"
    style={{ backgroundColor: 'var(--bg-dark-primary)' }}
  >
    <Avatar className="h-9 w-9">
      <AvatarImage src={participant.avatar || ""} alt={participant.name} />
      <AvatarFallback>
        {participant.name
          ? participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : "?"}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-light-primary)' }}>
        {participant.name || 'Usuário'}
      </p>
      {/* Removed micOn, videoOn, isHost as they are not in the Presence payload */}
    </div>
    <div className="flex items-center space-x-2">
      {/* Removed micOn, videoOn as they are not in the Presence payload */}
    </div>
  </motion.div>
);

const ParticipantsPanel = ({ meetingChannel, meetingId, userId, onPresenceUpdate }) => {
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState('participants');
  const presenceRef = useRef(null);
  const onTabClick = (tabId) => setActiveTab(tabId);

  useEffect(() => {
    if (meetingChannel) {
      if (presenceRef.current) {
        // Remove listeners antigos se o canal mudou
        presenceRef.current = null;
      }
      console.log("[PANEL] Chamando setupPresence para o canal:", meetingChannel.topic, meetingChannel.state);
      presenceRef.current = setupPresence(meetingChannel, (list, state) => {
        console.log("[PRESENCE] syncState state:", state);
        console.log("[PRESENCE] Lista recebida do backend:", list);
        setParticipants(list);
        if (onPresenceUpdate) {
          onPresenceUpdate(list);
        }
      });
    }
    // Cleanup: remove Presence listeners ao desmontar ou trocar de canal
    return () => {
      presenceRef.current = null;
    };
  }, [meetingChannel, onPresenceUpdate]);

  useEffect(() => {
    console.log("[PANEL] Participantes renderizados:", participants);
  }, [participants]);

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
        <div className="flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium relative"
             style={{ color: 'var(--color-primary)' }}>
          <Users size={18} />
          <span>Participantes</span>
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{ backgroundColor: 'var(--color-primary)' }}
            layoutId="underline"
          />
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {participants.map((p, i) => (
          <ParticipantItem key={p.id} participant={p} delay={i} />
        ))}
      </div>
    </motion.aside>
  );
};

export default ParticipantsPanel;