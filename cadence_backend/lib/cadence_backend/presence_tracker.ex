# lib/cadence_backend/presence_tracker.ex
defmodule CadenceBackend.PresenceTracker do
  @moduledoc """
  A Presence tracker for our application.
  It manages "presence" information for users connected via Phoenix Channels.
  This module needs to be started as a child in your application supervisor (`application.ex`).
  """
  use Phoenix.Presence,
    otp_app: :cadence_backend,
    pubsub_server: CadenceBackend.PubSub

  # As funções handle_join/3 e handle_leave/3 são chamadas quando um cliente entra/sai de um canal.
  # Você pode sobrescrevê-las para adicionar meta-dados personalizados para cada usuário.
  # Se não forem definidas, Phoenix.Presence usa um comportamento padrão onde o ID da presença
  # é o `key` do canal.

  # Exemplo de como você poderia personalizar (opcional, remova se não precisar):
  # @impl true
  # def handle_join(key, current_presence, %{user_id: user_id, user_name: user_name}) do
  #   # `key` é o identificador do item de presença (ex: ID da reunião ou do utilizador).
  #   # `current_presence` é o mapa de meta-dados atual para esse `key`.
  #   # O último argumento são os "metadados" passados pelo cliente ao juntar-se ao canal.
  #   # Aqui, estamos a adicionar o user_id e user_name como metadados da presença.
  #   meta = %{user_id: user_id, user_name: user_name, online_at: System.system_time(:millisecond)}
  #   {:ok, meta, current_presence}
  # end

  # @impl true
  # def handle_leave(key, current_presence, _meta) do
  #   # `key` é o identificador do item de presença que está a sair.
  #   # `current_presence` é o mapa de meta-dados atual para esse `key`.
  #   # `_meta` são os metadados do processo que está a sair (geralmente o ID do PubSub PID).
  #   # Se você não precisar de lógica personalizada ao sair, o padrão funciona bem.
  #   {:ok, current_presence}
  # end
end
