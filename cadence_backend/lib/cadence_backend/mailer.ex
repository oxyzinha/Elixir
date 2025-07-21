defmodule CadenceBackend.Mailer do
  use Swoosh.Mailer, otp_app: :cadence_backend

  import Swoosh.Email

  def send_invite(email) do
    new()
    |> to(email)
    |> from({"Cadence", "no-reply@cadence.com"})
    |> subject("Você foi convidado para o Cadence!")
    |> text_body("Olá! Você foi convidado para participar do Cadence. Clique no link para se cadastrar.")
    |> deliver()
  end
end
