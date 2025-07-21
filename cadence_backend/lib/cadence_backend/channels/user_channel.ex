defmodule CadenceBackendWeb.UserChannel do
  use Phoenix.Channel

  # Join no canal "user:USER_ID"
  def join("user:" <> _user_id, _params, socket) do
    {:ok, socket}
  end
end
