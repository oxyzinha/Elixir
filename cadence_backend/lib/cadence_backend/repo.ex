# lib/cadence_backend/repo.ex

defmodule CadenceBackend.Repo do
  use Ecto.Repo,
    otp_app: :cadence_backend,
    adapter: Ecto.Adapters.SQLite3 # <--- MUDE ISTO AQUI!
end
