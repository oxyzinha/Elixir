# lib/cadence_backend/meetings/meeting_channel.ex
defmodule CadenceBackendWeb.MeetingChannel do
  use Phoenix.Channel
  alias CadenceBackendWeb.Endpoint
  alias CadenceBackend.PresenceTracker
  alias CadenceBackend.ChatManager

  @impl true
  def join("meeting:" <> meeting_id, _params, socket) do
    user_id = socket.assigns[:user_id] || "guest_#{System.unique_integer()}"
    current_user_name = socket.assigns[:current_user].name || "Guest"
    IO.puts("[MEETING_CHANNEL] join: user_id=#{user_id}, meeting_id=#{meeting_id}, name=#{current_user_name}")
    socket = assign(socket, :meeting_id, meeting_id)
    socket = assign(socket, :user_id, user_id)
    socket = assign(socket, :current_user, %{id: user_id, name: current_user_name})

    Endpoint.broadcast!(
      "meeting:" <> meeting_id,
      "user_joined",
      %{user_id: user_id, name: current_user_name}
    )

    send(self(), :after_join)
    {:ok, socket}
  end

  @impl true
  def handle_in(event, payload, socket) do
    IO.inspect({event, payload}, label: "[MEETING_CHANNEL] handle_in recebido")
    case {event, payload} do
      {"user_ready", %{"user_id" => user_id, "name" => user_name}} ->
        # Apenas lista os participantes já presentes (não faz track de novo!)
        presence_list = PresenceTracker.list(socket)
        participants = Enum.map(presence_list, fn {id, %{metas: [meta | _]}} ->
          %{user_id: id, name: meta.name}
        end)
        filtered_participants = Enum.filter(participants, fn p -> p.user_id != user_id end)
        {:reply, {:ok, %{existing_participants: filtered_participants}}, socket}

      {"signal", %{"type" => "offer"} = payload} ->
        broadcast_signal(payload, socket)
        {:noreply, socket}

      {"signal", %{"type" => "answer"} = payload} ->
        broadcast_signal(payload, socket)
        {:noreply, socket}

      {"signal", %{"type" => "candidate"} = payload} ->
        broadcast_signal(payload, socket)
        {:noreply, socket}

      {"hand_toggle", %{"user_id" => user_id, "hand_raised" => hand_raised}} ->
        Endpoint.broadcast!("meeting:" <> socket.assigns.meeting_id, "hand_toggled", %{
          user_id: user_id,
          hand_raised: hand_raised
        })
        {:noreply, socket}

      {"new_msg", %{"sender_id" => sender_id, "sender_name" => sender_name, "body" => body}} ->
        # Adiciona timestamp à mensagem
        message_payload = %{
          sender_id: sender_id,
          sender_name: sender_name,
          body: body,
          timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
        }

        IO.puts("[MEETING_CHANNEL] Nova mensagem de #{sender_name}: #{body}")

        # Armazena a mensagem no ChatManager
        ChatManager.add_message(socket.assigns.meeting_id, message_payload)

        Endpoint.broadcast!(
          "meeting:" <> socket.assigns.meeting_id,
          "new_msg",
          message_payload
        )
        {:noreply, socket}

      {"user_typing", %{"user_id" => user_id, "user_name" => user_name}} ->
        IO.puts("[MEETING_CHANNEL] #{user_name} está digitando...")
        Endpoint.broadcast!("meeting:" <> socket.assigns.meeting_id, "user_typing", %{
          user_id: user_id,
          user_name: user_name
        })
        {:noreply, socket}

      {"user_stopped_typing", %{"user_id" => user_id, "user_name" => user_name}} ->
        IO.puts("[MEETING_CHANNEL] #{user_name} parou de digitar")
        Endpoint.broadcast!("meeting:" <> socket.assigns.meeting_id, "user_stopped_typing", %{
          user_id: user_id,
          user_name: user_name
        })
        {:noreply, socket}

      _ ->
        IO.warn("Evento de canal não reconhecido: #{event} com payload #{inspect(payload)}")
        {:noreply, socket}
    end
  end

  defp broadcast_signal(payload, socket) do
    sender_id = socket.assigns.user_id
    Endpoint.broadcast_from(
      self(),
      "meeting:" <> socket.assigns.meeting_id,
      "signal",
      Map.merge(payload, %{"sender_id" => sender_id})
    )
  end

  @impl true
  def terminate(_reason, socket) do
    user_id = socket.assigns.user_id
    current_user_name = socket.assigns[:current_user].name || "Guest"
    Endpoint.broadcast!("meeting:" <> socket.assigns.meeting_id, "user_left", %{
      user_id: user_id,
      name: current_user_name
    })
    :ok
  end

  @impl true
  def handle_out(_event, payload, socket) do
    {:ok, payload, socket}
  end

  @impl true
  def handle_info(:after_join, socket) do
    user_id = socket.assigns.user_id
    user_name = socket.assigns.current_user.name
    meeting_id = socket.assigns.meeting_id

    IO.puts("[MEETING_CHANNEL] after_join: tracking presence for user_id=#{user_id}, name=#{user_name}")
    {:ok, _} = PresenceTracker.track(socket, user_id, %{name: user_name})
    presence_list = PresenceTracker.list(socket)
    IO.inspect(presence_list, label: "[MEETING_CHANNEL] presence_list enviado para o cliente")
    push(socket, "presence_state", presence_list)

    # Envia o histórico de mensagens do chat
    chat_messages = ChatManager.get_messages(meeting_id, 20)
    IO.inspect(chat_messages, label: "[MEETING_CHANNEL] chat_history enviado para o cliente")
    push(socket, "chat_history", %{messages: chat_messages})

    {:noreply, socket}
  end
end
