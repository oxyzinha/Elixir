defmodule CadenceBackendWeb.AuthController do
  use CadenceBackendWeb, :controller
  alias CadenceBackend.Guardian

  # POST /api/login
  def login(conn, %{"username" => username, "password" => password}) do
    # Exemplo: autenticação fake (substitua por consulta real ao banco)
    if username == "joao" and password == "1234" do
      user = %{id: 1, name: "João Silva", email: "joao@cadence.com", role: "Admin"}
      {:ok, token, _claims} = Guardian.encode_and_sign(user)
      json(conn, %{token: token, user: user})
    else
      conn
      |> put_status(:unauthorized)
      |> json(%{error: "Credenciais inválidas"})
    end
  end
end
