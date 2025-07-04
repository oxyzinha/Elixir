import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import MeetingHeader from '@/components/meeting/MeetingHeader';
import ParticipantsPanel from '@/components/meeting/ParticipantsPanel';
import ChatPanel from '@/components/meeting/ChatPanel';
import MeetingControls from '@/components/meeting/MeetingControls';

// IMPORTANTE: Importe o setupPhoenixSocket que você acabou de criar
// AJUSTE O CAMINHO AQUI: use caminho relativo ou verifique seu alias Vite
import setupPhoenixSocket from '../services/socket'; // OU import setupPhoenixSocket from '@/services/socket'; se seu Vite alias estiver configurado

const MeetingRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [controls, setControls] = useState({
    mic: true,
    video: true,
    screen: false,
    hand: false,
    record: false,
  });
  const [activeTab, setActiveTab] = useState('participants');

  const meetingName = "Reunião: Lançamento do Projeto Cadence";

  // WebRTC States and Refs
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({}); // Para múltiplos vídeos remotos
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // Armazena as conexões RTCPeerConnection
  const socketRef = useRef(null); // Referência para o Phoenix Socket (não WebSocket nativo)
  const meetingChannelRef = useRef(null); // Referência para o Phoenix Channel

  const [remoteParticipants, setRemoteParticipants] = useState([]); // Lista de participantes remotos
  // Mock para o ID do usuário local e o token - SUBSTITUA POR VALORES REAIS DA AUTENTICAÇÃO!
  const [localUserId, setLocalUserId] = useState("user_abc");
  const [authToken, setAuthToken] = useState("SEU_TOKEN_AQUI");

  // Função para obter acesso à câmera e microfone
  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: controls.video, audio: controls.mic });
      localVideoRef.current.srcObject = stream;
      localStreamRef.current = stream;

      // Adicionar stream local a todas as peer connections existentes
      Object.values(peerConnectionsRef.current).forEach(pc => {
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      });

    } catch (err) {
      console.error("Erro ao acessar dispositivos de mídia:", err);
      toast({
        title: "Erro: Não foi possível aceder à sua câmara/microfone.",
        description: "Verifique as permissões do navegador.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Função para configurar a conexão WebSocket (Sinalização) usando Phoenix.js
  const setupPhoenixChannels = () => {
    // Inicia o Phoenix Socket globalmente (se já não estiver iniciado)
    const socket = socketRef.current || setupPhoenixSocket(localUserId, authToken);
    socketRef.current = socket; // Garante que a referência é mantida

    // Entrar no canal da reunião
    const channel = socket.channel(`meeting:${id}`, {}); // O segundo argumento são os params para o join/3 no Elixir
    meetingChannelRef.current = channel; // Armazena a referência do canal

    channel.join()
      .receive("ok", resp => {
        console.log("Conectado ao canal da reunião com sucesso!", resp);
        // Aqui você pode fazer coisas como buscar a lista de participantes já na sala
        // e talvez enviar um "user_joined" para outros, se seu backend não fizer isso automaticamente no join.
      })
      .receive("error", resp => {
        console.error("Não foi possível conectar ao canal da reunião:", resp);
        toast({
          title: "Erro ao entrar na reunião.",
          description: "Não foi possível conectar-se à sala de reunião.",
          variant: "destructive",
          duration: 5000,
        });
      });

    // Lidar com mensagens recebidas do canal
    channel.on("signal", payload => {
      console.log('Mensagem de sinalização recebida:', payload);
      handleSignalingMessage(payload);
    });

    channel.on("user_joined", payload => {
      // Verifica se o usuário que entrou não é você mesmo
      if (payload.user_id && payload.user_id !== localUserId) {
        console.log(`Usuário ${payload.user_id} entrou.`);
        // Cria uma nova peer connection e faz uma oferta para o novo usuário
        createPeerConnection(payload.user_id, true);
      }
    });

    channel.on("user_left", payload => {
      if (payload.user_id && payload.user_id !== localUserId) {
        console.log(`Usuário ${payload.user_id} saiu.`);
        removePeerConnection(payload.user_id);
      }
    });

    channel.on("hand_toggled", payload => {
        console.log(`Mão de ${payload.user_id} ${payload.hand_raised ? 'levantada' : 'baixada'}`);
        // Atualize o estado da UI para refletir isso (por exemplo, na lista de participantes)
        toast({
            title: `Participante ${payload.user_id} ${payload.hand_raised ? 'levantou' : 'baixou'} a mão.`,
            duration: 2000
        });
    });

    channel.on("new_msg", payload => {
        console.log(`Nova mensagem de ${payload.sender_name}: ${payload.body}`);
        // Adicione a mensagem ao seu estado de chat para exibição
        toast({
            title: `Nova mensagem de chat de ${payload.sender_name}`,
            description: payload.body,
            duration: 3000
        });
    });

    // Lidar com a saída do canal (quando o usuário sai da reunião)
    channel.onClose(() => {
      console.log("Canal da reunião fechado.");
      // Lógica de limpeza ou notificação de saída
    });
  };

  // Função para criar uma nova RTCPeerConnection
  const createPeerConnection = async (remoteUserId, isCaller) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Servidor STUN público
        // Adicione seus próprios servidores TURN se necessário para atravessar NAT/Firewalls mais complexos
      ],
    });

    peerConnectionsRef.current = {
      ...peerConnectionsRef.current,
      [remoteUserId]: pc,
    };

    // Adicionar stream local à peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }

    // Lidar com a chegada de streams remotos
    pc.ontrack = (event) => {
      console.log('Recebendo stream remoto:', event.streams[0]);
      setRemoteParticipants(prev => {
        if (!prev.some(p => p.id === remoteUserId)) {
          return [...prev, { id: remoteUserId, stream: event.streams[0], name: `Usuário ${remoteUserId}` }];
        }
        return prev.map(p => p.id === remoteUserId ? { ...p, stream: event.streams[0] } : p);
      });
      // Atribuir o stream a um elemento de vídeo
      if (remoteVideoRefs.current[remoteUserId]) {
        remoteVideoRefs.current[remoteUserId].srcObject = event.streams[0];
      }
    };

    // Lidar com candidatos ICE
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Enviando ICE candidate:', event.candidate);
        // Enviar o candidato ICE via Phoenix Channel para o peer remoto
        meetingChannelRef.current.push("signal", {
          type: "candidate",
          candidate: event.candidate,
          target_user_id: remoteUserId,
          sender_id: localUserId // Adicione o ID do remetente para que o backend saiba quem está enviando
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${remoteUserId}: ${pc.iceConnectionState}`);
    };

    pc.onconnectionstatechange = () => {
      console.log(`Peer connection state for ${remoteUserId}: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log(`Peer ${remoteUserId} disconnected or failed.`);
        removePeerConnection(remoteUserId);
      }
    };


    // Se somos o chamador, criar uma oferta SDP
    if (isCaller) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('Enviando oferta SDP:', offer);
      // Enviar a oferta via Phoenix Channel para o peer remoto
      meetingChannelRef.current.push("signal", {
        type: "offer",
        offer: offer,
        target_user_id: remoteUserId,
        sender_id: localUserId // Adicione o ID do remetente
      });
    }
  };

  // Lidar com mensagens de sinalização recebidas
  const handleSignalingMessage = async (data) => {
    // const userId = "user_abc"; // Seu próprio ID de usuário - já definido em localUserId
    const remoteUserId = data.sender_id; // ID do usuário que enviou a mensagem (pegue do payload)

    let pc = peerConnectionsRef.current[remoteUserId];

    if (data.type === 'offer') {
      if (!pc) {
        // Se ainda não temos uma conexão para este usuário, crie uma e defina a oferta
        pc = await createPeerConnection(remoteUserId, false); // Não somos o chamador
      }
      console.log('Recebendo oferta SDP:', data.offer);
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('Enviando resposta SDP:', answer);
      // Enviar a resposta via Phoenix Channel de volta para o chamador
      meetingChannelRef.current.push("signal", {
        type: "answer",
        answer: answer,
        target_user_id: remoteUserId,
        sender_id: localUserId // Adicione o ID do remetente
      });
    } else if (data.type === 'answer') {
      if (pc) {
        console.log('Recebendo resposta SDP:', data.answer);
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    } else if (data.type === 'candidate') {
      if (pc) {
        console.log('Recebendo ICE candidate:', data.candidate);
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error('Error adding received ICE candidate', e);
        }
      }
    }
  };

  // Função para remover uma conexão de peer
  const removePeerConnection = (remoteUserId) => {
    if (peerConnectionsRef.current[remoteUserId]) {
      peerConnectionsRef.current[remoteUserId].close();
      delete peerConnectionsRef.current[remoteUserId];
    }
    setRemoteParticipants(prev => prev.filter(p => p.id !== remoteUserId));
  };


  useEffect(() => {
    getMedia(); // Tentar obter mídia ao montar o componente
    setupPhoenixChannels(); // Configurar Phoenix Socket e Channels

    // Cleanup function
    return () => {
      // Parar todas as trilhas de mídia locais
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      // Fechar todas as conexões RTCPeerConnection
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      peerConnectionsRef.current = {}; // Limpar objeto
      // Fechar o canal e o socket Phoenix
      if (meetingChannelRef.current) {
        meetingChannelRef.current.leave(); // Sair do canal
      }
      if (socketRef.current) {
        socketRef.current.disconnect(); // Desconectar o socket
      }
    };
  }, [id, localUserId, authToken]); // Dependência no ID da reunião, ID do usuário e token para reconfigurar ao mudar

  useEffect(() => {
    // Quando os controles mudam, atualizar o estado das trilhas de mídia
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = controls.mic;
      }
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = controls.video;
      }
    }
  }, [controls.mic, controls.video]);

  const handleControlToggle = (control) => {
    setControls(prev => ({ ...prev, [control]: !prev[control] }));

    const status = !controls[control] ? 'ativado' : 'desativado';
    let controlName = '';
    switch (control) {
      case 'mic':
        controlName = 'Microfone';
        if (localStreamRef.current) {
          const audioTrack = localStreamRef.current.getAudioTracks()[0];
          if (audioTrack) audioTrack.enabled = !controls.mic;
        }
        break;
      case 'video':
        controlName = 'Câmara';
        if (localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          if (videoTrack) videoTrack.enabled = !controls.video;
        }
        break;
      case 'screen':
        controlName = 'Partilha de ecrã';
        // Implementar lógica de partilha de ecrã (getDisplayMedia)
        if (!controls.screen) {
          navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            .then(screenStream => {
              const videoTrack = screenStream.getVideoTracks()[0];
              localStreamRef.current.getVideoTracks().forEach(track => {
                track.stop();
                localStreamRef.current.removeTrack(track);
              });
              localStreamRef.current.addTrack(videoTrack);
              localVideoRef.current.srcObject = localStreamRef.current;

              Object.values(peerConnectionsRef.current).forEach(pc => {
                  const senders = pc.getSenders().filter(sender => sender.track && sender.track.kind === 'video');
                  if (senders.length > 0) {
                      senders[0].replaceTrack(videoTrack);
                  } else {
                      pc.addTrack(videoTrack, localStreamRef.current);
                  }
                  // Recriar oferta/resposta para sinalizar a mudança
                  pc.createOffer().then(offer => pc.setLocalDescription(offer))
                    .then(() => {
                        // Enviar oferta para todos os peers relevantes (precisa de uma lógica mais robusta para multi-peer)
                        // Por simplicidade, este exemplo apenas envia para o primeiro da lista
                        if (remoteParticipants.length > 0) {
                            meetingChannelRef.current.push("signal", {
                                type: "offer",
                                offer: pc.localDescription,
                                target_user_id: remoteParticipants[0]?.id, // ATENÇÃO: isso enviará apenas para o primeiro da lista
                                sender_id: localUserId
                            });
                        }
                    });
                });

              screenStream.getVideoTracks()[0].onended = () => {
                setControls(prev => ({ ...prev, screen: false }));
                getMedia(); // Reativar câmera após parar a partilha de tela
                toast({ title: "Partilha de ecrã parada", duration: 2000 });
              };
            })
            .catch(err => {
              console.error("Erro ao partilhar ecrã:", err);
              toast({ title: "Erro ao partilhar ecrã", variant: "destructive", duration: 3000 });
              setControls(prev => ({ ...prev, screen: false }));
            });
        } else {
          getMedia();
        }
        break;
      case 'hand':
        controlName = `Mão ${!controls.hand ? 'levantada' : 'baixada'}`;
        // Enviar via push do canal Phoenix
        if (meetingChannelRef.current) {
            meetingChannelRef.current.push("hand_toggle", { user_id: localUserId, hand_raised: !controls.hand });
        }
        break;
      case 'record':
        controlName = `Gravação ${!controls.record ? 'iniciada' : 'parada'}`;
        toast({
          title: "Funcionalidade de gravação em desenvolvimento...",
          duration: 3000,
        });
        break;
      default: break;
    }
    if (control === 'hand' || control === 'record') {
      toast({ title: controlName, duration: 2000 });
    } else {
      toast({ title: `${controlName} ${status}`, duration: 2000 });
    }
  };

  const handleLeaveMeeting = () => {
    toast({ title: "A sair da reunião...", duration: 2000 });
    // Fechar todas as conexões WebRTC e WebSocket antes de sair
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};
    if (meetingChannelRef.current) {
      meetingChannelRef.current.leave();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab !== 'participants') {
      toast({
        title: "🚧 Esta funcionalidade ainda não foi implementada....",
        duration: 3000,
      });
    }
  };

  // Função para enviar mensagens de chat (será passada para ChatPanel)
  const handleSendMessage = (messageBody) => {
    if (meetingChannelRef.current) {
      meetingChannelRef.current.push("msg", { body: messageBody, sender_id: localUserId, sender_name: `User ${localUserId}` })
        .receive("ok", () => console.log("Mensagem enviada com sucesso!"))
        .receive("error", (resp) => console.error("Erro ao enviar mensagem:", resp));
    } else {
        console.warn("Canal de reunião não está conectado para enviar mensagem.");
    }
  };


  return (
    <>
      <Helmet>
        <title>{meetingName} - Cadence</title>
        <meta name="description" content="Sala de reunião virtual da plataforma Cadence para colaboração em tempo real." />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <MeetingHeader meetingName={meetingName} onLeave={handleLeaveMeeting} />
        <div className="flex-1 flex overflow-hidden">
          <ParticipantsPanel activeTab={activeTab} onTabClick={handleTabClick} />
          {/* Main Content Area - Onde os vídeos aparecerão */}
          <div className="flex-1 p-4 bg-gray-100 flex flex-wrap justify-center items-center gap-4 relative">
            {/* Seu vídeo local */}
            <div className="w-64 h-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden relative">
              <video
                ref={localVideoRef}
                autoPlay
                muted // Mute your own video
                className="w-full h-full object-cover transform scaleX(-1)" // Espelhar vídeo local
              />
              <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                Você
              </div>
            </div>

            {/* Vídeos dos participantes remotos */}
            {remoteParticipants.map(participant => (
              <div key={participant.id} className="w-64 h-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden relative">
                <video
                  ref={el => (remoteVideoRefs.current[participant.id] = el)}
                  autoPlay
                  className="w-full h-full object-cover" // Não espelhar vídeo remoto
                />
                <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  {participant.name}
                </div>
              </div>
            ))}

            {remoteParticipants.length === 0 && !localStreamRef.current && (
                <div className="text-gray-500 text-lg">
                    Aguardando outros participantes ou acesso à sua câmera/microfone...
                </div>
            )}
          </div>
          {/* Passe a função handleSendMessage para o ChatPanel se ele tiver um input para enviar mensagens */}
          <ChatPanel onSendMessage={handleSendMessage} />
        </div>
        <MeetingControls controls={controls} onToggle={handleControlToggle} onLeave={handleLeaveMeeting} />
      </div>
    </>
  );
};

export default MeetingRoom;