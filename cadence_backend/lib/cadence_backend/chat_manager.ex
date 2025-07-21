defmodule CadenceBackend.ChatManager do
  @moduledoc """
  Gerenciador de mensagens de chat em tempo real.
  Armazena mensagens em memória por reunião e fornece funcionalidades de chat.
  """

  use GenServer
  require Logger

  # Client API

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Adiciona uma nova mensagem ao chat de uma reunião.
  """
  def add_message(meeting_id, message) do
    GenServer.cast(__MODULE__, {:add_message, meeting_id, message})
  end

  @doc """
  Obtém as últimas mensagens de uma reunião.
  """
  def get_messages(meeting_id, limit \\ 50) do
    GenServer.call(__MODULE__, {:get_messages, meeting_id, limit})
  end

  @doc """
  Limpa as mensagens de uma reunião.
  """
  def clear_messages(meeting_id) do
    GenServer.cast(__MODULE__, {:clear_messages, meeting_id})
  end

  # Server Callbacks

  @impl true
  def init(_opts) do
    Logger.info("ChatManager iniciado")
    {:ok, %{}}
  end

  @impl true
  def handle_cast({:add_message, meeting_id, message}, state) do
    messages = Map.get(state, meeting_id, [])
    new_message = %{
      id: generate_message_id(),
      sender_id: message.sender_id,
      sender_name: message.sender_name,
      body: message.body,
      timestamp: message.timestamp || DateTime.utc_now() |> DateTime.to_iso8601()
    }

    # Adiciona a nova mensagem e mantém apenas as últimas 100 mensagens
    updated_messages = [new_message | messages] |> Enum.take(100)
    new_state = Map.put(state, meeting_id, updated_messages)

    Logger.info("Nova mensagem adicionada ao chat da reunião #{meeting_id}: #{message.sender_name}")
    {:noreply, new_state}
  end

  @impl true
  def handle_cast({:clear_messages, meeting_id}, state) do
    new_state = Map.delete(state, meeting_id)
    Logger.info("Mensagens da reunião #{meeting_id} foram limpas")
    {:noreply, new_state}
  end

  @impl true
  def handle_call({:get_messages, meeting_id, limit}, _from, state) do
    messages = Map.get(state, meeting_id, [])
    limited_messages = messages |> Enum.take(limit) |> Enum.reverse()
    {:reply, limited_messages, state}
  end

  defp generate_message_id do
    :crypto.strong_rand_bytes(16) |> Base.encode16(case: :lower)
  end
end
