# lib/cadence_backend_web/controllers/api_controller.ex
defmodule CadenceBackendWeb.ApiController do
  use CadenceBackendWeb, :controller

  def status(conn, _params) do
    json(conn, %{status: "online", message: "CadenceBackend API is running!"})
  end
end
