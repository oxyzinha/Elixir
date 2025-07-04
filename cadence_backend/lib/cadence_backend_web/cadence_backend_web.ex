defmodule CadenceBackendWeb do
  @moduledoc """
  A web interface and controllers for CadenceBackend.
  """

  def static_paths, do: ~w(assets fonts images favicon.ico robots.txt)

  def controller do
    quote do
      use Phoenix.Controller, namespace: CadenceBackendWeb

      import Plug.Conn
      import CadenceBackendWeb.Gettext
      alias CadenceBackendWeb.Router.Helpers, as: Routes

      import CadenceBackendWeb.HTMLHelpers
    end
  end

  def view do
    quote do
      use Phoenix.View,
        root: "lib/cadence_backend_web/templates",
        namespace: CadenceBackendWeb

      import Phoenix.Controller,
        only: [get_flash: 1, get_flash: 2, view_module: 1, view_template: 1]

      import CadenceBackendWeb.ErrorHelpers
      import CadenceBackendWeb.Gettext
      alias CadenceBackendWeb.Router.Helpers, as: Routes

      unquote(CadenceBackendWeb.HTMLHelpers.html_helpers())
    end
  end

  def live_view do
    quote do
      use Phoenix.LiveView,
        layout: {CadenceBackendWeb.LayoutView, "live.html"}

      import Phoenix.LiveView.Router
      import CadenceBackendWeb.ErrorHelpers
      import CadenceBackendWeb.Gettext
      alias CadenceBackendWeb.Router.Helpers, as: Routes

      unquote(CadenceBackendWeb.HTMLHelpers.html_helpers())
    end
  end

  def live_component do
    quote do
      use Phoenix.LiveComponent

      import CadenceBackendWeb.ErrorHelpers
      import CadenceBackendWeb.Gettext
      alias CadenceBackendWeb.Router.Helpers, as: Routes

      unquote(CadenceBackendWeb.HTMLHelpers.html_helpers())
    end
  end

  def router do
    quote do
      use Phoenix.Router, helpers: false

      # Import common connection and controller functions to use in pipelines
      import Phoenix.Controller
      import Phoenix.LiveView.Router
      import Plug.Conn
    end
  end

  def channel do
    quote do
      use Phoenix.Channel
      import CadenceBackendWeb.Gettext
    end
  end

  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
