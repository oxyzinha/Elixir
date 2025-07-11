defmodule CadenceBackend.Meetings do
  @moduledoc """
  Contexto de Reuniões, interage com o Firebase Firestore.
  """

  alias CadenceBackend.Firebase
  alias CadenceBackend.Meetings.Meeting
  require Logger
  require DateTime
  require NaiveDateTime # Adicionado require NaiveDateTime caso seja usado na struct Meeting

  @collection "meetings"

  @doc """
  Retorna a lista de todas as reuniões do Firebase.
  Retorna `{:ok, [%Meeting{}]}` ou `{:error, reason}`.
  """
  def list_all_meetings do
    Logger.info("Meetings", "Tentando listar todas as reuniões do Firestore...")

    # NOVO DEBUG: Inspeciona o resultado exato retornado por Firebase.list_documents
    result_from_firebase = Firebase.list_documents(@collection)
    IO.inspect(result_from_firebase, label: "DEBUG: Retorno bruto de Firebase.list_documents")

    case result_from_firebase do
      {:ok, documents} ->
        # DEBUG: Inspeciona os documentos brutos recebidos do Firebase (após {:ok, ...})
        IO.inspect(documents, label: "DEBUG: Documentos brutos recebidos do Firebase (dentro de {:ok})")

        processed_meetings = Enum.map(documents, fn doc_map ->
          # DEBUG: Inspeciona cada mapa ANTES de criar a struct Meeting
          IO.inspect(doc_map, label: "DEBUG: Mapa individual antes de criar Meeting struct")
          Meeting.new(doc_map)
        end)
        # DEBUG: Inspeciona a lista final de Meeting structs
        IO.inspect(processed_meetings, label: "DEBUG: Lista final de Meeting structs")
        {:ok, processed_meetings}
      error ->
        Logger.error("Meetings", "Falha ao listar documentos do Firestore: #{inspect(error)}")
        error
    end
  end

  @doc """
  Retorna uma lista de reuniões filtradas para um usuário específico.
  A filtragem é feita em Elixir após buscar todos os documentos.
  Para grande volume, considere Firestore queries avançadas para otimização.
  Retorna `{:ok, [%Meeting{}]}` ou `{:error, reason}`.
  """
  def list_meetings_for_user(user_id) do
    case list_all_meetings() do
      {:ok, meetings} ->
        filtered = Enum.filter(meetings, fn meeting ->
          meeting.owner_id == user_id || Enum.any?(meeting.participants, &(&1["id"] == user_id))
        end)
        {:ok, Enum.sort_by(filtered, & &1.start_time, :asc)}
      error ->
        error
    end
  end

  @doc """
  Retorna uma única reunião pelo ID. Retorna `{:ok, meeting}` ou `{:error, reason}`.
  """
  def get_meeting(id) do
    case Firebase.get_document(@collection, id) do
      {:ok, document} ->
        # DEBUG: Inspeciona o documento bruto recebido do Firebase para um único GET
        IO.inspect(document, label: "DEBUG: Documento bruto para get_meeting")
        {:ok, Meeting.new(document)}
      error ->
        error
    end
  end

  @doc """
  Retorna uma única reunião pelo ID. Levanta erro se não encontrada ou outro erro.
  """
  def get_meeting!(id) do
    case get_meeting(id) do
      {:ok, meeting} -> meeting
      {:error, {:api_error, "Not found", 404, _}} -> raise "Reunião com ID #{id} não encontrada."
      {:error, reason} -> raise "Falha ao obter reunião com ID #{id}: #{inspect(reason)}"
    end
  end

  @doc """
  Cria uma nova reunião no Firebase.
  Retorna `{:ok, %Meeting{}}` ou `{:error, reason}`.
  """
  def create_meeting(attrs \\ %{}) do
    # DEBUG: Inspeciona os atributos de entrada para create_meeting
    IO.inspect(attrs, label: "DEBUG: Atributos de entrada para create_meeting")

    # 1. Cria uma nova struct Meeting a partir dos attrs (Meeting.new agora lida com tudo)
    meeting_struct = Meeting.new(attrs)
    IO.inspect(meeting_struct, label: "DEBUG: Meeting struct criada antes de enviar ao Firebase")

    # 2. Opcional: Adicionar validação aqui se necessário, antes de enviar para o Firebase.
    # Ex: case Meeting.validate_attrs(attrs) do ... end
    # Se campos como name, start_time, etc., podem ser nulos e Firebase rejeitar, valide antes.

    # 3. Converte o struct para um mapa para enviar ao Firebase.
    data_to_send = Map.from_struct(meeting_struct) |> Map.delete(:__struct__)
    IO.inspect(data_to_send, label: "DEBUG: Dados a enviar para o Firebase (mapa)")


    # 4. Chamada para o Firebase
    case Firebase.create_document(@collection, data_to_send, meeting_struct.id) do
      {:ok, document_response} ->
        # DEBUG: Inspeciona a resposta do Firebase após criação
        IO.inspect(document_response, label: "DEBUG: Resposta do Firebase após create_document")
        # O Firebase retorna o documento completo. Converte de volta para struct.
        {:ok, Meeting.new(document_response)}
      error ->
        Logger.error("Meetings", "Falha ao criar documento no Firestore: #{inspect(error)}")
        error
    end
  end

  @doc """
  Atualiza uma reunião existente no Firebase.
  `meeting_or_id`: Pode ser uma %Meeting{} struct ou apenas o ID (string).
  `attrs`: Mapa com os campos a serem atualizados.
  Retorna `{:ok, %Meeting{}}` (o documento atualizado) ou `{:error, reason}`.
  """
  def update_meeting(meeting_or_id, attrs) do
    id = if is_struct(meeting_or_id), do: meeting_or_id.id, else: meeting_or_id

    # Garantir que o `updated_at` é definido antes de enviar.
    attrs_with_timestamp = Map.put(attrs, :updated_at, DateTime.utc_now())
    IO.inspect(attrs_with_timestamp, label: "DEBUG: Atributos com timestamp para update_meeting")

    # Se 'attrs' contiver strings de tempo, elas precisarão ser parseadas.
    # Firebase.ex.field_value_to_firestore já lida com DateTime.t structs ou strings.
    # Portanto, podemos enviar diretamente os attrs, assumindo que eles vêm limpos ou que o parse acontece na Firebase.
    # Se quiser validar e parsear aqui, use Meeting.new(attrs_with_timestamp) para obter uma struct temporária
    # e depois Map.from_struct dela.
    case Firebase.update_document(@collection, id, attrs_with_timestamp) do
      {:ok, document_response} ->
        IO.inspect(document_response, label: "DEBUG: Resposta do Firebase após update_document")
        {:ok, Meeting.new(document_response)}
      error ->
        Logger.error("Meetings", "Falha ao atualizar documento no Firestore: #{inspect(error)}")
        error
    end
  end

  @doc """
  Deleta uma reunião do Firebase.
  `meeting_or_id`: Pode ser uma %Meeting{} struct ou apenas o ID (string).
  Retorna `{:ok, :deleted}` ou `{:error, reason}`.
  """
  def delete_meeting(meeting_or_id) do
    id = if is_struct(meeting_or_id), do: meeting_or_id.id, else: meeting_or_id
    IO.inspect(id, label: "DEBUG: ID para deletar reunião")
    Firebase.delete_document(@collection, id)
  end

  @doc """
  Função `change_meeting` não é mais relevante com Firebase.
  A validação deve ser feita antes de chamar `create_meeting` ou `update_meeting`.
  """
  def change_meeting(_meeting, _attrs \\ %{}), do: {:error, "Changeset não é usado com Firebase. Valide os atributos manualmente antes de criar/atualizar."}


  @doc """
  Preenche o Firebase com dados de exemplo.
  """
  def seed_meetings do
    IO.puts "Seeding meetings iniciais (Firebase)..."

    meetings_data = [
      %{
        name: "Consulta de Rotina (Dr. André Santos)",
        start_time: ~U[2025-07-02T14:00:00Z],
        end_time: ~U[2025-07-02T14:30:00Z],
        status: "Próxima",
        type: "Médica Geral",
        owner_id: "dr_andre",
        participants: [
          %{"name" => "Dr. André Santos", "id" => "dr_andre"},
          %{"name" => "João Silva", "id" => "user_joao"}
        ]
      },
      %{
        name: "Revisão de Análises (Enf. Carla Mendes)",
        start_time: ~U[2025-07-02T11:40:00Z],
        end_time: ~U[2025-07-02T12:10:00Z],
        status: "Ativa",
        type: "Enfermagem",
        owner_id: "enf_carla",
        participants: [
          %{"name" => "Enf. Carla Mendes", "id" => "enf_carla"},
          %{"name" => "Maria Oliveira", "id" => "user_maria"}
        ]
      },
      %{
        name: "Consulta de Especialidade (Dra. Sofia Lima)",
        start_time: ~U[2025-06-20T09:00:00Z],
        end_time: ~U[2025-06-20T09:45:00Z],
        status: "Concluída",
        type: "Cardiologia",
        owner_id: "dra_sofia",
        participants: [
          %{"name" => "Dra. Sofia Lima", "id" => "dra_sofia"},
          %{"name" => "Carlos Pereira", "id" => "user_carlos"}
        ]
      }
    ]

    Enum.each(meetings_data, fn data ->
      case create_meeting(data) do
        {:ok, meeting} -> IO.puts "Seeded meeting: #{meeting.name} (ID: #{meeting.id})"
        {:error, reason} -> IO.warn "Falha ao seedar meeting: #{inspect(data)} - #{inspect(reason)}"
      end
    end)

    IO.puts "Meetings seeded com sucesso."
  end
end
