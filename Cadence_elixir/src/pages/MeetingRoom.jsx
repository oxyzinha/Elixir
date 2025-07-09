import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import setupPhoenixSocket from '../services/socket';

const MeetingRoom = () => {
  const { id } = useParams(); // ID da reunião
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
  const [chatMessages, setChatMessages] = useState([]); // Novo estado para mensagens de chat

  const meetingName = "Reunião: Lançamento do Projeto Cadence";

  // WebRTC States and Refs
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({}); // Para múltiplos vídeos remotos (key: userId, value: video ref)
  const localStreamRef = useRef(null); // Armazena a MediaStream local
  const peerConnectionsRef = useRef({}); // Armazena as conexões RTCPeerConnection (key: remoteUserId, value: RTCPeerConnection)
  const meetingChannelRef = useRef(null); // Referência para o Phoenix Channel

  // Estado para os participantes remotos, incluindo o stream de vídeo
  const [remoteParticipants, setRemoteParticipants] = useState([]);

  // Mock para o ID do usuário local e o token - SUBSTITUA POR VALORES REAIS DA AUTENTICAÇÃO!
  // Use um ID mais dinâmico ou único para cada teste
  const [localUserId] = useState(`user_${Math.random().toString(36).substring(7)}`);
  const [authToken] = useState("your_actual_auth_token_here"); // Ou deixe vazio se não usar token ainda

  // Função para obter acesso à câmera e microfone (usada por useCallback para evitar recriação desnecessária)
  const getMedia = useCallback(async () => {
    try {
      // Se já temos um stream e os controles não mudaram, não precisamos pedir novamente
      if (localStreamRef.current &&
          localStreamRef.current.getAudioTracks()[0]?.enabled === controls.mic &&
          localStreamRef.current.getVideoTracks()[0]?.enabled === controls.video) {
        return;
      }

      // Parar as faixas existentes antes de obter novas
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: controls.video, audio: controls.mic });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      localStreamRef.current = stream;

      // Adicionar stream local a todas as peer connections existentes
      // Isso deve ser feito APÓS o stream ser obtido e definido
      Object.values(peerConnectionsRef.current).forEach(pc => {
        // Remover faixas antigas (se houver) antes de adicionar as novas
        pc.getSenders().forEach(sender => {
          if (sender.track && (sender.track.kind === 'video' || sender.track.kind === 'audio')) {
            pc.removeTrack(sender);
          }
        });
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      });

    } catch (err) {
      console.error("Erro ao aceder a dispositivos de mídia:", err);
      toast({
        title: "Erro: Não foi possível aceder à sua câmara/microfone.",
        description: "Verifique as permissões do navegador e tente novamente. (Permissão negada)",
        variant: "destructive",
        duration: 5000,
      });
      // Desativar controles se a permissão for negada para evitar loops
      setControls(prev => ({ ...prev, mic: false, video: false }));
    }
  }, [controls.mic, controls.video, toast]); // Dependências: controls.mic e controls.video, e toast

  // Função para criar uma nova RTCPeerConnection (também usará useCallback)
  const createPeerConnection = useCallback(async (remoteUserId, isCaller) => {
    console.log(`[WebRTC] A criar PeerConnection para ${remoteUserId}, isCaller: ${isCaller}`);

    // Se já existe uma PC para este usuário, retorne-a
    if (peerConnectionsRef.current[remoteUserId]) {
      return peerConnectionsRef.current[remoteUserId];
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Servidor STUN público
        // Adicione seus próprios servidores TURN se necessário para atravessar NAT/Firewalls mais complexos
        // { urls: 'turn:your.turn.server:port', username: 'user', credential: 'password' },
      ],
    });

    peerConnectionsRef.current[remoteUserId] = pc; // Armazena a PC na ref

    // Adicionar stream local à peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }

    // Lidar com a chegada de streams remotos
    pc.ontrack = (event) => {
      console.log(`[WebRTC] A receber stream remoto de ${remoteUserId}:`, event.streams[0]);
      setRemoteParticipants(prev => {
        // Encontra ou adiciona o participante
        const existingParticipantIndex = prev.findIndex(p => p.id === remoteUserId);
        if (existingParticipantIndex > -1) {
          // Atualiza o stream do participante existente
          const updatedParticipants = [...prev];
          updatedParticipants[existingParticipantIndex] = { ...updatedParticipants[existingParticipantIndex], stream: event.streams[0] };
          return updatedParticipants;
        } else {
          // Adiciona novo participante
          return [...prev, { id: remoteUserId, stream: event.streams[0], name: `Utilizador ${remoteUserId}` }];
        }
      });
    };

    // Lidar com candidatos ICE
    pc.onicecandidate = (event) => {
      if (event.candidate && meetingChannelRef.current) {
        console.log('[WebRTC] A enviar ICE candidate:', event.candidate);
        meetingChannelRef.current.push("signal", {
          type: "candidate",
          candidate: event.candidate,
          target_user_id: remoteUserId,
          sender_id: localUserId
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] Estado da conexão ICE para ${remoteUserId}: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
        console.log(`[WebRTC] Peer ${remoteUserId} desconectado ou falhou. Fechando PC.`);
        removePeerConnection(remoteUserId);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Estado da conexão Peer para ${remoteUserId}: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        console.log(`[WebRTC] Peer ${remoteUserId} desconectado ou falhou. Fechando PC.`);
        removePeerConnection(remoteUserId);
      }
    };

    // Se somos o chamador, criar uma oferta SDP
    if (isCaller) {
      console.log(`[WebRTC] A criar oferta para ${remoteUserId}`);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log('[WebRTC] A enviar oferta SDP:', offer);
        if (meetingChannelRef.current) {
          meetingChannelRef.current.push("signal", {
            type: "offer",
            offer: offer,
            target_user_id: remoteUserId,
            sender_id: localUserId
          });
        }
      } catch (error) {
        console.error('[WebRTC] Erro ao criar ou enviar oferta:', error);
      }
    }
    return pc;
  }, [localUserId]); // Dependências: localUserId (para sender_id)

  // Lidar com mensagens de sinalização recebidas (usará useCallback)
  const handleSignalingMessage = useCallback(async (data) => {
    const remoteUserId = data.sender_id; // ID do usuário que enviou a mensagem

    // Criar PC se ainda não existir
    let pc = peerConnectionsRef.current[remoteUserId];
    if (!pc) {
      pc = await createPeerConnection(remoteUserId, false); // Não somos o chamador, esperamos uma oferta ou candidato
    }

    try {
      if (data.type === 'offer') {
        console.log('[WebRTC] A receber oferta SDP:', data.offer);
        if (pc.remoteDescription && pc.remoteDescription.type === 'offer') {
          console.warn('[WebRTC] Já existe uma oferta remota, ignorando nova oferta.');
          return;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log('[WebRTC] A enviar resposta SDP:', answer);
        if (meetingChannelRef.current) {
          meetingChannelRef.current.push("signal", {
            type: "answer",
            answer: answer,
            target_user_id: remoteUserId,
            sender_id: localUserId
          });
        }
      } else if (data.type === 'answer') {
        if (pc && pc.signalingState !== 'stable') { // Só aplica a resposta se estiver em um estado de sinalização adequado
          console.log('[WebRTC] A receber resposta SDP:', data.answer);
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else {
          console.warn('[WebRTC] Ignorando resposta: estado de sinalização não é compatível ou PC não existe.', pc);
        }
      } else if (data.type === 'candidate') {
        if (pc) {
          console.log('[WebRTC] A receber ICE candidate:', data.candidate);
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (e) {
            console.error('[WebRTC] Erro ao adicionar ICE candidate recebido', e);
          }
        }
      }
    } catch (error) {
      console.error(`[WebRTC] Erro ao lidar com mensagem de sinalização (${data.type}) de ${remoteUserId}:`, error);
    }
  }, [localUserId, createPeerConnection]); // Dependências: localUserId, createPeerConnection

  // Função para remover uma conexão de peer (usará useCallback)
  const removePeerConnection = useCallback((remoteUserId) => {
    if (peerConnectionsRef.current[remoteUserId]) {
      console.log(`[WebRTC] Fechando PeerConnection para ${remoteUserId}`);
      peerConnectionsRef.current[remoteUserId].close();
      delete peerConnectionsRef.current[remoteUserId];
    }
    setRemoteParticipants(prev => prev.filter(p => p.id !== remoteUserId));
    // Se o elemento de vídeo remoto existe, limpe o srcObject e remova a referência
    if (remoteVideoRefs.current[remoteUserId]) {
      remoteVideoRefs.current[remoteUserId].srcObject = null;
      delete remoteVideoRefs.current[remoteUserId];
    }
  }, []);

  // --- Efeito principal para o Setup do Phoenix Channel e Mídia ---
  useEffect(() => {
    // 1. Inicializa o Phoenix Socket e Channel
    const socket = setupPhoenixSocket(localUserId, authToken);
    const channel = socket.channel(`meeting:${id}`, {});
    meetingChannelRef.current = channel; // Armazena a referência para uso em outras funções

    channel.join()
      .receive("ok", ({ existing_participants }) => {
        console.log("Conectado ao canal da reunião com sucesso!", existing_participants);
        toast({ title: "Conectado à reunião!", duration: 2000 });

        // Envia "user_ready" APENAS UMA VEZ após o join bem-sucedido
        // E só se ainda não tiver sido enviado ou processado
        if (meetingChannelRef.current.state === 'joined') {
            meetingChannelRef.current.push("user_ready", { user_id: localUserId, name: `User ${localUserId}` })
                .receive("ok", ({ existing_participants: participantsFromReady }) => {
                    console.log("Utilizador pronto enviado. Participantes existentes:", participantsFromReady);
                    // Iniciar WebRTC com participantes existentes, se houver
                    participantsFromReady.forEach(p => {
                        if (p.user_id && p.user_id !== localUserId) {
                            createPeerConnection(p.user_id, true); // true: somos o chamador para eles
                        }
                    });
                })
                .receive("error", (err) => console.error("Erro ao enviar user_ready:", err))
                .receive("timeout", () => console.error("Timeout ao enviar user_ready"));
        }

        // 2. Tenta obter mídia (câmera/microfone)
        getMedia();
      })
      .receive("error", resp => {
        console.error("Não foi possível conectar ao canal da reunião:", resp);
        toast({
          title: "Erro ao entrar na reunião.",
          description: "Não foi possível conectar-se à sala de reunião.",
          variant: "destructive",
          duration: 5000,
        });
        navigate('/dashboard'); // Redireciona se não puder conectar
      })
      .receive("timeout", () => {
        console.error("Timeout ao juntar o canal.");
        toast({
          title: "Timeout ao conectar.",
          description: "A conexão com a sala de reunião demorou muito.",
          variant: "destructive",
          duration: 5000,
        });
        navigate('/dashboard'); // Redireciona em caso de timeout
      });

    // 3. Configura listeners para eventos do canal Phoenix
    channel.on("signal", payload => {
      // Assegurar que a mensagem é para nós e não do nosso próprio ID
      if (payload.target_user_id === localUserId && payload.sender_id !== localUserId) {
        handleSignalingMessage(payload);
      } else if (payload.target_user_id !== localUserId) {
        console.warn(`[Phoenix Channel] Sinal ignorado (não é para nós):`, payload);
      } else if (payload.sender_id === localUserId) {
        console.warn(`[Phoenix Channel] Sinal ignorado (enviado por nós mesmos):`, payload);
      }
    });

    channel.on("user_joined", payload => {
      if (payload.user_id && payload.user_id !== localUserId) {
        console.log(`[Phoenix Channel] Utilizador ${payload.user_id} entrou.`);
        toast({
          title: `👋 ${payload.user_id} entrou na sala.`,
          duration: 2000,
        });
        // IMPORTANTE: Não crie a PC aqui, a lógica de "user_ready" já inicia as PCs
        // se o usuário já estiver na sala. Este evento é mais para notificação visual.
      }
    });

    channel.on("user_left", payload => {
      if (payload.user_id && payload.user_id !== localUserId) {
        console.log(`[Phoenix Channel] Utilizador ${payload.user_id} saiu.`);
        removePeerConnection(payload.user_id); // Limpa a PC e o vídeo do usuário que saiu
        toast({
          title: `👋 ${payload.user_id} saiu da sala.`,
          duration: 2000,
        });
      }
    });

    channel.on("hand_toggled", payload => {
      console.log(`[Phoenix Channel] Mão de ${payload.user_id} ${payload.hand_raised ? 'levantada' : 'baixada'}`);
      // Atualize o estado da UI para refletir isso (por exemplo, na lista de participantes)
      toast({
          title: `Participante ${payload.user_id} ${payload.hand_raised ? 'levantou' : 'baixou'} a mão.`,
          duration: 2000
      });
    });

    channel.on("new_msg", payload => {
      console.log(`[Phoenix Channel] Nova mensagem de ${payload.sender_name}: ${payload.body}`);
      // Adicione a mensagem ao seu estado de chat para exibição
      setChatMessages(prevMessages => [...prevMessages, payload]);
      toast({
          title: `Nova mensagem de chat de ${payload.sender_name}`,
          description: payload.body,
          duration: 3000
      });
    });

    // Lidar com o fechamento do canal
    channel.onClose(() => {
      console.log("[Phoenix Channel] Canal da reunião fechado.");
      toast({
          title: "Sua conexão com a reunião foi perdida.",
          description: "Tentando reconectar...",
          variant: "destructive",
          duration: 3000
      });
      // A lógica de reconexão do socket (Phoenix.js) deve lidar com isso.
      // Se a intenção é sair completamente, use `handleLeaveMeeting`.
    });

    // Função de limpeza (cleanup) do useEffect
    return () => {
      console.log("[Cleanup] Realizando limpeza da sala de reunião...");
      // Parar todas as faixas (tracks) de mídia locais
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      // Fechar todas as conexões RTCPeerConnection
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      peerConnectionsRef.current = {}; // Limpar objeto
      setRemoteParticipants([]); // Limpar participantes remotos

      // Sair do canal Phoenix
      if (meetingChannelRef.current && meetingChannelRef.current.state === 'joined') {
        console.log("[Cleanup] Saindo do canal Phoenix.");
        meetingChannelRef.current.leave();
      }
      meetingChannelRef.current = null; // Limpa a referência do canal
      // IMPORTANTE: Não desconecte o socket aqui (`socket.disconnect()`)
      // porque `setupPhoenixSocket` garante uma única instância.
      // Desconectar aqui afetaria outras partes da aplicação que possam usar o mesmo socket.
      // A menos que você queira que o socket só exista para esta sala.
      // Se for para ser um socket global, ele não deve ser desconectado aqui.
      // Se for por sala, remova o `phoenixSocketInstance` do `socket.js` e permita nova conexão.
      // Para este cenário, vamos assumir que o socket pode ser global.
    };
  }, [id, localUserId, authToken, navigate, toast, getMedia, handleSignalingMessage, createPeerConnection, removePeerConnection]); // Dependências: id da reunião, localUserId, authToken, navigate, toast, e as funções de callback

  // Efeito para ligar/desligar faixas de áudio/vídeo localmente
  useEffect(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = controls.mic;
        console.log(`[Media] Microfone: ${controls.mic ? 'ativado' : 'desativado'}`);
      }
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = controls.video;
        console.log(`[Media] Vídeo: ${controls.video ? 'ativado' : 'desativado'}`);
      }
    }
  }, [controls.mic, controls.video]);


  const handleControlToggle = async (control) => {
    // Inverte o estado imediatamente para uma resposta mais rápida da UI
    setControls(prev => ({ ...prev, [control]: !prev[control] }));

    const newControlState = !controls[control]; // O estado *após* a mudança

    let controlName = '';
    switch (control) {
      case 'mic':
        controlName = 'Microfone';
        // A lógica de ativar/desativar a track já está no useEffect acima
        break;
      case 'video':
        controlName = 'Câmara';
        // A lógica de ativar/desativar a track já está no useEffect acima
        break;
      case 'screen':
        controlName = 'Partilha de ecrã';
        if (newControlState) { // Se ativando a partilha de tela
          try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            const screenVideoTrack = screenStream.getVideoTracks()[0];
            const screenAudioTrack = screenStream.getAudioTracks()[0]; // Pode ser nulo

            // Substituir faixas na stream local
            if (localStreamRef.current) {
                // Remover faixas de vídeo/áudio existentes (se da câmera)
                localStreamRef.current.getVideoTracks().forEach(track => {
                    localStreamRef.current.removeTrack(track);
                    track.stop();
                });
                localStreamRef.current.getAudioTracks().forEach(track => {
                    localStreamRef.current.removeTrack(track);
                    track.stop();
                });

                localStreamRef.current.addTrack(screenVideoTrack);
                if (screenAudioTrack) {
                    localStreamRef.current.addTrack(screenAudioTrack);
                }

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStreamRef.current;
                }

                // Para cada conexão peer, substituir as faixas que estão sendo enviadas
                Object.values(peerConnectionsRef.current).forEach(pc => {
                    const videoSender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(screenVideoTrack);
                    } else {
                        pc.addTrack(screenVideoTrack, localStreamRef.current);
                    }
                    if (screenAudioTrack) {
                        const audioSender = pc.getSenders().find(s => s.track && s.track.kind === 'audio');
                        if (audioSender) {
                            audioSender.replaceTrack(screenAudioTrack);
                        } else {
                            pc.addTrack(screenAudioTrack, localStreamRef.current);
                        }
                    }
                });

                // Detectar quando a partilha de tela é encerrada pelo navegador
                screenVideoTrack.onended = () => {
                    console.log("[Media] Partilha de ecrã encerrada pelo utilizador.");
                    setControls(prev => ({ ...prev, screen: false }));
                    getMedia(); // Reativar câmera/microfone
                    toast({ title: "Partilha de ecrã parada", duration: 2000 });
                };
            }
          } catch (err) {
            console.error("Erro ao partilhar ecrã:", err);
            toast({ title: "Erro ao partilhar ecrã", variant: "destructive", duration: 3000 });
            setControls(prev => ({ ...prev, screen: false })); // Desativa o controle se houver erro
          }
        } else { // Se desativando a partilha de tela
          getMedia(); // Reativar câmera/microfone
        }
        break;
      case 'hand':
        controlName = `Mão ${newControlState ? 'levantada' : 'baixada'}`;
        // Enviar via push do canal Phoenix
        if (meetingChannelRef.current) {
          meetingChannelRef.current.push("hand_toggle", { user_id: localUserId, hand_raised: newControlState });
        }
        break;
      case 'record':
        controlName = `Gravação ${newControlState ? 'iniciada' : 'parada'}`;
        toast({
          title: "Funcionalidade de gravação em desenvolvimento...",
          duration: 3000,
        });
        break;
      default: break;
    }

    // Feedback visual (toasts)
    if (control === 'hand' || control === 'record' || control === 'screen') {
      toast({ title: controlName, duration: 2000 });
    } else {
      toast({ title: `${controlName} ${newControlState ? 'ativado' : 'desativado'}`, duration: 2000 });
    }
  };

  const handleLeaveMeeting = () => {
    toast({ title: "A sair da reunião...", duration: 2000 });
    console.log("[Leave] Iniciando saída da reunião.");

    // Acionar a limpeza do useEffect manualmente (chamando o retorno)
    // Isso é uma forma de garantir que o cleanup aconteça ao navegar
    // mas a navegação já causará a desmontagem do componente, acionando o useEffect cleanup.
    // Para saídas "limpas", o mais importante é o `channel.leave()`
    // e o `peerConnectionsRef.current[userId].close()`.

    if (meetingChannelRef.current && meetingChannelRef.current.state === 'joined') {
      console.log("[Leave] Enviando sinal de saída do canal.");
      meetingChannelRef.current.push("user_left", { user_id: localUserId, name: `User ${localUserId}` });
      meetingChannelRef.current.leave(); // Sair do canal explicitamente
    }

    // Fechar todas as conexões WebRTC
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};

    // Parar todas as faixas (tracks) de mídia locais
    if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
    }

    // Navegar após um pequeno atraso para o toast ser visível
    setTimeout(() => {
        navigate('/dashboard');
    }, 1000);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab !== 'participants' && tab !== 'chat') { // Adicione 'chat' como uma aba funcional
      toast({
        title: "🚧 Esta funcionalidade ainda não foi implementada....",
        duration: 3000,
      });
    }
  };

  // Função para enviar mensagens de chat (passada para ChatPanel)
  const handleSendMessage = useCallback((messageBody) => {
    if (meetingChannelRef.current && meetingChannelRef.current.state === 'joined') {
      meetingChannelRef.current.push("new_msg", { body: messageBody, sender_id: localUserId, sender_name: `User ${localUserId}` }) // Correção: "new_msg" de acordo com o Elixir
        .receive("ok", () => console.log("Mensagem enviada com sucesso!"))
        .receive("error", (resp) => console.error("Erro ao enviar mensagem:", resp));
    } else {
      console.warn("Canal de reunião não está conectado para enviar mensagem.");
      toast({
          title: "Erro ao enviar mensagem",
          description: "Canal de chat não conectado ou fechado.",
          variant: "destructive",
          duration: 3000
      });
    }
  }, [localUserId, toast]); // Dependências: localUserId e toast

  return (
    <>
      <Helmet>
        <title>{meetingName} - Cadence</title>
        <meta name="description" content="Sala de reunião virtual da plataforma Cadence para colaboração em tempo real." />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <MeetingHeader meetingName={meetingName} onLeave={handleLeaveMeeting} />
        <div className="flex-1 flex overflow-hidden">
          {/* Adicionar participantes reais aqui */}
          <ParticipantsPanel
            activeTab={activeTab}
            onTabClick={handleTabClick}
            localUserId={localUserId} // Passa o ID do usuário local
            remoteParticipants={remoteParticipants} // Passa os participantes remotos
          />
          {/* Main Content Area - Onde os vídeos aparecerão */}
          <div className="flex-1 p-4 bg-gray-100 flex flex-wrap justify-center items-center gap-4 relative">
            {/* Seu vídeo local */}
            <div className="w-64 h-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden relative">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline // Importante para autoplay em dispositivos móveis
                muted // Mute your own video
                className="w-full h-full object-cover transform scaleX(-1)" // Espelhar vídeo local
              />
              <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                Você ({localUserId})
              </div>
            </div>

            {/* Vídeos dos participantes remotos */}
            {remoteParticipants.map(participant => (
              <div key={participant.id} className="w-64 h-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden relative">
                <video
                  ref={el => {
                    // Atribuir o elemento ao ref e anexar o stream
                    remoteVideoRefs.current[participant.id] = el;
                    if (el && participant.stream) {
                      el.srcObject = participant.stream;
                    }
                  }}
                  autoPlay
                  playsInline // Importante para autoplay em dispositivos móveis
                  className="w-full h-full object-cover" // Não espelhar vídeo remoto
                />
                <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  {participant.name} ({participant.id})
                </div>
              </div>
            ))}

            {remoteParticipants.length === 0 && !localStreamRef.current && (
                <div className="text-gray-500 text-lg">
                    Aguardando outros participantes ou acesso à sua câmara/microfone...
                </div>
            )}
            {remoteParticipants.length === 0 && localStreamRef.current && (
                <div className="text-gray-500 text-lg">
                    Aguardando outros participantes...
                </div>
            )}
          </div>
          {/* Passe as mensagens de chat e a função de envio para o ChatPanel */}
          <ChatPanel activeTab={activeTab} chatMessages={chatMessages} onSendMessage={handleSendMessage} />
        </div>
        <MeetingControls controls={controls} onToggle={handleControlToggle} onLeave={handleLeaveMeeting} />
      </div>
    </>
  );
};

export default MeetingRoom;