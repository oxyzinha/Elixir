defmodule CadenceBackendWeb.FallbackController do
  use CadenceBackendWeb, :controller

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(json: CadenceBackendWeb.ErrorView)
    |> render(:"404")
  end

  def call(conn, {:error, :unauthorized}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(json: CadenceBackendWeb.ErrorView)
    |> render(:"401")
  end

  def call(conn, {:error, :forbidden}) do
    conn
    |> put_status(:forbidden)
    |> put_view(json: CadenceBackendWeb.ErrorView)
    |> render(:"403")
  end

  def call(conn, {:error, reason}) do
    conn
    |> put_status(:bad_request)
    |> put_view(json: CadenceBackendWeb.ChangesetView)
    |> render("error.json", reason: reason)
  end
end
