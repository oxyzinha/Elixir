defmodule CadenceBackendWeb.NotificationController do
  use CadenceBackendWeb, :controller
  alias CadenceBackend.Firebase

  def index(conn, _params) do
    user_id = conn.assigns[:current_user]["sub"] || conn.assigns[:current_user][:id]
    case Firebase.list_documents("notifications") do
      {:ok, notifications} when is_list(notifications) ->
        filtered = Enum.filter(notifications, fn n ->
          n["user_id"] == user_id or n[:user_id] == user_id
        end)
        json(conn, %{notifications: filtered})
      {:ok, _} ->
        json(conn, %{notifications: []})
      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Erro ao buscar notificações", details: inspect(reason)})
    end
  end

  def create(conn, params) do
    # Espera receber no body: user_id, type, user, description, context, timestamp, read
    case Firebase.create_document("notifications", params) do
      {:ok, notification} ->
        # Broadcast para o canal do usuário
        user_id = notification["user_id"] || notification[:user_id]
        CadenceBackendWeb.Endpoint.broadcast("user:#{user_id}", "new_notification", %{notification: notification})

        json(conn, %{notification: notification})
      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Erro ao criar notificação", details: inspect(reason)})
    end
  end
end
