defmodule CadenceBackend.Firebase do
  @moduledoc """
  Módulo para interagir com a API REST do Google Firestore.
  Configurações:
    :firebase_project_id - ID do seu projeto Firebase
    :firebase_api_key - Chave de API web para acesso público (Firestore)

  Para Firestore, geralmente você usa o REST API para operações CRUD.
  Para Realtime Database, a abordagem é similar, mas os endpoints mudam.
  """

  require Logger
  alias Finch.Build # Adicionei aqui, caso você não tivesse
  alias Jason # Adicionei aqui, caso você não tivesse

  # @project_id precisa ser configurado em config/config.exs ou env.
  @project_id Application.compile_env(:cadence_backend, [:firebase, :project_id], nil)
  @api_key Application.compile_env(:cadence_backend, [:firebase, :api_key], nil)
  @database_type Application.compile_env(:cadence_backend, [:firebase, :database_type], :firestore) # Padrão para firestore

  @firestore_base_url "https://firestore.googleapis.com/v1/projects/#{if @project_id, do: String.trim(@project_id), else: "YOUR_PROJECT_ID_IS_MISSING"}/databases/(default)/documents"

  defp base_url do
    case @database_type do
      :firestore -> @firestore_base_url
      _ -> raise "Tipo de banco de dados não suportado: #{@database_type}"
    end
  end

  # ============================================================================
  # Funções Genéricas para Firestore
  # ============================================================================

  @doc """
  Cria um novo documento em uma coleção.
  `collection`: Nome da coleção (ex: "meetings", "users")
  `data`: Mapa com os campos do documento (ex: %{name: "Meeting A"})
  `id`: Opcional. ID do documento. Se nil, o Firestore gera um ID.
  Retorna `{:ok, document}` se sucesso, `{:error, reason}` caso contrário.
  """
  # Sempre POST para que o Firestore gere o ID.
  def create_document(collection, data, id \\ nil) do # <<-- Corrigido para _id para id (se for usado)
    IO.puts "FIREBASE DEBUG: Entering create_document for collection: #{collection}"
    url = "#{base_url()}/#{collection}"
    url = if id, do: "#{url}?documentId=#{id}&key=#{@api_key}", else: "#{url}?key=#{@api_key}" # Adicionado id na URL se fornecido, e api_key
    method = :post # Sempre POST para criação

    # Convertendo o mapa de dados para o formato de campos do Firestore
    body = Jason.encode!(%{fields: map_to_firestore_fields(data)})

    IO.inspect({method, url, body}, label: "FIREBASE DEBUG: Finch Request for create_document")

    Finch.build(method, url, [{"Content-Type", "application/json"}], body)
    |> Finch.request(CadenceBackend.Finch)
    |> handle_response(:create)
  end


  @doc """
  Lê um documento específico de uma coleção pelo ID.
  `collection`: Nome da coleção.
  `id`: ID do documento.
  Retorna `{:ok, document_map}` se encontrado, `{:error, :not_found}` ou `{:error, reason}`.
  """
  def get_document(collection, id) do
    IO.puts "FIREBASE DEBUG: Entering get_document for collection: #{collection}, id: #{id}"
    url = "#{base_url()}/#{collection}/#{id}?key=#{@api_key}"

    IO.inspect({:get, url}, label: "FIREBASE DEBUG: Finch Request for get_document")

    Finch.build(:get, url)
    |> Finch.request(CadenceBackend.Finch)
    |> handle_response(:get)
  end

  @doc """
  Lê todos os documentos de uma coleção (ou até o limite padrão do Firestore).
  Para uso em produção com muitas entradas, Firestore queries são mais eficientes.
  """
  def list_documents(collection) do
    IO.puts "FIREBASE DEBUG: Entering list_documents for collection: #{collection}"
    url = "#{base_url()}/#{collection}?key=#{@api_key}"

    IO.inspect({:get, url}, label: "FIREBASE DEBUG: Finch Request for list_documents")

    response = Finch.build(:get, url)
    |> Finch.request(CadenceBackend.Finch)

    IO.inspect(response, label: "FIREBASE DEBUG: Raw Finch Response before handle_response")

    handle_response(response, :list)
  end

  @doc """
  Atualiza campos específicos de um documento existente.
  `collection`: Nome da coleção.
  `id`: ID do documento.
  `data`: Mapa com os campos a serem atualizados.
  Retorna `{:ok, document}` se sucesso, `{:error, reason}` caso contrário.
  """
  def update_document(collection, id, data) do
    IO.puts "FIREBASE DEBUG: Entering update_document for collection: #{collection}, id: #{id}"
    update_mask_string = Enum.map(Map.keys(data), &"updateMask.fieldPaths=#{Atom.to_string(&1)}") |> Enum.join("&")
    url = "#{base_url()}/#{collection}/#{id}?#{update_mask_string}&key=#{@api_key}"
    body = Jason.encode!(%{fields: map_to_firestore_fields(data)})

    IO.inspect({:patch, url, body}, label: "FIREBASE DEBUG: Finch Request for update_document")

    Finch.build(:patch, url, [{"Content-Type", "application/json"}], body)
    |> Finch.request(CadenceBackend.Finch)
    |> handle_response(:update)
  end

  @doc """
  Deleta um documento específico de uma coleção.
  `collection`: Nome da coleção.
  `id`: ID do documento.
  Retorna `{:ok, :deleted}` se sucesso, `{:error, reason}` caso contrário.
  """
  def delete_document(collection, id) do
    IO.puts "FIREBASE DEBUG: Entering delete_document for collection: #{collection}, id: #{id}"
    url = "#{base_url()}/#{collection}/#{id}?key=#{@api_key}"

    IO.inspect({:delete, url}, label: "FIREBASE DEBUG: Finch Request for delete_document")

    Finch.build(:delete, url)
    |> Finch.request(CadenceBackend.Finch)
    |> handle_response(:delete)
  end

  # ============================================================================
  # Funções Auxiliares de Formatação e Tratamento de Resposta
  # ============================================================================

  # Converte um mapa Elixir para o formato de campos do Firestore (tipado)
  defp map_to_firestore_fields(map) when is_map(map) do
    Enum.reduce(map, %{}, fn {key, value}, acc ->
      Map.put(acc, Atom.to_string(key), field_value_to_firestore(value))
    end)
  end
  defp map_to_firestore_fields(value) do
    Logger.warning("Firebase", "map_to_firestore_fields recebeu um tipo que não é mapa: #{inspect(value)}. Tentando converter para string.")
    field_value_to_firestore(value)
  end

  # Mapeia tipos Elixir para tipos Firestore (para upload)
  defp field_value_to_firestore(value) do
    cond do
      is_integer(value) -> %{"integerValue" => Integer.to_string(value)}
      is_float(value) -> %{"doubleValue" => value}
      is_boolean(value) -> %{"booleanValue" => value}
      is_nil(value) -> %{"nullValue" => nil}
      (is_struct(value, NaiveDateTime) or is_struct(value, DateTime)) -> %{"timestampValue" => format_datetime(value)}
      is_list(value) -> %{"arrayValue" => %{"values" => Enum.map(value, &field_value_to_firestore/1)}}
      is_map(value) -> %{"mapValue" => %{"fields" => map_to_firestore_fields(value)}}
      is_struct(value) -> %{"mapValue" => %{"fields" => map_to_firestore_fields(Map.from_struct(value) |> Map.delete(:__struct__))}}
      true -> %{"stringValue" => Kernel.to_string(value)}
    end
  end

  # Formata DateTime.t/NaiveDateTime.t para ISO 8601 string
  defp format_datetime(%DateTime{} = dt), do: DateTime.to_iso8601(dt)
  defp format_datetime(%NaiveDateTime{} = ndt), do: NaiveDateTime.to_iso8601(ndt)
  defp format_datetime(nil), do: nil
  defp format_datetime(other) do
      Logger.warning("Firebase", "format_datetime recebeu um tipo inesperado para formatação: #{inspect(other)}. Retornando nil.")
      nil
  end


  # Trata a resposta HTTP do Finch
  defp handle_response({:ok, %{status: status, body: response_body}}, operation) when status >= 200 and status < 300 do
    IO.puts "FIREBASE DEBUG: Entering handle_response (Success path)"
    IO.inspect({status, response_body}, label: "FIREBASE DEBUG: Finch Success Response (Status 2xx)")

    if operation == :delete do
      {:ok, :deleted}
    else
      # Tenta decodificar JSON
      case Jason.decode(response_body) do
        {:ok, decoded_response} ->
          IO.inspect(decoded_response, label: "FIREBASE DEBUG: Decoded JSON Response")
          if operation == :list do
            {:ok, decode_list_response(decoded_response)}
          else
            {:ok, firestore_fields_to_map(decoded_response)} # <<-- CHAMADA PARA FUNÇÃO AGORA PÚBLICA
          end
        {:error, reason} ->
          Logger.error("Firebase_JSON_Decode", "Falha ao decodificar JSON para #{operation}: #{inspect(reason)}. Corpo: #{response_body}")
          {:error, {:json_decode_error, reason, response_body}}
      end
    end
  end

  # Tratamento de erros HTTP mais robusto, com inspect(error_body)
  defp handle_response({:ok, %{status: status, body: error_body}}, _operation) do
    IO.puts "FIREBASE DEBUG: Entering handle_response (Error status path)"
    IO.inspect({status, error_body}, label: "FIREBASE DEBUG: Finch Error Response (Status >= 300)")

    # Tenta decodificar o corpo como JSON primeiro
    case Jason.decode(error_body) do
      {:ok, %{"error" => %{"message" => msg, "details" => details}}} ->
        Logger.error("Firebase_API_Error", "Erro de API (Status #{status}): #{msg}. Detalhes: #{inspect(details)}")
        {:error, {:api_error, msg, status, details}}
      {:ok, %{"error" => %{"message" => msg}}} ->
        Logger.error("Firebase_API_Error", "Erro de API (Status #{status}): #{msg}.")
        {:error, {:api_error, msg, status}}
      # Se não for JSON de erro do Firebase, ou se falhar a decodificação JSON, tratar como erro HTTP genérico
      _ ->
        Logger.error("Firebase_HTTP_Error", "Erro HTTP inesperado (Status #{status}). Corpo da resposta: #{inspect(error_body)}")
        {:error, {:http_error, status, error_body}}
    end
  end

  defp handle_response({:error, reason}, _operation) do
    IO.puts "FIREBASE DEBUG: Entering handle_response (Finch error path)"
    IO.inspect(reason, label: "FIREBASE DEBUG: Finch Request Failure Reason")
    Logger.error("Firebase_Finch_Error", "Requisição Finch falhou: #{inspect(reason)}")
    {:error, reason}
  end

  @doc """
  Converte o formato de 'fields' do Firestore de volta para um mapa Elixir (para download).
  Esta função é pública porque Meetings.ex precisa dela.
  """
  def firestore_fields_to_map(%{"fields" => fields, "name" => name, "createTime" => create_time, "updateTime" => update_time}) do
    id = name |> String.split("/") |> List.last()
    data_map = Enum.reduce(fields, %{}, fn {key, value}, acc ->
      Map.put(acc, String.to_atom(key), firestore_value_to_elixir(value))
    end)
    Map.merge(data_map, %{
      id: id,
      inserted_at: parse_datetime_from_iso8601(create_time),
      updated_at: parse_datetime_from_iso8601(update_time)
    })
  end
  # Sobrecarga para lidar com casos em que o input não é o formato completo de documento do Firestore
  def firestore_fields_to_map(other) do
    IO.inspect(other, label: "FIREBASE DEBUG: firestore_fields_to_map received unexpected input")
    if is_map(other) do
      # Trata o caso em que a resposta não é um documento completo com 'fields', mas um mapa direto (e.g., de uma sub-coleção)
      Enum.reduce(other, %{}, fn {key, value}, acc ->
        Map.put(acc, String.to_atom(key), firestore_value_to_elixir(value))
      end)
    else
      Logger.warning("Firebase_Decode", "firestore_fields_to_map recebeu um tipo inesperado: #{inspect(other)}. Retornando como está.")
      other
    end
  end

  # Função auxiliar para parsear timestamp do Firestore (ISO 8601 para DateTime.t)
  defp parse_datetime_from_iso8601(iso_string) do
    IO.inspect(iso_string, label: "FIREBASE DEBUG: parse_datetime_from_iso8601 input")
    case DateTime.from_iso8601(iso_string) do
      {:ok, dt, _offset} -> dt
      {:error, _} ->
        case NaiveDateTime.from_iso8601(iso_string) do
          {:ok, ndt} -> DateTime.from_naive!(ndt, "Etc/UTC")
          {:error, _} ->
            Logger.warning("Firebase_Parse", "Falha ao parsear timestamp do Firestore: #{iso_string}. Retornando nil.")
            nil
        end
    end
  end

  # Converte os valores tipados do Firestore para valores Elixir (para download)
  defp firestore_value_to_elixir(%{"stringValue" => val}), do: val
  defp firestore_value_to_elixir(%{"integerValue" => val}), do: String.to_integer(val)
  defp firestore_value_to_elixir(%{"doubleValue" => val}), do: val
  defp firestore_value_to_elixir(%{"booleanValue" => val}), do: val
  defp firestore_value_to_elixir(%{"nullValue" => _}), do: nil
  defp firestore_value_to_elixir(%{"timestampValue" => val}), do: parse_datetime_from_iso8601(val)
  # Lida com arrayValue que pode ter um mapa vazio de 'values' ou 'values' como lista
  defp firestore_value_to_elixir(%{"arrayValue" => %{"values" => values}}) when is_list(values), do: Enum.map(values, &firestore_value_to_elixir/1)
  # Lida com arrayValue que pode vir sem a chave 'values' ou com 'values' não sendo uma lista (ex: %{})
  defp firestore_value_to_elixir(%{"arrayValue" => _other}), do: []

  defp firestore_value_to_elixir(%{"mapValue" => %{"fields" => fields}}), do: firestore_fields_to_map(%{"fields" => fields})
  defp firestore_value_to_elixir(other) do
    IO.inspect(other, label: "FIREBASE DEBUG: firestore_value_to_elixir received unhandled type")
    Logger.warning("Firebase_Decode", "firestore_value_to_elixir recebeu um tipo não tratado: #{inspect(other)}. Retornando como está.")
    other
  end

  # Decodifica a resposta da lista de documentos (vários documentos)
  defp decode_list_response(%{"documents" => documents}) when is_list(documents) do
    IO.inspect(documents, label: "FIREBASE DEBUG: decode_list_response - raw documents list")
    # Chama a função pública firestore_fields_to_map/1
    Enum.map(documents, &firestore_fields_to_map/1)
  end
  defp decode_list_response(other) do
    IO.inspect(other, label: "FIREBASE DEBUG: decode_list_response - unexpected input, returning empty list")
    []
  end
end
