defmodule CadenceBackendWeb.InviteController do
  use CadenceBackendWeb, :controller

  def invite(conn, %{"email" => email}) do
    case CadenceBackend.Mailer.send_invite(email) do
      {:ok, _result} ->
        json(conn, %{message: "Convite enviado com sucesso"})

      {:error, reason} ->
        IO.inspect(reason, label: "Erro ao enviar convite")

        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Erro ao enviar convite: #{inspect(reason)}"})
    end
  end
end
