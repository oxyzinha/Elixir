# config/test.exs
import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :cadence_backend, CadenceBackendWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "xRj+FH+DbYa3VvR2HzpEf/ENe1GVqxBOn5l2V8IDT4A9T1Qxl7Qhxt9wH/7eqeAz",
  server: false

# In test we don't send emails
config :cadence_backend, CadenceBackend.Mailer, adapter: Swoosh.Adapters.Test

# Disable swoosh api client as it is only required for production adapters
config :swoosh, :api_client, false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoence, :plug_init_mode, :runtime

# ====================================================================
# CONFIGURAÇÕES DO FIREBASE (TESTE)
# Para testes, podemos usar um ID de projeto mockado ou um projeto de teste separado.
# No entanto, se você for fazer testes de integração que realmente batem no Firebase,
# precisará de credenciais válidas. Para testes unitários, não é necessário.
# ====================================================================
config :cadence_backend, :firebase,
  project_id: "test-firebase-project", # ID de projeto mock para testes
  api_key: "mock-api-key",             # API Key mock para testes
  database_type: :firestore
