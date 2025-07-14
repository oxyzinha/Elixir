# config/dev.exs
import Config

# For development, we disable any cache and enable
# debugging and code reloading.
config :cadence_backend, CadenceBackendWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4000],
  debug_errors: true,
  code_reloader: true,
  check_origin: false,
  esbuild: [
    args: [
      "--external:/fonts/*",
      "--external:/images/*",
      "--external:/css/*",
      "--loader:.js=jsx",
      "--loader:.ts=tsx",
      "--target=es2017",
      "--platform=browser",
      "--format=esm",
      "--define:process.env.NODE_ENV=\"development\"",
      "--watch=forever",
      "--sourcemap=inline",
      "--outdir=../priv/static/assets"
    ],
    cd: Path.expand("../assets", __DIR__)
  ]

# ## SSL Support (comentado)
# ...

# Do not include metadata in logs in development env.
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime

config :phoenix,
  code_reloader: true,
  watch_static: false # Desativa o watch de arquivos estáticos

# ====================================================================
# CONFIGURAÇÕES DO FIREBASE (DESENVOLVIMENTO)
# ====================================================================
config :cadence_backend, :firebase,
  project_id: "estagio-cb19d", # Seu Project ID real
  api_key: "AIzaSyCutuu04u21-DXFC1cmr5_mt9Ws44jds0", # <--- CHAVE DE API DEFINIDA DIRETAMENTE AQUI
  database_type: :firestore
# REMOVIDO: Nenhuma configuração para Goth, pois não estamos usando-o com API Key
