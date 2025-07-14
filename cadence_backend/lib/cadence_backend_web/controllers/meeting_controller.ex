defmodule CadenceBackendWeb.MeetingController do
  use CadenceBackendWeb, :controller

  alias CadenceBackend.Meetings
  alias CadenceBackend.Meetings.Meeting
  require Logger
  # Não precisa mais de require DateTime e NaiveDateTime aqui, se Jason lidar com isso
  # require DateTime # << Pode remover
  # require NaiveDateTime # << Pode remover

  # GET /api/meetings
  def index(conn, _params) do
    case Meetings.list_all_meetings() do
      {:ok, meetings} ->
        # DEBUG: Inspeciona a lista de meetings ANTES de mapear para JSON
        IO.inspect(meetings, label: "DEBUG: Meetings recebidas do Meetings.list_all_meetings()")
        # AQUI A ALTERAÇÃO CRÍTICA:
        # Não precisamos mais de `Enum.map(meetings, &meeting_to_json_map/1)`
        # se o Jason já sabe como serializar a struct Meeting (implica um Jason.Encoder para Meeting)
        # OU se a struct Meeting contém apenas tipos que Jason já sabe serializar
        # (como strings, números, booleans, listas, mapas e DateTime.t)
        json(conn, %{meetings: meetings}) # <<< Tentar enviar as structs diretamente!
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
        |> json(%{meeting: meeting}) # <<< Tentar enviar a struct diretamente!
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
        json(conn, %{meeting: meeting}) # <<< Tentar enviar a struct diretamente!
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
            json(conn, %{meeting: updated_meeting}) # <<< Tentar enviar a struct diretamente!
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

  # REMOVER COMPLETAMENTE esta função, pois `@derive Jason.Encoder` no Meeting.ex
  # torna-a desnecessária. Não faz sentido mantê-la se não for usada e não tem
  # uma lógica de transformação específica que Jason não faça.
  # defp meeting_to_json_map(%CadenceBackend.Meetings.Meeting{} = meeting) do
  #   Map.from_struct(meeting)
  #   |> Map.drop([:__struct__])
  # end

end
