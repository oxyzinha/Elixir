defmodule CadenceBackendWeb.ErrorJSONTest do
  use CadenceBackendWeb.ConnCase, async: true

  test "renders 404" do
    assert CadenceBackendWeb.ErrorJSON.render("404.json", %{}) == %{
             errors: %{detail: "Not Found"}
           }
  end

  test "renders 500" do
    assert CadenceBackendWeb.ErrorJSON.render("500.json", %{}) ==
             %{errors: %{detail: "Internal Server Error"}}
  end
end
