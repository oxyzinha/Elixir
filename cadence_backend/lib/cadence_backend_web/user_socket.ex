defmodule CadenceBackendWeb.UserSocket do
  use Phoenix.Socket

  # Canais
  channel "meeting:*", CadenceBackendWeb.MeetingChannel
  channel "user:*", CadenceBackendWeb.UserChannel

  @impl true
  def connect(%{"token" => token} = _params, socket, _connect_info) do
    IO.inspect(token, label: "TOKEN RECEBIDO NO SOCKET")
    case CadenceBackend.Guardian.decode_and_verify(token) do
      {:ok, claims} ->
        case CadenceBackend.Guardian.resource_from_claims(claims) do
          {:ok, user} ->
            IO.inspect(user, label: "USUARIO OBTIDO DO FIREBASE NO SOCKET")
            socket = assign(socket, :current_user, %{id: user.id, name: user.name})
            socket = assign(socket, :user_id, user.id)
            IO.inspect(socket.assigns, label: "ASSIGNS DO SOCKET APOS AUTENTICACAO")
            {:ok, socket}
          _ ->
            IO.puts("ERRO: Não foi possível obter usuário a partir do token!")
            :error
        end
      _ ->
        IO.puts("ERRO: Token inválido!")
        :error
    end
  end

  def connect(_params, _socket, _connect_info), do: :error

  @impl true
  def id(socket) do
    if socket.assigns[:user_id] do
      "users_socket:#{socket.assigns.user_id}"
    else
      "user_socket:#{socket.id}"
    end
  end
end
