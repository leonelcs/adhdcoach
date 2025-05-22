import { prisma } from './prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


const TODOIST_API_BASE = 'https://api.todoist.com/rest/v2';

// Helper to get the token for the current user
async function getUserToken() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  
  const todoistToken = await prisma.todoistToken.findUnique({
    where: { userId: session.user.id }
  });

  const token = todoistToken?.token || process.env.TODOIST_API_TOKEN;
  if (!token) {
    throw new Error("No Todoist token available");
  }
  
  return { token, userId: session.user.id };
}

export async function getTasks(): Promise<TodoistTask[]> {
  const { token } = await getUserToken();
  
  const response = await fetch(`${TODOIST_API_BASE}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    next: { revalidate: 60 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.status}`);
  }
  
  return response.json();
}

// Other Todoist API functions with authentication...
export async function completeTask(taskId: string): Promise<void> {
  const { token } = await getUserToken();
  
  const response = await fetch(`${TODOIST_API_BASE}/tasks/${taskId}/close`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to complete task: ${response.status}`);
  }
}

export async function createTask(content: string, dueString?: string, priority?: number): Promise<TodoistTask> {
  const { token } = await getUserToken();
  
  const response = await fetch(`${TODOIST_API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      content,
      due_string: dueString,
      priority
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.status}`);
  }
  
  return response.json();
}

// Function to store user's Todoist token
export async function storeUserTodoistToken(userId: string, todoistToken: string): Promise<void> {
  await prisma.todoistToken.upsert({
    where: { userId },
    update: { token: todoistToken },
    create: { userId, token: todoistToken }
  });
}

