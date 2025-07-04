# lib/cadence_backend_web/router.ex

defmodule CadenceBackendWeb.Router do
  use CadenceBackendWeb, :router
  import Phoenix.Router

  pipeline :api do
    plug :accepts, ["json"]

    plug Plug.Parsers,
      parsers: [:json],
      pass: ["application/json"],
      json_decoder: Phoenix.json_library()

    plug CadenceBackendWeb.AuthPlug
    plug :put_current_user
  end

  pipeline :dev_routes_pipeline do
    plug :fetch_session
    plug :protect_from_forgery
  end

  # --- NOVO BLOCO DE ROTA PARA O CAMINHO RAIZ (/) ---
  scope "/", CadenceBackendWeb do
    pipe_through :api # Usa o mesmo pipeline de API para retornar JSON
    get "/", ApiController, :status # <-- ADICIONE ESTA LINHA
  end
  # --- FIM DO NOVO BLOCO ---

  scope "/api", CadenceBackendWeb do
    pipe_through :api
    get "/meetings", MeetingController, :index
    post "/meetings", MeetingController, :create
    get "/meetings/:id", MeetingController, :show
  end

  if Application.compile_env(:cadence_backend, :dev_routes) do
    import Phoenix.LiveDashboard.Router

    scope "/dev", CadenceBackendWeb do
      pipe_through :dev_routes_pipeline
      live_dashboard "/dashboard", metrics: CadenceBackendWeb.Telemetry
    end
  end

  defp put_current_user(conn, _opts) do
    if !conn.assigns[:current_user] do
      assign(conn, :current_user, %{id: "anonymous_user", name: "Anônimo"})
    else
      conn
    end
  end
end
