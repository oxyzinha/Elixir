defmodule CadenceBackendWeb.JWTAuthPlug do
  import Plug.Conn
  alias CadenceBackend.Guardian

  def init(opts), do: opts

  def call(conn, _opts) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, claims} <- Guardian.decode_and_verify(token),
         {:ok, user} <- Guardian.resource_from_claims(claims) do
      assign(conn, :current_user, user)
    else
      _ ->
        conn
        |> assign(:current_user, nil)
    end
  end
end
