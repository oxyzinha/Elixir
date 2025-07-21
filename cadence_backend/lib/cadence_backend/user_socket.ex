# lib/cadence_backend_web/channels/user_socket.ex

defmodule CadenceBackendWeb.UserSocket do
  use Phoenix.Socket

  ## Channels
  # Qualquer canal que usa este socket deve ser listado aqui.
  # Exemplo: canal "meeting:*" para todas as reuniões.
  channel "meeting:*", CadenceBackendWeb.MeetingChannel
  channel "user:*", CadenceBackendWeb.UserChannel

  ## Disconnect
  # Função chamada quando o cliente WebSocket se desconecta.
  def disconnect(_socket) do
    # Você pode adicionar lógica de limpeza aqui, como remover da presença.
    :ok
  end

  ## Authentication
  @impl true
  # A função `connect/3` é a primeira a ser chamada quando um cliente tenta se conectar via WebSocket.
  # `params`: Contém os parâmetros da query string da URL do WebSocket (ex: user_id, token).
  # `socket`: O objeto Plug.Conn para o handshake do WebSocket.
  # `connect_info`: Informações adicionais configuradas no Endpoint.
  def connect(%{"token" => token} = _params, socket, _connect_info) do
    IO.inspect(token, label: "TOKEN RECEBIDO NO SOCKET")
    case CadenceBackend.Guardian.decode_and_verify(token) do
      {:ok, claims} ->
        # Aqui você pode buscar o usuário real do banco, mas Guardian já retorna um user mock
        # Se você tiver um Accounts.get_user_by_id/1, use:
        # {:ok, user} = CadenceBackend.Accounts.get_user_by_id(claims["sub"])
        # Para agora, use o resource_from_claims do Guardian:
        case CadenceBackend.Guardian.resource_from_claims(claims) do
          {:ok, user} ->
            socket = assign(socket, :current_user, %{id: user.id, name: user.name})
            socket = assign(socket, :user_id, user.id)
            {:ok, socket}
          _ ->
            :error
        end
      _ ->
        :error
    end
  end

  # Fallback para conexões sem token (opcional, pode remover se quiser obrigar autenticação)
  def connect(_params, _socket, _connect_info), do: :error

  @impl true
  # A função `id/1` é usada para identificar o socket de forma única.
  # É usada internamente pelo Phoenix.Presence e pelo PubSub para rastreamento.
  def id(socket) do
    # Prioriza o `user_id` que foi atribuído aos assigns durante a conexão.
    # Isso permite que um usuário tenha vários sockets conectados, mas todos associados ao mesmo user_id.
    if socket.assigns[:user_id] do
      "users_socket:#{socket.assigns.user_id}"
    else
      # Fallback: Se por algum motivo o `user_id` não estiver nos assigns,
      # usa o ID interno do socket. Isso não deve acontecer se a lógica de `connect/3` funcionar.
      "user_socket:#{socket.id}"
    end
  end
end
