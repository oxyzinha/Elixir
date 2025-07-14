defmodule CadenceBackend.Meetings do
  @moduledoc """
  Contexto de Reuniões, interage com o Firebase Firestore.
  """

  # ALTERADO: Agora usa o seu módulo CadenceBackend.Firebase
  alias CadenceBackend.Firebase
  alias CadenceBackend.Meetings.Meeting
  require Logger
  require DateTime
  require NaiveDateTime

  @firestore_collection "meetings" # Renomeei para ser mais específico

  @doc """
  Lista todas as reuniões do Firestore.
  Retorna `{:ok, [%Meeting{}]}` ou `{:error, reason}`.
  """
  def list_all_meetings do
    Logger.info("Tentando listar todas as reuniões do Firestore...")

    # AQUI ESTÁ A MUDANÇA MAIS IMPORTANTE:
    # Firebase.list_documents já retorna a lista de documentos desestruturada (já com firestore_fields_to_map aplicado)
    case Firebase.list_documents(@firestore_collection) do
      {:ok, documents_list_from_firebase} when is_list(documents_list_from_firebase) ->
        Logger.debug("Número de documentos recebidos do Firestore: #{length(documents_list_from_firebase)}")

        meetings =
          documents_list_from_firebase # Use a lista diretamente, ela já contém os mapas "achatados"
          |> Enum.flat_map(fn doc_map ->
            Logger.debug("Processando documento: #{inspect(doc_map, limit: :infinity)}")

            # doc_map já é o resultado de Firebase.firestore_fields_to_map/1
            # Não precisamos mais de parse_firestore_document(doc_map)
            case Meeting.new(doc_map) do # AQUI mudamos para usar doc_map diretamente
              %Meeting{} = meeting ->
                [meeting] # Retorna uma lista com a meeting se sucesso
              invalid ->
                Logger.warning("Falha ao criar struct Meeting para documento: #{inspect(invalid)}", raw_doc: doc_map)
                [] # Retorna uma lista vazia se falha
            end
          end)

        Logger.debug("Total de reuniões processadas com sucesso: #{length(meetings)}")
        {:ok, meetings}

      {:ok, []} ->
        Logger.info("Nenhuma reunião encontrada no Firestore.")
        {:ok, []}

      # Se por algum motivo Firebase.list_documents retornar {:ok, algo_que_nao_e_lista}
      {:ok, unexpected_data} ->
        error_msg = "Firebase.list_documents retornou um formato inesperado: #{inspect(unexpected_data)}"
        Logger.error(error_msg)
        {:error, {:unexpected_data_from_firebase, error_msg}}

      # Tratamento de erro geral de Firebase.list_documents
      {:error, reason} ->
        Logger.error("Falha ao listar documentos do Firestore: #{inspect(reason)}")
        {:error, reason}

      unexpected -> # Catch-all para outros resultados inesperados
        error_msg = "Resposta inesperada do Firebase.list_documents: #{inspect(unexpected)}"
        Logger.error(error_msg)
        {:error, {:unexpected_response, error_msg}}
    end
  end

  @doc """
  Retorna uma lista de reuniões filtradas para um usuário específico.
  """
  def list_meetings_for_user(user_id) do
    case list_all_meetings() do
      {:ok, meetings} ->
        filtered = meetings
        |> Enum.filter(fn meeting ->
          meeting.owner_id == user_id ||
          Enum.any?(meeting.participants || [], &(&1["id"] == user_id))
        end)
        |> Enum.sort_by(& &1.start_time, :asc) # Certifica que start_time é comparável (DateTime.t)

        {:ok, filtered}

      error ->
        error
    end
  end

  @doc """
  Retorna uma única reunião pelo ID. Retorna `{:ok, meeting}` ou `{:error, reason}`.
  """
  def get_meeting(id) do
    Logger.debug("Buscando reunião com ID: #{id}")

    # ALTERADO: Chama Firebase.get_document
    case Firebase.get_document(@firestore_collection, id) do
      {:ok, document_map} when is_map(document_map) ->
        Logger.debug("Documento encontrado no Firestore: #{inspect(document_map, limit: :infinity)}")
        # O Firebase.get_document já retorna um mapa "achatado", então Meeting.new pode usar diretamente
        {:ok, Meeting.new(document_map)}

      {:error, {:api_error, "Not found", 404, _}} = not_found ->
        Logger.debug("Reunião não encontrada (ID: #{id})")
        not_found

      # ALTERADO: Erro de Firebase.get_document agora
      {:error, reason} ->
        Logger.error("Falha ao buscar reunião (ID: #{id}): #{inspect(reason)}")
        {:error, reason}

      unexpected ->
        error_msg = "Resposta inesperada do Firebase.get_document: #{inspect(unexpected)}"
        Logger.error(error_msg)
        {:error, {:unexpected_response, error_msg}}
    end
  end

  @doc """
  Retorna uma única reunião pelo ID. Levanta erro se não encontrada ou outro erro.
  """
  def get_meeting!(id) do
    case get_meeting(id) do
      {:ok, meeting} ->
        meeting
      {:error, {:api_error, "Not found", 404, _}} ->
        raise "Reunião com ID #{id} não encontrada."
      {:error, reason} ->
        raise "Falha ao obter reunião com ID #{id}: #{inspect(reason)}"
    end
  end

  @doc """
  Cria uma nova reunião no Firebase.
  """
  def create_meeting(attrs \\ %{}) do
    Logger.debug("Criando nova reunião com atributos: #{inspect(attrs)}")

    meeting_struct = Meeting.new(attrs)
    # Firebase.create_document espera um mapa Elixir normal, ele lida com a serialização para "fields"
    data_to_send = Map.from_struct(meeting_struct)
                   |> Map.drop([:__struct__, :id, :inserted_at, :updated_at]) # Remove meta-campos

    Logger.debug("Dados preparados para envio ao Firestore: #{inspect(data_to_send, limit: :infinity)}")

    # ALTERADO: Chama Firebase.create_document
    case Firebase.create_document(@firestore_collection, data_to_send, meeting_struct.id) do
      {:ok, document_map} ->
        Logger.debug("Reunião criada com sucesso no Firestore. Resposta: #{inspect(document_map, limit: :infinity)}")
        # Firebase.create_document já retorna um mapa "achatado"
        {:ok, Meeting.new(document_map)}

      # ALTERADO: Erro de Firebase.create_document agora
      {:error, {:api_error, message, status, details}} ->
        error_msg = "Erro ao criar reunião (HTTP #{status}): #{message}. Detalhes: #{inspect(details)}"
        Logger.error(error_msg)
        {:error, {:api_error, error_msg}}

      {:error, reason} ->
        Logger.error("Falha ao criar documento no Firestore: #{inspect(reason)}")
        {:error, reason}
    end
  end

  @doc """
  Atualiza uma reunião existente no Firebase.
  """
  def update_meeting(meeting_or_id, attrs) do
    id = if is_struct(meeting_or_id), do: meeting_or_id.id, else: meeting_or_id
    Logger.debug("Atualizando reunião #{id} com atributos: #{inspect(attrs)}")

    attrs_with_timestamp = Map.put(attrs, :updated_at, DateTime.utc_now())
    # Firebase.update_document espera um mapa Elixir normal, ele lida com a serialização para "fields"
    data_to_send = Map.drop(attrs_with_timestamp, [:id, :inserted_at]) # Remove meta-campos que não devem ser atualizados via PATCH

    Logger.debug("Dados de atualização preparados para envio ao Firestore: #{inspect(data_to_send, limit: :infinity)}")

    # ALTERADO: Chama Firebase.update_document
    case Firebase.update_document(@firestore_collection, id, data_to_send) do
      {:ok, document_map} ->
        Logger.debug("Reunião atualizada com sucesso. Resposta: #{inspect(document_map, limit: :infinity)}")
        # Firebase.update_document já retorna um mapa "achatado"
        {:ok, Meeting.new(document_map)}

      # ALTERADO: Erro de Firebase.update_document agora
      {:error, {:api_error, message, status, details}} ->
        error_msg = "Erro ao atualizar reunião (HTTP #{status}): #{message}. Detalhes: #{inspect(details)}"
        Logger.error(error_msg)
        {:error, {:api_error, error_msg}}

      {:error, reason} ->
        Logger.error("Falha ao atualizar documento no Firestore: #{inspect(reason)}")
        {:error, reason}
    end
  end

  @doc """
  Deleta uma reunião do Firebase.
  """
  def delete_meeting(meeting_or_id) do
    id = if is_struct(meeting_or_id), do: meeting_or_id.id, else: meeting_or_id
    Logger.debug("Deletando reunião com ID: #{id}")

    # ALTERADO: Chama Firebase.delete_document
    case Firebase.delete_document(@firestore_collection, id) do
      {:ok, _} ->
        Logger.debug("Reunião deletada com sucesso (ID: #{id})")
        {:ok, :deleted}

      # ALTERADO: Erro de Firebase.delete_document agora
      {:error, {:api_error, message, status, details}} ->
        error_msg = "Erro ao deletar reunião (HTTP #{status}): #{message}. Detalhes: #{inspect(details)}"
        Logger.error(error_msg)
        {:error, {:api_error, error_msg}}

      {:error, reason} ->
        Logger.error("Falha ao deletar documento no Firestore: #{inspect(reason)}")
        {:error, reason}
    end
  end

  @doc """
  Função `change_meeting` não é mais relevante com Firebase.
  """
  def change_meeting(_meeting, _attrs \\ %{}), do: {:error, "Changeset não é usado com Firebase."}

  @doc """
  Preenche o Firestore com dados de exemplo.
  """
  def seed_meetings do
    Logger.info("Iniciando seed de meetings...")

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
        name: "Reunião de Equipa (Projeto Alpha)",
        start_time: ~U[2025-07-03T10:00:00Z],
        end_time: ~U[2025-07-03T11:00:00Z],
        status: "Agendada",
        type: "Trabalho",
        owner_id: "user_maria",
        participants: [
          %{"name" => "Maria Clara", "id" => "user_maria"},
          %{"name" => "Pedro Afonso", "id" => "user_pedro"}
        ]
      },
      %{
        name: "Sessão de Coaching (Ana Sousa)",
        start_time: ~U[2025-07-04T16:00:00Z],
        end_time: ~U[2025-07-04T17:00:00Z],
        status: "Concluída",
        type: "Pessoal",
        owner_id: "user_ana",
        participants: [
          %{"name" => "Ana Sousa", "id" => "user_ana"},
          %{"name" => "Tiago Costa", "id" => "coach_tiago"}
        ]
      }
    ]

    Enum.each(meetings_data, fn data ->
      case create_meeting(data) do
        {:ok, meeting} ->
          Logger.info("Meeting criada com sucesso: #{meeting.name} (ID: #{meeting.id})")
        {:error, reason} ->
          Logger.warning("Falha ao criar meeting: #{inspect(data)}", reason: reason)
      end
    end)

    Logger.info("Seed de meetings concluído.")
  end

  # --- FUNÇÕES AUXILIARES ---
  # REMOVIDO: parse_firestore_document/1 não é mais necessária aqui,
  # pois o Firebase.list_documents já retorna os documentos "achatados".
  # defp parse_firestore_document(firestore_doc) do
  #   Firebase.firestore_fields_to_map(firestore_doc)
  # end

end
