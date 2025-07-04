defmodule CadenceBackendWeb.MeetingJson do

  # O alias MeetingView não está sendo utilizado, então foi removido.
  # alias CadenceBackendWeb.MeetingView

  def index(%{meetings: meetings}) do
    %{data: for(meeting <- meetings, do: data(meeting))}
  end

  def show(%{meeting: meeting}) do
    %{data: data(meeting)}
  end

  def data(meeting) do
    %{
      id: meeting.id,
      name: meeting.name,
      start_time: meeting.start_time,
      end_time: meeting.end_time,
      status: meeting.status,
      type: meeting.type,
      owner_id: meeting.owner_id,
      participants: meeting.participants
    }
  end
end
