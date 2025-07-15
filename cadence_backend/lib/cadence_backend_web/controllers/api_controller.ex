# lib/cadence_backend_web/controllers/api_controller.ex
defmodule CadenceBackendWeb.ApiController do
  use CadenceBackendWeb, :controller

   alias CadenceBackend.Accounts

  def status(conn, _params) do
    json(conn, %{status: "online", message: "CadenceBackend API is running!"})
  end

  # lib/cadence_backend_web/controllers/api_controller.ex

def me(conn, _params) do
  case conn.assigns[:current_user] do
    nil ->
      json(conn, anonymous_user_data())

    claims ->
      user_id = claims["sub"]

      case Accounts.get_user_by_id(user_id) do
        nil ->
          json(conn, anonymous_user_data())

        user ->
          json(conn, %{
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url,
            member_since: user.member_since
          })
      end

      # Cenário 2: Nenhum utilizador autenticado.
      _ ->
        json(conn, anonymous_user_data())
    end
  end

# Função privada para manter o código limpo e não repetir os dados do utilizador anónimo.
defp anonymous_user_data do
  %{
    id: "anonymous_user",
    name: "Usuário Anônimo",
    email: "anon@cadence.com",
    role: "Visitante",
    avatar_url: nil,
    member_since: nil
  }
end


  # PUT /api/me
  def update_me(conn, params) do
    user = conn.assigns[:current_user] || %{}
    updated_user = Map.merge(user, Map.take(params, ["name", "email"]))
    # Aqui você deveria salvar no banco, mas para mock:
    json(conn, updated_user)
  end
end
