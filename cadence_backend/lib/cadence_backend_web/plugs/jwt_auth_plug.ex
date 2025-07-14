defmodule CadenceBackendWeb.JWTAuthPlug do
  @moduledoc """
  Plug para autenticação JWT real usando Guardian.
  Valida o token JWT enviado no header Authorization e atribui o usuário autenticado ao conn.assigns[:current_user].
  """
  import Plug.Conn
  alias CadenceBackend.Guardian

  def init(opts), do: opts

  def call(conn, _opts) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, claims} <- Guardian.decode_and_verify(token),
         {:ok, user} <- resource_from_claims(claims) do
      assign(conn, :current_user, user)
    else
      _ ->
        conn
        |> send_resp(:unauthorized, "Unauthorized")
        |> halt()
    end
  end

  # Função auxiliar para extrair o usuário dos claims
  defp resource_from_claims(%{"sub" => _sub} = claims) do
    # Você pode customizar para buscar do banco, mas para mock:
    user = Map.drop(claims, ["exp", "iat", "aud", "iss", "jti", "nbf"]) # Remove claims padrão
    {:ok, user}
  end
  defp resource_from_claims(_), do: {:error, :invalid_claims}
end
