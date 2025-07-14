defmodule CadenceBackend.Meetings.Meeting do
  @moduledoc """
  Struct para representar uma reunião.
  Gerencia ID e timestamps manualmente, sem Ecto.Schema.
  """
  require Logger

  # ADICIONE ESTA LINHA AQUI!
  @derive {Jason.Encoder, except: [:__struct__]}

  # Define os campos da struct com seus tipos Elixir esperados
  defstruct [
    :id,            # String (UUID)
    :name,          # String
    :start_time,    # DateTime.t
    :end_time,      # DateTime.t
    :status,        # String
    :type,          # String
    :owner_id,      # String
    :participants,  # List de mapas (e.g., [%{"id" => "user1", "name" => "User A"}])
    :inserted_at,   # DateTime.t
    :updated_at     # DateTime.t
  ]

  @doc """
  Cria uma nova struct Meeting a partir de um mapa de atributos.
  Lida com a geração de ID, conversão de datas e valores padrão.
  """
  def new(attrs \\ %{}) do
    # 1. Gerar ID se não fornecido (prioriza a key atom ou string)
    id = Map.get(attrs, :id) || Map.get(attrs, "id") || Ecto.UUID.generate()

    # 2. Parsear e garantir que as datas são structs DateTime.t
    # Prioriza a key atom ou string.
    start_time_attr = Map.get(attrs, :start_time) || Map.get(attrs, "start_time")
    end_time_attr = Map.get(attrs, :end_time) || Map.get(attrs, "end_time")

    start_time = parse_datetime(start_time_attr)
    end_time = parse_datetime(end_time_attr)

    # 3. Gerar/atualizar timestamps
    current_time = DateTime.utc_now()
    inserted_at_attr = Map.get(attrs, :inserted_at) || Map.get(attrs, "inserted_at")
    updated_at_attr = Map.get(attrs, :updated_at) || Map.get(attrs, "updated_at")

    inserted_at = parse_datetime(inserted_at_attr || current_time)
    updated_at = parse_datetime(updated_at_attr || current_time)

    # 4. Garantir que participants é uma lista (mesmo que vazia)
    participants = Map.get(attrs, :participants) || Map.get(attrs, "participants")
    final_participants = if is_list(participants), do: participants, else: []

    %__MODULE__{
      id: id,
      name: Map.get(attrs, :name) || Map.get(attrs, "name"),
      start_time: start_time,
      end_time: end_time,
      status: Map.get(attrs, :status) || Map.get(attrs, "status"),
      type: Map.get(attrs, :type) || Map.get(attrs, "type"),
      owner_id: Map.get(attrs, :owner_id) || Map.get(attrs, "owner_id"),
      participants: final_participants,
      inserted_at: inserted_at,
      updated_at: updated_at
    }
  end

  # Função auxiliar para parsear strings de data/hora para DateTime.t
  defp parse_datetime(nil), do: nil
  defp parse_datetime(%DateTime{} = dt), do: dt # Já é um DateTime.t
  defp parse_datetime(%NaiveDateTime{} = ndt), do: DateTime.from_naive!(ndt, "Etc/UTC") # Converte NaiveDateTime para DateTime.t com fuso UTC
  defp parse_datetime(date_string) when is_binary(date_string) do
    # Tenta parsear como DateTime.t (preferencial, com fuso horário)
    case DateTime.from_iso8601(date_string) do
      {:ok, dt, _offset} -> dt # Captura o offset e o ignora
      {:error, _} ->
        # Se falhar como DateTime.t, tenta como NaiveDateTime.t e converte para DateTime.t UTC
        case NaiveDateTime.from_iso8601(date_string) do
          {:ok, ndt} -> DateTime.from_naive!(ndt, "Etc/UTC")
          {:error, _} ->
            Logger.warning("Meeting", "Falha ao parsear string de data/hora: #{date_string}. Retornando nil.")
            nil
        end
    end
  end
  defp parse_datetime(other), do: other # Passa outros tipos desconhecidos (pode ser um erro, mas para não quebrar)

  # A função validate_attrs foi removida, pois a validação deve ser tratada
  # antes da criação da struct ou na camada de contexto/controller se necessário.
  # Se precisar de validação customizada, crie uma função separada ou use uma biblioteca.
end
