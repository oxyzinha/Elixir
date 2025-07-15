defmodule CadenceBackend.Accounts do
  alias CadenceBackend.Firebase

  @doc """
  Busca um usuário pelo ID (Firebase UID) diretamente no Firestore.
  """
  def get_user_by_id(user_id) do
    case Firebase.get_user_by_id(user_id) do
      {:ok, user_data} ->
        map_firestore_user(user_data)

      {:error, :invalid_id} ->
        nil
      {:error, _reason} ->
        nil
    end
  end

  defp map_firestore_user(%{
    "id" => id,
    "name" => name,
    "email" => email,
    "role" => role,
    "avatar_url" => avatar_url,
    "member_since" => member_since
  }) do
    %{
      id: id,
      name: name,
      email: email,
      role: role,
      avatar_url: avatar_url,
      member_since: member_since
    }
  end

  defp map_firestore_user(_), do: nil
end
