# Configuração do Guardian para autenticação JWT
import Config

config :cadence_backend, CadenceBackend.Guardian,
  issuer: "cadence_backend",
  secret_key: "SUA_CHAVE_SECRETA_AQUI_TROQUE_PARA_PRODUCAO"

# config/config.exs
import Config

# Configuração da sua aplicação e do endpoint Phoenix
config :cadence_backend, CadenceBackendWeb.Endpoint,
  url: [host: "localhost", port: 4000],
  render_errors: [view: CadenceBackendWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_extra_applications: [:phoenix_pubsub],
  live_view: [signing_salt: "YOUR_LIVE_VIEW_SALT"] # Substitua por um valor real em produção

# Configurações do mailer (Swoosh)
config :cadence_backend, CadenceBackend.Mailer,
  adapter: Swoosh.Adapters.Local

config :swoosh, :api_client, Swoosh.ApiClient.Hackney

config :cadence_backend, CadenceBackendWeb.Endpoint,
  pubsub_server: CadenceBackend.PubSub

# Configurações do logger
config :logger, :console,
  format: "[$level] $message\n",
  metadata: [:request_id]

# Configurações de tempo para plug_init_mode
config :phoenix, :plug_init_mode, :runtime

# Configuração do Finch para requisições HTTP (usado para Firebase)
# O conn_timeout específico será definido no application.ex.
config :finch, name: CadenceBackend.Finch, pools: %{
  :default => [size: 20]
}

config :cadence_backend, CadenceBackend.Mailer,
  adapter: Swoosh.Adapters.SMTP,
  relay: "smtp.gmail.com",
  username: "seu-email@gmail.com",
  password: "sua-senha-do-app",
  port: 587,
  ssl: false,
  tls: :always,
  auth: :always


# Configuração global para Jason
config :jason,
  library: Jason,
  encode: [
    pretty: true
  ]

# Importa as configurações específicas do ambiente (dev, test, prod)
import_config "#{config_env()}.exs"
