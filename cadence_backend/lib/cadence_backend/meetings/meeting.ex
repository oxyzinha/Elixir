# lib/cadence_backend/meetings/meeting.ex

defmodule CadenceBackend.Meetings.Meeting do
  use Ecto.Schema
  import Ecto.Changeset

  # --- CORREÇÃO AQUI: ESPECIFICAR OS CAMPOS PARA O JASON.ENCODER ---
  # Liste explicitamente os campos que você quer incluir no JSON.
  # Inclua todos os campos do seu schema, incluindo id, inserted_at e updated_at (dos timestamps).
  @derive {Jason.Encoder, only: [
    :id, :name, :start_time, :end_time, :status, :type,
    :owner_id, :participants, :inserted_at, :updated_at
  ]}
  # --- FIM DA CORREÇÃO ---

  schema "meetings" do
    field(:name, :string)
    field(:start_time, :utc_datetime)
    field(:end_time, :utc_datetime)
    field(:status, :string, default: "Próxima")
    field(:type, :string)
    field(:owner_id, :string)
    field(:participants, {:array, :map}, default: [])

    timestamps() # Isso cria os campos :inserted_at e :updated_at
  end

  @doc false
  def changeset(meeting, attrs) do
    meeting
    # O campo :id não deve ser passado para cast em um changeset de criação/atualização,
    # pois ele é gerado automaticamente pelo banco de dados ou em outro lugar.
    # Removido :id da lista de cast, mantendo apenas os campos que podem ser modificados/inseridos.
    |> cast(attrs, [:name, :start_time, :end_time, :status, :type, :owner_id, :participants])
    |> validate_required([:name, :start_time, :end_time, :status, :type, :owner_id])
    # Pode adicionar validação para o formato de participantes, se necessário
  end
end
