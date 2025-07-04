defmodule CadenceBackend.Application do
  # Não gerar documentação para este módulo.
  @moduledoc false

  # Usa a macro Application para definir um supervisor OTP
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Inicie o endpoint web do Phoenix. Esta é a entrada para o seu servidor HTTP.
      CadenceBackendWeb.Endpoint,

      # Inicie o PubSub do Phoenix (se estiver a usar para tempo real/websockets).
      {Phoenix.PubSub, name: CadenceBackend.PubSub},

      # Inicie o seu repositório Ecto para gestão da base de dados.
      CadenceBackend.Repo, # <--- UNCOMMENT THIS LINE!

      # O seu módulo Meetings, se ele for um processo Agent que precisa de iniciar com a app.
      # Se ele for um Agent, certifique-se que start_link/0 ou start_link/1 está definido lá.
      # Se tiver um supervisor para o contexto Meetings (recomendado para Apps maiores):
      # CadenceBackend.Meetings.Supervisor,
      # Se Meetings for diretamente o Agent:

    ]

    # Opções do supervisor: :one_for_one significa que se um processo falhar, só ele é reiniciado.
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
