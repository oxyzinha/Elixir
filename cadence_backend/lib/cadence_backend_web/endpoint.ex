defmodule CadenceBackendWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :cadence_backend

  @session_options [
    store: :cookie,
    key: "_cadence_backend_key",
    signing_salt: "mpCN24v7", # Altere para um valor seguro e único em produção
    same_site: "Lax"
  ]

  plug Plug.Static,
    at: "/",
    from: :cadence_backend,
    gzip: false,
    only: CadenceBackendWeb.static_paths()

  if code_reloading? do
    plug Phoenix.CodeReloader
    # Phoenix.Ecto.CheckRepoStatus garante que seu repositório Ecto está conectado.
    # É uma boa prática tê-lo em desenvolvimento.
    plug Phoenix.Ecto.CheckRepoStatus, otp_app: :cadence_backend
  end

  # REMOVIDO: plug Phoenix.LiveView.Flash (Não é necessário para uma API REST e pode causar warnings se não for usado com LiveView)

  plug Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  # --- CONFIGURAÇÃO CORS COM CORSICA (RECOMENDADO) ---
  # REMOVA TODAS AS SUAS FUNÇÕES PRIVADAS handle_options_requests E add_cors_headers, E SEUS PLUGS MANUAIS.
  # Esta é a forma recomendada e mais robusta de lidar com CORS.
  # Certifique-se de que a origem (http://localhost:5173) é exatamente a do seu frontend.
  plug Corsica,
    origins: ["http://localhost:5173"], # Especifique a origem exata do seu frontend React/Vite
    allow_headers: ~w(authorization content-type accept), # Inclua todos os cabeçalhos que seu frontend pode enviar
    allow_methods: ~w(GET POST PUT PATCH DELETE OPTIONS), # Métodos HTTP permitidos
    max_age: 86400, # Tempo em segundos que a preflight request pode ser cacheada
    allow_credentials: true # Se você usa credenciais (cookies, headers de autorização)
  # --- FIM DA CONFIGURAÇÃO CORS ---

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug CadenceBackendWeb.Router # O Router SEMPRE VEM POR ÚLTIMO

  # Configuração do socket para o seu CadenceBackendWeb.UserSocket (Phoenix Channels)
  # CORREÇÃO AQUI: Passamos :user_id e :token via connect_info, que virão da query string do cliente.
  socket "/socket", CadenceBackendWeb.UserSocket,
    websocket: [
      connect_info: [:peer_data, :x_headers, session: @session_options, user_id: :user_id, token: :token]
    ],
    longpoll: [connect_info: [session: @session_options, user_id: :user_id, token: :token]]

  # Configuração para o Phoenix LiveView (se você estiver usando LiveView)
  # Mantenha se você usa LiveView, caso contrário, pode remover este bloco.
  socket "/live", Phoenix.LiveView.Socket,
    websocket: [connect_info: [session: @session_options]],
    longpoll: [connect_info: [session: @session_options]]

  # Serve assets and favicon.
  # Adicione 'vite.svg' se estiver usando Vite e ele estiver na sua pasta estática.
  def static_paths, do: ~w(assets fonts images favicon.ico robots.txt vite.svg)
end
