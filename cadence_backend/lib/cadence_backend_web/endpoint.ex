defmodule CadenceBackendWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :cadence_backend

  @session_options [
    store: :cookie,
    key: "_cadence_backend_key",
    signing_salt: "mpCN24v7", # Altere para um valor seguro e único em produção
    same_site: "Lax"
  ]

  # --- PLUGS DE CORS DEVEM VIR PRIMEIRO PARA AFETAR O HANDSHAKE DO WEBSOCKET ---
  # Plug para lidar com as requisições OPTIONS (para CORS)
  plug :handle_options_requests

  # Plug para adicionar cabeçalhos CORS às respostas reais
  plug :add_cors_headers
  # --- FIM DOS PLUGS DE CORS ---


  # Configuração do socket para o seu CadenceBackendWeb.UserSocket
  socket "/socket", CadenceBackendWeb.UserSocket,
    websocket: [connect_info: [session: @session_options]],
    longpoll: [connect_info: [session: @session_options]]

  # Configuração para o Phoenix LiveView (se você estiver usando LiveView)
  socket "/live", Phoenix.LiveView.Socket,
    websocket: [connect_info: [session: @session_options]],
    longpoll: [connect_info: [session: @session_options]]

  plug Plug.Static,
    at: "/",
    from: :cadence_backend,
    gzip: false,
    only: CadenceBackendWeb.static_paths()


  if code_reloading? do
    plug Phoenix.CodeReloader
  end

  plug Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug CadenceBackendWeb.Router # O Router SEMPRE VEM POR ÚLTIMO

  # --- FUNÇÕES PRIVADAS (CORS) ---
  defp handle_options_requests(conn, _opts) do
    if conn.method == "OPTIONS" do
      conn
      |> put_resp_header("access-control-allow-origin", "*")
      |> put_resp_header("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS")
      |> put_resp_header("access-control-allow-headers", "Accept, Authorization, Content-Type")
      |> put_resp_header("access-control-allow-credentials", "true")
      |> put_resp_header("access-control-max-age", "86400")
      |> send_resp(204, "")
      |> Plug.Conn.halt()
    else
      conn
    end
  end

  defp add_cors_headers(conn, _opts) do
    conn
    |> put_resp_header("access-control-allow-origin", "*")
    |> put_resp_header("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS")
    |> put_resp_header("access-control-allow-headers", "Accept, Authorization, Content-Type")
    |> put_resp_header("access-control-allow-credentials", "true")
  end
end
