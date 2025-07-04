# priv/repo/migrations/20250703143928_create_meetings_table.exs
# O nome do módulo será baseado no timestamp e no nome que você deu à migração

defmodule CadenceBackend.Repo.Migrations.CreateMeetingsTable do
  use Ecto.Migration

  def change do
    # --- ADICIONE ESTE BLOCO AQUI DENTRO DO 'change do ... end' ---
    create table(:meetings) do
      add :name, :string
      add :start_time, :utc_datetime # Confirme se o tipo é o mesmo que no seu schema
      add :end_time, :utc_datetime   # Confirme se o tipo é o mesmo que no seu schema
      add :status, :string, default: "Próxima"
      add :type, :string
      add :owner_id, :string
      add :participants, {:array, :map} # Para armazenar JSON array de objetos/mapas (SQLite vai armazenar como texto)

      timestamps() # Adiciona campos inserted_at e updated_at
    end
    # --- FIM DO BLOCO ADICIONADO ---
  end
end
