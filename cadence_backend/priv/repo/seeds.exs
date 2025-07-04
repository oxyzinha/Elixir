# priv/repo/seeds.exs

# Por padrão, este script é executado quando você faz 'mix ecto.setup' ou 'mix run priv/repo/seeds.exs'
# Ele é usado para popular o banco de dados com dados iniciais ou de exemplo.

IO.puts "Running database seeds..."

# Chame a função seed_meetings do seu contexto Meetings
# Esta função irá inserir as reuniões de exemplo no seu banco de dados
CadenceBackend.Meetings.seed_meetings()

IO.puts "Seeds finished."
