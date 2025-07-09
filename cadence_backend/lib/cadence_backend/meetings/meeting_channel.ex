defmodule CadenceBackendWeb.MeetingChannel do
  use Phoenix.Channel
  alias CadenceBackendWeb.Endpoint # Para broadcasting

  @impl true
  def join("meeting:" <> meeting_id, _params, socket) do
    # Atribui o meeting_id ao socket para uso futuro
    user_id = socket.assigns[:user_id] || "guest_#{System.unique_integer()}" # Fallback
    current_user_name = socket.assigns[:current_user].name || "Guest" # Fallback
    socket = assign(socket, :meeting_id, meeting_id)
    socket = assign(socket, :user_id, user_id)
    socket = assign(socket, :current_user, %{id: user_id, name: current_user_name})

    # Publicar para os outros clientes que este usuário entrou
    # Este evento "user_joined" será para notificação, não para iniciar PCs (que é para "user_ready")
    Endpoint.broadcast!(
      "meeting:" <> meeting_id, # Usar o tópico da reunião
      "user_joined",
      %{user_id: user_id, name: current_user_name}
    )

    # Se você tiver uma lógica para retornar `existing_participants` no join,
    # você precisará de uma fonte de dados para isso (GenServer, ETS, etc.)
    # Por enquanto, retornaremos sem eles.
    {:ok, socket}
  end

  # ====================================================================================
  # handle_in para "user_ready"
  # ====================================================================================
  @impl true
  def handle_in("user_ready", %{"user_id" => user_id, "name" => _name}, socket) do # _name para suprimir o warning
    # Este evento é para sinalizar que o cliente está pronto para WebRTC.
    # Você provavelmente quer broadcast para que outros clientes saibam que ele está pronto
    # e para que o cliente que enviou possa obter a lista de participantes existentes.

    # Broadcast para todos os outros clientes na sala (exceto o remetente)
    # Se você já faz um broadcast "user_joined" no `join`, este pode ser redundante,
    # ou ter um propósito diferente (ex: "ready_for_webrtc").
    # De acordo com seu frontend, ele espera `existing_participants` de volta.
    # Então, não vamos broadcast "user_joined" aqui, apenas responder.

    # Você precisará de uma forma de obter os `existing_participants`.
    # Por agora, vamos retornar uma lista de exemplo.
    # Exemplo simples, se não houver um sistema de estado de sala ainda:
    # Em um sistema real, você obteria isso de um GenServer que gerencia o estado da sala.
    # Por exemplo: `existing_participants = CadenceBackend.Meetings.get_room_participants(socket.assigns.meeting_id)`
    # ou você pode obter a lista de sockets conectados a este tópico e filtrar.
    existing_participants = [
      %{user_id: "Maria_Santos", name: "Maria Santos"}, # Exemplo de mock
      %{user_id: "Pedro_Costa", name: "Pedro Costa"}    # Exemplo de mock
    ]
    # Certifique-se de que o próprio usuário não está na lista que ele recebe.
    filtered_participants = Enum.filter(existing_participants, fn p -> p.user_id != user_id end)

    # Responda ao cliente que enviou o "user_ready"
    {:reply, {:ok, %{existing_participants: filtered_participants}}, socket}
  end


  # ====================================================================================
  # CORREÇÃO PARA "signal" - Separe em handle_in para cada tipo de sinal
  # ====================================================================================

  # Lida com ofertas SDP
  @impl true
  def handle_in("signal", %{"type" => "offer", "offer" => _offer, "target_user_id" => _target_user_id} = payload, socket) do
    sender_id = socket.assigns.user_id
    # Transmite a oferta para o usuário alvo
    Endpoint.broadcast_from(
      socket,
      "meeting:" <> socket.assigns.meeting_id, # Topico da reunião
      "signal",                               # Evento
      Map.merge(payload, %{"sender_id" => sender_id}) # Adiciona sender_id, já tem target_user_id, offer, type
    )
    {:noreply, socket}
  end

  # Lida com respostas SDP
  @impl true
  def handle_in("signal", %{"type" => "answer", "answer" => _answer, "target_user_id" => _target_user_id} = payload, socket) do
    sender_id = socket.assigns.user_id
    # Transmite a resposta para o usuário alvo
    Endpoint.broadcast_from(
      socket,
      "meeting:" <> socket.assigns.meeting_id, # Topico da reunião
      "signal",                               # Evento
      Map.merge(payload, %{"sender_id" => sender_id}) # Adiciona sender_id, já tem target_user_id, answer, type
    )
    {:noreply, socket}
  end

  # Lida com candidatos ICE
  @impl true
  def handle_in("signal", %{"type" => "candidate", "candidate" => _candidate, "target_user_id" => _target_user_id} = payload, socket) do
    sender_id = socket.assigns.user_id
    # Transmite o candidato para o usuário alvo
    Endpoint.broadcast_from(
      socket,
      "meeting:" <> socket.assigns.meeting_id, # Topico da reunião
      "signal",                               # Evento
      Map.merge(payload, %{"sender_id" => sender_id}) # Adiciona sender_id, já tem target_user_id, candidate, type
    )
    {:noreply, socket}
  end

  # ====================================================================================
  # Continuam suas outras handle_in
  # ====================================================================================

  # Lida com o evento de levantar/baixar a mão
  @impl true
  def handle_in("hand_toggle", %{"user_id" => user_id, "hand_raised" => hand_raised}, socket) do
    Endpoint.broadcast!("meeting:" <> socket.assigns.meeting_id, "hand_toggled", %{user_id: user_id, hand_raised: hand_raised})
    {:noreply, socket}
  end

  # Lida com mensagens de chat
  # ATENÇÃO: Seu frontend está enviando "new_msg", não "msg" para este evento.
  # Altere a assinatura para corresponder:
  @impl true
  def handle_in("new_msg", %{"body" => body, "sender_id" => sender_id, "sender_name" => sender_name}, socket) do
    # Removi sender_id e sender_name do payload, pois o frontend já os envia
    # Se você quiser pegar do socket.assigns, comente as linhas acima e descomente estas:
    # sender_id = socket.assigns.user_id
    # sender_name = socket.assigns.current_user.name
    Endpoint.broadcast!(
      "meeting:" <> socket.assigns.meeting_id, # <-- CORRIGIDO AQUI!
      "new_msg",
      %{sender_id: sender_id, sender_name: sender_name, body: body}
    )
    {:noreply, socket}
  end

  # Lida com a desconexão do utilizador
  @impl true
  def terminate(_reason, socket) do
    # Broadcast que o usuário saiu
    user_id = socket.assigns.user_id
    current_user_name = socket.assigns[:current_user].name || "Guest"
    Endpoint.broadcast!("meeting:" <> socket.assigns.meeting_id, "user_left", %{user_id: user_id, name: current_user_name})
    :ok
  end

  @impl true
  def handle_out(_event, payload, socket) do
    {:ok, payload, socket}
  end

  # Catch-all para handle_in não reconhecidas (opcional, mas bom para debug)
  # MOVIDO PARA AQUI PARA AGRUPAR COM AS OUTRAS handle_in/3
  @impl true
  def handle_in(event, payload, socket) do
    IO.warn("Evento de canal não reconhecido: #{event} com payload #{inspect(payload)}")
    {:noreply, socket}
  end

end
