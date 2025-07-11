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
# Usar a chave aninhada :firebase para consistência.
# ====================================================================
config :cadence_backend, :firebase,
  project_id: "estagio-cb19d", # SEU Project ID REAL
  api_key: "AIzaSyCUtuu04u21-DXFClcmr5_mt9wVs44jds0", # SUA API Key REAL
  database_type: :firestore
