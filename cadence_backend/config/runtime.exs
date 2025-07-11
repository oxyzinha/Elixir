# config/runtime.exs
import Config

# config/runtime.exs is executed for all environments, including
# during releases. It is executed after compilation and before the
# system starts, so it is typically used to load production configuration
# and secrets from environment variables or elsewhere. Do not define
# any compile-time configuration in here, as it won't be applied.
# The block below contains prod specific runtime configuration.

# ## Using releases
# ...

if System.get_env("PHX_SERVER") do
  config :cadence_backend, CadenceBackendWeb.Endpoint, server: true
end

if config_env() == :prod do
  # The secret key base is used to sign/encrypt cookies and other secrets.
  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  host = System.get_env("PHX_HOST") || "example.com"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :cadence_backend, :dns_cluster_query, System.get_env("DNS_CLUSTER_QUERY")

  config :cadence_backend, CadenceBackendWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base

  # ## SSL Support
  # ...

  # REMOVIDO: A linha abaixo que usava chaves não aninhadas (firebase_project_id, etc.)
  # config :cadence_backend,
  #   firebase_project_id: "SEU_PROJECT_ID",
  #   firebase_api_key: "SUA_API_KEY",
  #   firebase_database_type: :firestore

  # ## Configuring the mailer
  # ...

  # ====================================================================
  # CONFIGURAÇÕES DO FIREBASE (PRODUÇÃO)
  # Usam variáveis de ambiente para segurança e a estrutura aninhada :firebase.
  # ====================================================================
  config :cadence_backend, :firebase,
    project_id: System.get_env("FIREBASE_PROJECT_ID") ||
                raise("FIREBASE_PROJECT_ID environment variable is missing."),
    api_key: System.get_env("FIREBASE_API_KEY") ||
             raise("FIREBASE_API_KEY environment variable is missing."),
    database_type: (System.get_env("FIREBASE_DATABASE_TYPE") || "firestore") |> String.to_atom()
end
