import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, CalendarClock, Code2, Users, ArrowRight, Video, Pill, CalendarCheck, Info, Clock } from 'lucide-react'; 
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom'; // ESTA LINHA É CRÍTICA!

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const iconMap = {
  message: { icon: MessageSquare, iconColorClass: 'text-blue-600', bgColorClass: 'bg-blue-50' },
  file: { icon: FileText, iconColorClass: 'text-green-600', bgColorClass: 'bg-green-50' },
  meeting: { icon: CalendarClock, iconColorClass: 'text-yellow-600', bgColorClass: 'bg-yellow-50' }, 
  'meeting-full': { icon: CalendarClock, iconColorClass: 'text-yellow-600', bgColorClass: 'bg-yellow-50' }, 
  code: { icon: Code2, iconColorClass: 'text-purple-600', bgColorClass: 'bg-purple-50' },
  community: { icon: Users, iconColorClass: 'text-orange-600', bgColorClass: 'bg-orange-50' },
  
  // Novos tipos para as seções da Dashboard/Exemplos
  chat: { icon: MessageSquare, iconColorClass: 'text-indigo-600', bgColorClass: 'bg-indigo-50' },
  teleconsulta: { icon: Video, iconColorClass: 'text-teal-600', bgColorClass: 'bg-teal-50' },
  'proxima-consulta-dash': { icon: CalendarCheck, iconColorClass: 'text-yellow-600', bgColorClass: 'bg-yellow-50' },
  medicacao: { icon: Pill, iconColorClass: 'text-pink-600', bgColorClass: 'bg-pink-50' },
  documentos: { icon: FileText, iconColorClass: 'text-cyan-600', bgColorClass: 'bg-cyan-50' },
};

const MeetingItemStatusStyles = { 
    Ativa: { text: 'text-green-500', bg: 'bg-green-100', border: 'border-green-500' },
    Próxima: { text: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-500' },
    Concluída: { text: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-500' },
    Cancelada: { text: 'text-red-500', bg: 'bg-red-100', border: 'border-red-500' },
};

const ActivityItem = ({ item }) => {
  const { toast } = useToast();
  const navigate = useNavigate(); // ESTA LINHA É CRÍTICA!

  const { icon: Icon, iconColorClass, bgColorClass } = iconMap[item.type] || { 
    icon: MessageSquare, 
    iconColorClass: 'text-gray-500', 
    bgColorClass: 'bg-gray-100'
  };

  const handleLinkClick = (e) => {
    e.preventDefault();

    if (typeof navigate === 'function' && item.link) {
      navigate(item.link);
    } else {
      toast({
        title: "🚧 Não foi possível navegar. Link ausente ou problema na navegação.",
        duration: 3000,
      });
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  let descriptionContent;
  let contextContent;
  let extraInfo = null;

  if (item.type === 'meeting-full' && item.fullMeetingData) {
    const meeting = item.fullMeetingData;
    const statusStyle = MeetingItemStatusStyles[meeting.status] || MeetingItemStatusStyles['Concluída'];
    descriptionContent = meeting.name;
    contextContent = meeting.type; 

    extraInfo = (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-2">
                <CalendarClock size={14} className="text-gray-500" />
                <span>{formatDate(meeting.start_time)}</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-500" />
                <span>{`${formatTime(meeting.start_time)} - ${formatTime(meeting.end_time)}`}</span>
            </div>
            {meeting.participants && meeting.participants.length > 0 && (
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    <div className="flex -space-x-2">
                        {meeting.participants.slice(0, 3).map((p, index) => (
                            <Avatar key={p.id || index} className="h-6 w-6 border-2 border-white">
                                <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">{p.name ? p.name.charAt(0).toUpperCase() : '?'}</AvatarFallback>
                            </Avatar>
                        ))}
                        {meeting.participants.length > 3 && (
                            <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-300 text-gray-800">
                                +{meeting.participants.length - 3}
                            </div>
                        )}
                    </div>
                </div>
            )}
             <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                {meeting.status}
            </span>
        </div>
    );
  } else {
    descriptionContent = item.description;
    contextContent = item.context;
  }

  return (
    <motion.div
      variants={itemVariants}
      className={`
        flex items-start p-5 rounded-xl 
        shadow-md border border-gray-200 
        transition-all duration-300 ease-in-out 
        cursor-pointer
        ${bgColorClass}
        hover:shadow-lg hover:border-purple-300 hover:-translate-y-1
      `}
      onClick={handleLinkClick}
    >
      <div className="flex items-center gap-4 w-full">
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className={`p-2 rounded-full ${bgColorClass} flex items-center justify-center`}>
            <Icon size={20} className={iconColorClass} />
          </div>
          {item.avatarFallback && (
            <Avatar className="h-8 w-8">
              <AvatarFallback>{item.avatarFallback}</AvatarFallback>
            </Avatar>
          )}
        </div>
        
        <div className="flex-1">
          <p className="text-sm text-gray-800">
            <span className="font-bold">{item.user}</span> {descriptionContent} <span className={`font-semibold ${iconColorClass}`}>{contextContent}</span>.
          </p>
          {extraInfo}
          <p className="text-xs mt-1 text-gray-500">
            {item.timestamp}
          </p>
        </div>

        {item.link && (
          <a
            href={item.link}
            onClick={(e) => {
              e.stopPropagation();
              handleLinkClick(e);
            }}
            className={`
              flex items-center gap-1 text-sm font-medium 
              px-3 py-1.5 rounded-full 
              bg-purple-700 text-white 
              hover:bg-purple-800 
              transition-all duration-300 ease-in-out 
              ml-4 flex-shrink-0
            `}
          >
            <span>Ir</span>
            <ArrowRight size={14} />
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityItem;