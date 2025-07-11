defmodule CadenceBackendWeb.MeetingController do
  use CadenceBackendWeb, :controller

  alias CadenceBackend.Meetings
  alias CadenceBackend.Meetings.Meeting
  require Logger
  require DateTime
  require NaiveDateTime

  # GET /api/meetings
  def index(conn, _params) do
    case Meetings.list_all_meetings() do
      {:ok, meetings} ->
        # DEBUG: Inspeciona a lista de meetings ANTES de mapear para JSON
        IO.inspect(meetings, label: "DEBUG: Meetings recebidas do Meetings.list_all_meetings()")
        meetings_json = Enum.map(meetings, &meeting_to_json_map/1)
        json(conn, %{meetings: meetings_json})
      {:error, reason} ->
        Logger.error("MeetingController", "Falha ao buscar reuniões: #{inspect(reason)}")
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Falha ao buscar reuniões", details: inspect(reason)})
    end
  end

  def create(conn, %{"meeting" => meeting_params}) do
    case Meetings.create_meeting(meeting_params) do
      {:ok, %Meeting{} = meeting} ->
        conn
        |> put_status(:created)
        |> json(%{meeting: meeting_to_json_map(meeting)})
      {:error, reason} ->
        Logger.error("MeetingController", "Falha ao criar reunião: #{inspect(reason)}")
        case reason do
          {:validation_error, errors} ->
            conn |> put_status(:unprocessable_entity) |> json(%{errors: errors})
          _ ->
            conn
            |> put_status(:internal_server_error)
            |> json(%{error: "Falha ao criar reunião", details: inspect(reason)})
        end
    end
  end

  def show(conn, %{"id" => id}) do
    case Meetings.get_meeting(id) do
      {:ok, %Meeting{} = meeting} ->
        json(conn, %{meeting: meeting_to_json_map(meeting)})
      {:error, {:api_error, "Not found", 404, _}} ->
        send_resp(conn, 404, "Não Encontrado")
      {:error, reason} ->
        Logger.error("MeetingController", "Falha ao buscar reunião (ID: #{id}): #{inspect(reason)}")
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Falha ao buscar reunião", details: inspect(reason)})
    end
  end

  def update(conn, %{"id" => id, "meeting" => meeting_params}) do
    case Meetings.get_meeting(id) do
      {:ok, meeting} ->
        case Meetings.update_meeting(meeting, meeting_params) do
          {:ok, %Meeting{} = updated_meeting} ->
            json(conn, %{meeting: meeting_to_json_map(updated_meeting)})
          {:error, reason} ->
            Logger.error("MeetingController", "Falha ao atualizar reunião (ID: #{id}): #{inspect(reason)}")
            case reason do
              {:validation_error, errors} ->
                conn |> put_status(:unprocessable_entity) |> json(%{errors: errors})
              _ ->
                conn
                |> put_status(:internal_server_error)
                |> json(%{error: "Falha ao atualizar reunião", details: inspect(reason)})
            end
        end
      {:error, {:api_error, "Not found", 404, _}} ->
        send_resp(conn, 404, "Não Encontrado")
      {:error, reason} ->
        Logger.error("MeetingController", "Falha ao localizar reunião para atualização (ID: #{id}): #{inspect(reason)}")
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Falha ao localizar reunião para atualização", details: inspect(reason)})
    end
  end

  def delete(conn, %{"id" => id}) do
    case Meetings.get_meeting(id) do
      {:ok, meeting} ->
        case Meetings.delete_meeting(meeting) do
          {:ok, _} ->
            send_resp(conn, 204, "")
          {:error, reason} ->
            Logger.error("MeetingController", "Falha ao deletar reunião (ID: #{id}): #{inspect(reason)}")
            conn
            |> put_status(:internal_server_error)
            |> json(%{error: "Falha ao deletar reunião", details: inspect(reason)})
        end
      {:error, {:api_error, "Not found", 404, _}} ->
        send_resp(conn, 404, "Não Encontrado")
      {:error, reason} ->
        Logger.error("MeetingController", "Falha ao localizar reunião para deleção (ID: #{id}): #{inspect(reason)}")
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Falha ao localizar reunião para deleção", details: inspect(reason)})
    end
  end

  # FUNÇÃO AUXILIAR PARA FORMATAR DATAS COM IO.inspect PARA DEBUGAR
  # Esta função usa múltiplos function clauses para lidar com os tipos de forma explícita.
  # Isso garante que DateTime.to_iso8601/2 só seja chamado com os argumentos corretos.

  defp format_datetime_for_json(%DateTime{} = datetime_struct) do
    IO.inspect(datetime_struct, label: "DEBUG: format_datetime_for_json - DateTime input")
    DateTime.to_iso8601(datetime_struct, :microsecond)
  end

  defp format_datetime_for_json(%NaiveDateTime{} = naive_datetime_struct) do
    IO.inspect(naive_datetime_struct, label: "DEBUG: format_datetime_for_json - NaiveDateTime input")
    # Se for uma NaiveDateTime, primeiro converte para DateTime e depois formata.
    # Assumimos UTC para a conversão de NaiveDateTime para DateTime.
    DateTime.from_naive!(naive_datetime_struct, "Etc/UTC")
    |> DateTime.to_iso8601(:microsecond)
  end

  defp format_datetime_for_json(nil) do
    IO.inspect(nil, label: "DEBUG: format_datetime_for_json - Nil input")
    nil # Lida explicitamente com nil
  end

  defp format_datetime_for_json(other) do
    IO.inspect(other, label: "DEBUG: format_datetime_for_json - Other input (Unexpected Type!)")
    Logger.warning("MeetingController", "format_datetime_for_json recebeu um tipo inesperado: #{inspect(other)}. Retornando nil.")
    nil
  end

  # Converte a struct Meeting para um mapa JSON adequado para a resposta da API.
  # Garante que os campos de data/hora são formatados como strings ISO 8601 usando a função auxiliar.
  defp meeting_to_json_map(%CadenceBackend.Meetings.Meeting{} = meeting) do
    %{
      id: meeting.id,
      name: meeting.name,
      start_time: format_datetime_for_json(meeting.start_time),
      end_time: format_datetime_for_json(meeting.end_time),
      status: meeting.status,
      type: meeting.type,
      owner_id: meeting.owner_id, # CORRIGIDO: owner_id NÃO é uma data, não formatar
      participants: meeting.participants,
      inserted_at: format_datetime_for_json(meeting.inserted_at),
      updated_at: format_datetime_for_json(meeting.updated_at)
    }
  end
end
