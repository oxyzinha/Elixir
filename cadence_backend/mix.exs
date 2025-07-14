defmodule CadenceBackend.MixProject do
  use Mix.Project

  def project do
    [
      app: :cadence_backend,
      version: "0.1.0",
      elixir: "~> 1.18",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps()
    ]
  end

  def application do
    [
      mod: {CadenceBackend.Application, []},
      extra_applications: [
        :logger,
        :runtime_tools,
        :corsica,
        :plug_cowboy,
        :phoenix,
        :phoenix_live_view
        # REMOVIDO: :goth - Não estamos a usar Goth com a sua implementação atual
      ]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      {:phoenix, "~> 1.7.0"},
      {:phoenix_live_view, "~> 0.20"},
      {:phoenix_live_dashboard, "~> 0.8.3"},
      {:phoenix_html, "~> 3.3"},
      {:swoosh, "~> 1.5"},
      {:finch, "~> 0.18"}, # Versão atualizada ou compatível
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_poller, "~> 1.0"},
      {:gettext, "~> 0.26"},
      {:jason, "~> 1.4"},
      {:dns_cluster, "~> 0.1.1"},
      {:bandit, "~> 1.5"},
      {:corsica, "~> 2.0"},
      {:plug_cowboy, "~> 2.5"},
      {:hackney, "~> 1.18"},
      {:ecto, "~> 3.10"},
      {:phoenix_ecto, "~> 4.4"},
      {:phoenix_pubsub, "~> 2.1"},
      {:uuid, "~> 1.1"}
      # REMOVIDO: {:goth, "~> 1.4"} - Não estamos a usar Goth
    ]
  end

  defp aliases do
    [
      test: ["test"]
    ]
  end
end
