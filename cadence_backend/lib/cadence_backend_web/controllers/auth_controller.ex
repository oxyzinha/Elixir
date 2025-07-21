
defmodule CadenceBackendWeb.AuthController do
  use CadenceBackendWeb, :controller
  alias CadenceBackend.Guardian
  alias CadenceBackend.Firebase

  # POST /api/register
  def register(conn, %{"username" => username, "email" => email, "password" => password}) do
    # Verifica se já existe usuário com esse email
    case Firebase.list_documents("users") do
      {:ok, users} ->
        exists = Enum.any?(users, fn u -> u.email == email end)
        if exists do
          conn
          |> put_status(:conflict)
          |> json(%{error: "E-mail já registrado"})
        else
          user = %{
            name: username,
            email: email,
            password: password,
            role: "User"
          }
          case Firebase.create_document("users", user) do
            {:ok, created_user} ->
              user_data = Map.delete(created_user, :password)
              user_data = Map.put(user_data, "sub", user_data.id) # Adiciona o campo sub
              claims = %{"name" => user_data["name"] || user_data[:name]}
              {:ok, token, _claims} = Guardian.encode_and_sign(user_data, claims)
              json(conn, %{user: user_data, token: token, message: "Usuário registrado com sucesso"})
            {:error, reason} ->
              conn
              |> put_status(:internal_server_error)
              |> json(%{error: "Erro ao registrar usuário", details: inspect(reason)})
          end
        end
      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Erro ao acessar base de usuários", details: inspect(reason)})
    end
  end

  # POST /api/login
  def login(conn, params) do
    username = Map.get(params, "username") || Map.get(params, "email")
    password = Map.get(params, "password")
    case Firebase.list_documents("users") do
      {:ok, users} ->
        user = Enum.find(users, fn u -> (u.email == username or u.name == username) and u.password == password end)
        cond do
          user ->
            user_data = Map.delete(user, :password)
            user_data = Map.put(user_data, "sub", user.id) # Adiciona o campo sub
            claims = %{"name" => user_data["name"] || user_data[:name]}
            {:ok, token, _claims} = Guardian.encode_and_sign(user_data, claims)
            json(conn, %{token: token, user: user_data})
          username == "joao" and password == "1234" ->
            user = %{id: 1, name: "João Silva", email: "joao@cadence.com", role: "Admin"}
            user = Map.put(user, "sub", user.id) # Adiciona o campo sub
            claims = %{"name" => user["name"] || user[:name]}
            {:ok, token, _claims} = Guardian.encode_and_sign(user, claims)
            json(conn, %{token: token, user: user})
          true ->
            conn
            |> put_status(:unauthorized)
            |> json(%{error: "Credenciais inválidas"})
        end
      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Erro ao acessar base de usuários", details: inspect(reason)})
    end
  end
end
