defmodule CadenceBackendWeb.ConversationController do
  use CadenceBackendWeb, :controller

  # Mock: lista de mensagens
  @mock_messages [
    %{id: 1, from: "agent", text: "Olá, preciso de ajuda com a minha conta."},
    %{id: 2, from: "user", text: "Claro! Como posso ajudar?"},
    %{id: 3, from: "agent", text: "Não consigo redefinir a palavra-passe."}
  ]

  def index(conn, _params) do
    json(conn, @mock_messages)
  end

  def create(conn, %{"text" => text}) do
    # Simula mensagem criada
    msg = %{id: System.system_time(:millisecond), from: "user", text: text}
    json(conn, msg)
  end
end
