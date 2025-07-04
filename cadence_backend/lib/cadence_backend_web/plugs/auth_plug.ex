defmodule CadenceBackendWeb.AuthPlug do
  @moduledoc """
  A plug to simulate user authentication.
  In a real app, this would validate a JWT token or session.
  """
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    # ID do usuário para este teste
    user_id = "user_joao"
    user = %{id: user_id, name: "João Silva"}
    assign(conn, :current_user, user)
  end
end
