# lib/cadence_backend/meetings/meeting_channel.ex
defmodule CadenceBackendWeb.MeetingChannel do
  use Phoenix.Channel
  alias CadenceBackendWeb.Endpoint

  @impl true
  def join("meeting:" <> meeting_id, _params, socket) do
    user_id = socket.assigns[:user_id] || "guest_#{System.unique_integer()}"
    current_user_name = socket.assigns[:current_user].name || "Guest"
    socket = assign(socket, :meeting_id, meeting_id)
    socket = assign(socket, :user_id, user_id)
    socket = assign(socket, :current_user, %{id: user_id, name: current_user_name})

    Endpoint.broadcast!(
      "meeting:" <> meeting_id,
      "user_joined",
      %{user_id: user_id, name: current_user_name}
    )

    {:ok, socket}
  end

  @impl true
  def handle_in(event, payload, socket) do
    case {event, payload} do
      {"user_ready", %{"user_id" => user_id}} ->
        existing_participants = [
          %{user_id: "Maria_Santos", name: "Maria Santos"},
          %{user_id: "Pedro_Costa", name: "Pedro Costa"}
        ]
        filtered_participants = Enum.filter(existing_participants, fn p -> p.user_id != user_id end)
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
        Endpoint.broadcast!(
          "meeting:" <> socket.assigns.meeting_id,
          "new_msg",
          %{sender_id: sender_id, sender_name: sender_name, body: body}
        )
        {:noreply, socket}

      _ ->
        IO.warn("Evento de canal não reconhecido: #{event} com payload #{inspect(payload)}")
        {:noreply, socket}
    end
  end

  defp broadcast_signal(payload, socket) do
    sender_id = socket.assigns.user_id
    Endpoint.broadcast_from(
      socket,
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
end
