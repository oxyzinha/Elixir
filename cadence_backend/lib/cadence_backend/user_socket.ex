# lib/cadence_backend_web/channels/user_socket.ex

defmodule CadenceBackendWeb.UserSocket do
  use Phoenix.Socket

  ## Channels
  # Qualquer canal que usa este socket deve ser listado aqui.
  # Exemplo: canal "meeting:*" para todas as reuniões.
  channel "meeting:*", CadenceBackendWeb.MeetingChannel

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
  def connect(params, socket, connect_info) do
    # Debugging: Imprima os parâmetros e as informações de conexão para ver o que está a chegar.
    IO.inspect({:socket_connect_params, params}, label: "DEBUG SOCKET CONNECT - Params Recebidos")
    IO.inspect({:socket_connect_info, connect_info}, label: "DEBUG SOCKET CONNECT - Info Recebida")

    # MOCK PARA TESTES:
    # Em um ambiente de produção, esta seria sua lógica de autenticação real e segura.
    # Por exemplo, você validaria o 'token' e buscaria o usuário no seu banco de dados.
    # Se a autenticação falhar, você retornaria `{:error, reason}`.

    # Pega o user_id dos parâmetros da query string, ou um valor padrão se não estiver presente.
    mock_user_id = Map.get(params, "user_id", "mock_user_default")
    mock_user_name = "Utilizador #{mock_user_id}" # Gera um nome para o usuário mockado

    # Atribui o `current_user` e `user_id` ao `socket.assigns`.
    # Estes assigns estarão disponíveis em todos os handlers do canal (`handle_in`, `join`, etc.).
    new_socket = assign(socket, :current_user, %{id: mock_user_id, name: mock_user_name})
    new_socket = assign(new_socket, :user_id, mock_user_id) # Para uso em `id/1`

    # Debugging: Confirma que a conexão foi "autenticada" (mock) e retorna o novo socket.
    IO.inspect({:socket_connect_result, :ok_authenticated_mock}, label: "DEBUG SOCKET CONNECT - Resultado")
    {:ok, new_socket}
  end

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
