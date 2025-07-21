defmodule CadenceBackend.Guardian do
  use Guardian, otp_app: :cadence_backend

  # Callback para identificar o resource (usuário) a partir do token
  def subject_for_token(user, _claims) do
    # Aqui você pode usar o id do usuário
    sub = to_string(user.id)
    {:ok, sub}
  end

  # Callback para recuperar o resource (usuário) a partir do subject do token
  def resource_from_claims(%{"sub" => id}) do
    user = CadenceBackend.Accounts.get_user_by_id(id)
    {:ok, user}
  end
end
