# lib/cadence_backend/meetings/meetings.ex

defmodule CadenceBackend.Meetings do
  @moduledoc """
  The Meetings context. Manages meetings data using Ecto for persistence.
  """

  # Alias para o repositório do Ecto e para o módulo do schema Meeting
  alias CadenceBackend.Repo
  alias CadenceBackend.Meetings.Meeting # Aponta para o seu schema em meeting.ex

  # --- Removido TODO o código relacionado ao Agent, incluindo:
  # def start_link(_opts) do ... end
  # defp put_meeting(meeting) do ... end
  # defp get_meeting_from_agent(id) do ... end
  # ---

  @doc """
  Retorna a lista de todas as reuniões do banco de dados.
  """
  def list_all_meetings do
    # AGORA USAMOS ECTO AQUI
    Repo.all(Meeting)
  end

  @doc """
  Retorna uma lista de reuniões filtradas para um usuário específico.
  Isso é feito em memória após buscar todas as reuniões.
  Para grandes volumes de dados, considere usar Ecto.Query.
  """
  def list_meetings_for_user(user_id) do
    list_all_meetings() # Busca todas as reuniões com Ecto
    |> Enum.filter(fn meeting ->
      meeting.owner_id == user_id || Enum.any?(meeting.participants, &(&1["id"] == user_id))
    end)
    |> Enum.sort_by(& &1.start_time, :asc)
  end

  @doc """
  Retorna uma única reunião pelo ID. Levanta Ecto.NoResultsError se não encontrada.
  """
  def get_meeting!(id), do: Repo.get!(Meeting, id) # Usa Ecto

  @doc """
  Retorna uma única reunião pelo ID, ou nil se não encontrada.
  """
  def get_meeting(id), do: Repo.get(Meeting, id) # Usa Ecto

  @doc """
  Cria uma nova reunião no banco de dados.
  """
  def create_meeting(attrs \\ %{}) do
    %Meeting{} # Cria um novo struct do schema Meeting
    |> Meeting.changeset(attrs) # Usa o changeset do schema
    |> Repo.insert() # Insere no banco de dados com Ecto
  end

  @doc """
  Atualiza uma reunião existente no banco de dados.
  """
  def update_meeting(%Meeting{} = meeting, attrs) do
    meeting
    |> Meeting.changeset(attrs)
    |> Repo.update() # Atualiza no banco de dados com Ecto
  end

  @doc """
  Deleta uma reunião do banco de dados.
  """
  def delete_meeting(%Meeting{} = meeting) do
    Repo.delete(meeting) # Deleta do banco de dados com Ecto
  end

  @doc """
  Retorna um changeset para criação/atualização de reuniões.
  """
  def change_meeting(%Meeting{} = meeting, attrs \\ %{}) do
    Meeting.changeset(meeting, attrs)
  end

  @doc """
  Preenche o banco de dados com dados de exemplo.
  """
  def seed_meetings do
    # --- AS LINHAS 'if ... do' e 'end' FORAM REMOVIDAS AQUI PARA DEBUGAR OS SEEDS ---

    IO.puts "Seeding initial meetings (IGNORANDO VERIFICAÇÃO DE VAZIO PARA DEBUG)..."

    create_meeting(%{
      name: "Consulta de Rotina (Dr. André Santos)",
      start_time: ~U[2025-07-02T14:00:00Z],
      end_time: ~U[2025-07-02T14:30:00Z],
      status: "Próxima",
      type: "Médica Geral",
      owner_id: "dr_andre",
      participants: [
        %{"name" => "Dr. André Santos", "id" => "dr_andre"},
        %{"name" => "João Silva", "id" => "user_joao"}
      ]
    })

    create_meeting(%{
      name: "Revisão de Análises (Enf. Carla Mendes)",
      start_time: ~U[2025-07-02T11:40:00Z],
      end_time: ~U[2025-07-02T12:10:00Z],
      status: "Ativa",
      type: "Enfermagem",
      owner_id: "enf_carla",
      participants: [
        %{"name" => "Enf. Carla Mendes", "id" => "enf_carla"},
        %{"name" => "Maria Oliveira", "id" => "user_maria"}
      ]
    })

    create_meeting(%{
      name: "Consulta de Especialidade (Dra. Sofia Lima)",
      start_time: ~U[2025-06-20T09:00:00Z],
      end_time: ~U[2025-06-20T09:45:00Z],
      status: "Concluída",
      type: "Cardiologia",
      owner_id: "dra_sofia",
      participants: [
        %{"name" => "Dra. Sofia Lima", "id" => "dra_sofia"},
        %{"name" => "Carlos Pereira", "id" => "user_carlos"}
      ]
    })

    IO.puts "Meetings seeded successfully (IGNORANDO VERIFICAÇÃO DE VAZIO PARA DEBUG)."

  end # <--- ESTE 'end' AGORA FINALIZA A FUNÇÃO seed_meetings
end
