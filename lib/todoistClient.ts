// lib/todoistClient.ts
export async function completeTaskClient(taskId: string) {
  console.log('🚀 todoistClient.completeTaskClient got taskId =', taskId);
  const res = await fetch('/api/todoist/tasks/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId }),
    credentials: 'include',
  });
  
  console.log('📥 /api/todoist/tasks/complete status', res.status);
  const text = await res.text();
  console.log('📥 /api/todoist/tasks/complete raw text:', text.slice(0,200));
  
  if (!res.ok) {
    let err;
    try { err = JSON.parse(text).error } catch { err = text }
    throw new Error(err || `status ${res.status}`);
  }
  return JSON.parse(text);
}

// Similar structure for getTasksClient if you have one
export async function getTasksClient(): Promise<TodoistTask[]> {
  console.log("CLIENT_LIB: getTasksClient called");
  const response = await fetch('/api/todoist/tasks', { // Assuming you have this endpoint
    credentials: 'include',
  });
  console.log("CLIENT_LIB: /api/todoist/tasks response status:", response.status);
  const responseText = await response.text();
  console.log("CLIENT_LIB: Raw response from /api/todoist/tasks:", responseText.substring(0, 200));

  if (!response.ok) {
    let errorJson;
    try {
      errorJson = JSON.parse(responseText);
    } catch (e) {
      console.error("CLIENT_LIB: API response was not valid JSON for getTasks:", responseText);
      throw new Error(`Server error: ${response.status} - ${responseText.substring(0,100)}`);
    }
    console.error("CLIENT_LIB: API error from /api/todoist/tasks:", errorJson.error);
    throw new Error(errorJson.error || `Failed to fetch tasks (status ${response.status})`);
  }
  const data = JSON.parse(responseText);
  console.log("CLIENT_LIB: Tasks fetched successfully via client call, count:", data.length);
  return data;
}