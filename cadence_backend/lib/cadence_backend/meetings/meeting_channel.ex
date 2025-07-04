defmodule CadenceBackendWeb.MeetingChannel do
  use Phoenix.Channel
  alias CadenceBackendWeb.Endpoint # Para broadcasting

  @impl true
  def join("meeting:" <> meeting_id, _params, socket) do
    # Atribui o meeting_id ao socket para uso futuro
    {:ok, assign(socket, :meeting_id, meeting_id)}
  end

  # Lida com mensagens de sinalização (WebRTC Offer/Answer/Candidate)
  @impl true
  def handle_in("signal", %{"type" => _type, "offer" => _offer, "answer" => _answer, "candidate" => _candidate, "target_user_id" => _target_user_id} = payload, socket) do
    sender_id = socket.assigns.user_id

    Endpoint.broadcast_from(
      socket,
      "meeting:" <> socket.assigns.meeting_id, # Topico da reunião
      "signal",                               # Evento
      Map.put(payload, "user_id", sender_id)  # Payload, adicionando o ID do remetente
    )

    {:noreply, socket}
  end

  # Lida com o evento de levantar/baixar a mão
  @impl true
  def handle_in("hand_toggle", %{"user_id" => user_id, "hand_raised" => hand_raised}, socket) do
    Endpoint.broadcast!("meeting:" <> socket.assigns.meeting_id, "hand_toggled", %{user_id: user_id, hand_raised: hand_raised})
    {:noreply, socket}
  end

  # Lida com mensagens de chat
  @impl true
  def handle_in("msg", %{"body" => body}, socket) do
    sender_id = socket.assigns.user_id
    sender_name = socket.assigns.current_user.name
    Endpoint.broadcast!("meeting:" <> socket.assigns.meeting_id, "new_msg", %{sender_id: sender_id, sender_name: sender_name, body: body})
    {:noreply, socket}
  end

  # Lida com a desconexão do utilizador
  @impl true
  def terminate(_reason, _socket) do
    :ok
  end

  @impl true
  def handle_out(_event, payload, socket) do
    {:ok, payload, socket}
  end
end
