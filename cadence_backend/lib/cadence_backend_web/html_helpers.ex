defmodule CadenceBackendWeb.HTMLHelpers do
  @moduledoc """
  Funções auxiliares para geração de HTML.
  """

  # Esta função será usada via `unquote(...)` em outros lugares.
  def html_helpers do
    quote do
      # Funções auxiliares definidas neste módulo
      import CadenceBackendWeb.HTMLHelpers

      # Se quiser importar também helpers de HTML do Phoenix:
      import Phoenix.HTML
    end
  end

  # Exemplo de helper que cria um link
  def link_to(text, path) do
    "<a href=\"#{path}\">#{text}</a>"
  end

  # Exemplo de botão simples
  def button_tag(text) do
    "<button>#{text}</button>"
  end
end
