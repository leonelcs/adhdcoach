'use server';

import { getServerSession } from "next-auth/next"; // Ensure this is the correct import
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "./prisma";
// Removed Session import as it's no longer a direct parameter for most functions here

const TODOIST_API_BASE = 'https://api.todoist.com/rest/v2';

// Helper to get the token for the current user by fetching session internally
export async function getUserToken() {
  console.log("LIB_TODOIST: getUserToken attempting to fetch session internally.");
  const session = await getServerSession(authOptions); // Fetches session internally
  console.log("LIB_TODOIST: Internally fetched session:", session ? "Exists" : "NULL");

  if (!session?.user?.id) {
    console.error("LIB_TODOIST: Not authenticated - no session or user.id found internally.");
    throw new Error("Not authenticated");
  }
  console.log("LIB_TODOIST: User ID from internal session:", session.user.id);

  const todoistToken = await prisma.todoistToken.findUnique({
    where: { userId: session.user.id }
  });
  console.log("LIB_TODOIST: Looked up Todoist token in DB:", todoistToken ? "Found" : "Not found");

  const token = todoistToken?.token || process.env.TODOIST_API_TOKEN;
  if (!token) {
    console.error("LIB_TODOIST: No Todoist token available for user:", session.user.id);
    throw new Error("No Todoist token available");
  }
  console.log("LIB_TODOIST: Returning token for user:", session.user.id);
  return { token, userId: session.user.id };
}

export async function getTasks(): Promise<TodoistTask[]> {
  console.log("LIB_TODOIST: getTasks called.");
  // Calls getUserToken which now fetches session internally
  const { token, userId } = await getUserToken(); 
  
  console.log("LIB_TODOIST: Fetching tasks from Todoist API for user:", userId);
  const response = await fetch(`${TODOIST_API_BASE}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    next: { revalidate: 60 }
  });
  
  console.log("LIB_TODOIST: Todoist API /tasks response status:", response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("LIB_TODOIST: Failed to fetch tasks from Todoist:", response.status, errorText.substring(0, 200));
    throw new Error(`Failed to fetch tasks: ${response.status}`);
  }
  
  const tasks = await response.json();
  console.log("LIB_TODOIST: Successfully fetched tasks, count:", tasks.length);
  return tasks;
}

export async function completeTask(taskId: string): Promise<void> {
  console.log("LIB_TODOIST: completeTask called for taskId:", taskId);
  // Calls getUserToken which now fetches session internally
  const { token, userId } = await getUserToken();
  
  console.log("LIB_TODOIST: Completing task via Todoist API for taskId:", taskId, "user:", userId);
  const response = await fetch(`${TODOIST_API_BASE}/tasks/${taskId}/close`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  console.log("LIB_TODOIST: Todoist API /tasks/.../close response status:", response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("LIB_TODOIST: Failed to complete task via Todoist:", response.status, errorText.substring(0, 200));
    throw new Error(`Failed to complete task: ${response.status}`);
  }
  console.log("LIB_TODOIST: Task completed successfully via API for taskId:", taskId);
}

export async function createTask(content: string, dueString?: string, priority?: number): Promise<TodoistTask> {
  console.log("LIB_TODOIST: createTask called with content:", content);
  // Calls getUserToken which now fetches session internally
  const { token, userId } = await getUserToken();
  
  console.log("LIB_TODOIST: Creating task via Todoist API for user:", userId, "content:", content);
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
  console.log("LIB_TODOIST: Todoist API create task response status:", response.status);
   if (!response.ok) {
    const errorText = await response.text();
    console.error("LIB_TODOIST: Failed to create task via Todoist:", response.status, errorText.substring(0,200));
    throw new Error(`Failed to create task: ${response.status}`);
  }
  const newTask = await response.json();
  console.log("LIB_TODOIST: Task created successfully via API, ID:", newTask.id);
  return newTask;
}

// storeUserTodoistToken already correctly accepts userId.
// If this also needs to fetch session to get userId, it would need similar changes.
// For now, assuming it's called when userId is already known.
export async function storeUserTodoistToken(userId: string, todoistTokenValue: string): Promise<void> {
  console.log("LIB_TODOIST: storeUserTodoistToken called for userId:", userId);
  await prisma.todoistToken.upsert({
    where: { userId },
    update: { token: todoistTokenValue },
    create: { userId, token: todoistTokenValue }
  });
  console.log("LIB_TODOIST: Todoist token stored/updated in DB for userId:", userId);
}

