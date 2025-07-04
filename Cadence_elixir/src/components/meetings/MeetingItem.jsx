import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Video, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom'; // Importação do useNavigate

const cardVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const statusStyles = {
  Ativa: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/50',
  },
  Próxima: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/50',
  },
  Concluída: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    border: 'border-gray-500/50',
  },
  Cancelada: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/50',
  },
};

const MeetingItem = ({ meeting }) => {
  const { toast } = useToast();
  const navigate = useNavigate(); // Inicialização do useNavigate

  // Função para formatar a data (dia, mês, ano)
  const formatDate = (dateString) => {
    // Verifica se dateString é válido antes de tentar criar um Date object
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('pt-PT', options);
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return 'Data Inválida';
    }
  };

  // Função para formatar a hora
  const formatTime = (dateString) => {
    // Verifica se dateString é válido
    if (!dateString) return 'N/A';
    try {
      const options = { hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleTimeString('pt-PT', options);
    } catch (e) {
      console.error("Erro ao formatar hora:", e);
      return 'Hora Inválida';
    }
  };

  const style = statusStyles[meeting.status] || statusStyles['Concluída'];

  const handleActionClick = () => {
    if (meeting.status === 'Ativa' || meeting.status === 'Próxima') {
      if (meeting.id) {
        navigate(`/meeting/${meeting.id}`); // Navega para a sala de reunião
      } else {
        toast({
          title: "Erro de navegação",
          description: "ID da reunião não encontrado para entrar.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } else {
      // Para reuniões Concluídas ou Canceladas, você pode querer ver detalhes
      if (meeting.id) {
        // ATENÇÃO: Esta rota /meetings/:id/details PODE NÃO EXISTIR no seu App.tsx.
        // Se não existir, a navegação falhará ou pode levar a uma página em branco.
        // Ajuste esta rota conforme o que você deseja para ver detalhes.
        navigate(`/meetings/${meeting.id}/details`); 
      } else {
        toast({
          title: "Erro de navegação",
          description: "ID da reunião não encontrado para ver detalhes.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };


  return (
    <motion.div
      variants={cardVariants}
      className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-xl gap-6 transition-all duration-300 hover:shadow-lg cursor-pointer" // Adicionei cursor-pointer
      onClick={handleActionClick} // Torna todo o card clicável
      style={{
        backgroundColor: 'var(--bg-dark-secondary)',
        border: '1px solid var(--border-color)',
        borderLeft: `4px solid ${style.border.replace('border-', 'var(--color-')}`
      }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-3">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-light-primary)' }}>
            {meeting.name}
          </h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>
            {meeting.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ color: 'var(--text-light-secondary)' }}>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>{formatDate(meeting.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{`${formatTime(meeting.date)} - ${formatTime(meeting.endDate)}`}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Users size={16} style={{ color: 'var(--text-light-secondary)' }} />
          <div className="flex -space-x-2">
            {/* Verifica se meeting.participants existe e é um array antes de mapear */}
            {meeting.participants && Array.isArray(meeting.participants) && meeting.participants.slice(0, 4).map((p, index) => (
              <Avatar key={index} className="h-8 w-8 border-2" style={{ borderColor: 'var(--bg-dark-secondary)' }}>
                <AvatarFallback>{p.name ? p.name.charAt(0).toUpperCase() : '?'}</AvatarFallback>
              </Avatar>
            ))}
            {meeting.participants && meeting.participants.length > 4 && (
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-light-primary)' }}>
                +{meeting.participants.length - 4}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full md:w-auto">
        {meeting.status === 'Ativa' || meeting.status === 'Próxima' ? (
          <Button
            onClick={(e) => { e.stopPropagation(); handleActionClick(); }} // Previne clique no card ao clicar no botão
            className="w-full md:w-auto btn-primary flex items-center gap-2"
          >
            <Video size={16} />
            Entrar
          </Button>
        ) : (
          <Button
            onClick={(e) => { e.stopPropagation(); handleActionClick(); }} // Previne clique no card ao clicar no botão
            variant="secondary" className="w-full md:w-auto btn-secondary flex items-center gap-2"
          >
            <Info size={16} />
            Ver Detalhes
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default MeetingItem;