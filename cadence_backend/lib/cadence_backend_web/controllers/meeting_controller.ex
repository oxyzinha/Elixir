# lib/cadence_backend_web/controllers/meeting_controller.ex

defmodule CadenceBackendWeb.MeetingController do
  use CadenceBackendWeb, :controller

  alias CadenceBackend.Meetings

  action_fallback CadenceBackendWeb.FallbackController

  def index(conn, _params) do
    meetings = Meetings.list_all_meetings()
    json(conn, %{meetings: meetings})
  end

  def create(conn, %{"meeting" => meeting_params}) do
    owner_id = conn.assigns.current_user.id

    case Meetings.create_meeting(Map.put(meeting_params, "owner_id", owner_id)) do
      {:ok, meeting} ->
        conn
        |> put_status(:created)
        # CORREÇÃO AQUI: Trocar ~p por uma string interpolada simples
        |> put_resp_header("location", "/api/meetings/#{meeting.id}") # <--- ALTERADO AQUI
        |> json(%{message: "Reunião criada com sucesso!", meeting: meeting})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Erro de validação", errors: changeset.errors})
    end
  end

  def show(conn, %{"id" => id}) do
    if meeting = Meetings.get_meeting(id) do
      json(conn, %{meeting: meeting})
    else
      {:error, :not_found}
    end
  end
end
