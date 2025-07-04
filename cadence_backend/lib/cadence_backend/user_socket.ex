# lib/cadence_backend_web/user_socket.ex

defmodule CadenceBackendWeb.UserSocket do
  use Phoenix.Socket

  ## Channels
  channel "meeting:*", CadenceBackendWeb.MeetingChannel

  ## Disconnect
  def disconnect(_socket) do
    :ok
  end

  ## Authentication
  @impl true
  # Mantenha apenas UMA função connect/3 para simplificar
  # Remova qualquer outra definição de connect/3 que possa existir abaixo desta
  def connect(params, socket, connect_info) do
    IO.inspect({:socket_connect_params, params}, label: "DEBUG SOCKET CONNECT - Params Recebidos")
    IO.inspect({:socket_connect_info, connect_info}, label: "DEBUG SOCKET CONNECT - Info Recebida")

    # MOCK PARA TESTES: Sempre permita a conexão, independentemente dos parâmetros.
    # Em um ambiente de produção, esta seria sua lógica de autenticação real e segura.
    mock_user_id = Map.get(params, "user_id", "mock_user_default") # Usa o user_id se existir, senão um default
    new_socket = assign(socket, :current_user, %{id: mock_user_id, name: "User_#{mock_user_id}"})
    new_socket = assign(new_socket, :user_id, mock_user_id)

    IO.inspect({:socket_connect_result, :ok_authenticated_mock}, label: "DEBUG SOCKET CONNECT - Resultado")
    {:ok, new_socket}
  end

  @impl true
  def id(socket) do
    # Usa o user_id do assigns se ele foi atribuído.
    # Caso contrário, usa socket.id como fallback.
    if socket.assigns[:user_id] do
      "users_socket:#{socket.assigns.user_id}"
    else
      "user_socket:#{socket.id}"
    end
  end
end
