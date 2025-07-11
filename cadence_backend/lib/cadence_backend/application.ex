defmodule CadenceBackend.Application do
  # Não gerar documentação para este módulo.
  @moduledoc false

  # Usa a macro Application para definir um supervisor OTP
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Inicie o Telemetry supervisor para métricas e eventos da aplicação.
      # Essencial para ferramentas como o LiveDashboard.
      CadenceBackendWeb.Telemetry,

      # Inicie o PubSub do Phoenix, necessário para tempo real (Channels/WebSockets).
      {Phoenix.PubSub, name: CadenceBackend.PubSub},

      # Inicie o endpoint web do Phoenix. Esta é a entrada para o seu servidor HTTP e WebSockets.
      CadenceBackendWeb.Endpoint,

      # CORRIGIDO: Mover :conn_timeout para dentro de :conn_opts
      {Finch, name: CadenceBackend.Finch, pools: %{default: [conn_opts: [timeout: 30_000]]}}, # <--- CORREÇÃO AQUI!

      # Inicie o rastreador de Presença do Phoenix.
      # Ele usa o PubSub para gerenciar o estado online/offline dos usuários em canais.
      CadenceBackend.PresenceTracker
    ]

    # Opções do supervisor: :one_for_one significa que se um processo falhar, só ele é reiniciado.
    # Veja https://hexdocs.pm/elixir/Application.html para outras estratégias e opções suportadas
    opts = [strategy: :one_for_one, name: CadenceBackend.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Função chamada pelo Phoenix quando a configuração do endpoint é alterada (ex: em tempo de execução).
  @impl true
  def config_change(changed, _new, removed) do
    CadenceBackendWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
