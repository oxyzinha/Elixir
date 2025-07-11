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

# REMOVIDO: A configuração duplicada do Firebase que estava aqui.
# A configuração do Firebase agora será definida em cada ambiente.

config :cadence_backend, CadenceBackendWeb.Endpoint,
  pubsub_server: CadenceBackend.PubSub

# Configurações do logger
config :logger, :console,
  format: "[$level] $message\n",
  metadata: [:request_id]

# Configurações de tempo para plug_init_mode
config :phoenix, :plug_init_mode, :runtime

# Configuração do Finch para requisições HTTP (usado para Firebase)
# Mantenha a configuração do Finch aqui, se desejar um padrão global para o pool.
# O conn_timeout específico será definido no application.ex.
config :finch, name: CadenceBackend.Finch, pools: %{
  :default => [size: 20]
}

# Configuração global para Jason
config :jason,
  library: Jason,
  encode: [
    pretty: true,
    # Você pode adicionar mais opções aqui se precisar de controle fino
  ]

# Importa as configurações específicas do ambiente (dev, test, prod)
import_config "#{config_env()}.exs"
