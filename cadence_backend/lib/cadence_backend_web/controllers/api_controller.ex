# lib/cadence_backend_web/controllers/api_controller.ex
defmodule CadenceBackendWeb.ApiController do
  use CadenceBackendWeb, :controller

  def status(conn, _params) do
    json(conn, %{status: "online", message: "CadenceBackend API is running!"})
  end

  # GET /api/me
  def me(conn, _params) do
    user = conn.assigns[:current_user] || %{
      id: "anonymous_user",
      name: "Usuário Anônimo",
      email: "anon@cadence.com",
      role: "Visitante",
      avatar_url: nil,
      member_since: nil
    }

    json(conn, %{
      id: user.id,
      name: user.name,
      email: Map.get(user, :email, "anon@cadence.com"),
      role: Map.get(user, :role, "Visitante"),
      avatar_url: Map.get(user, :avatar_url, nil),
      member_since: Map.get(user, :member_since, nil)
    })
  end


  # PUT /api/me
  def update_me(conn, params) do
    user = conn.assigns[:current_user] || %{}
    updated_user = Map.merge(user, Map.take(params, ["name", "email"]))
    # Aqui você deveria salvar no banco, mas para mock:
    json(conn, updated_user)
  end
end
