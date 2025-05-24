import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getTasks } from '@/lib/todoist';

export async function GET(request: Request) {
  console.log("API: /api/todoist/all endpoint called");
  
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("API: /api/todoist/all - No authenticated user");
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    console.log("API: /api/todoist/all - Fetching all tasks from Todoist");
    
    // Get active tasks
    const activeTasks = await getTasks();
    console.log("API: /api/todoist/all - Got active tasks, count:", activeTasks.length);
    
    // Since Todoist doesn't return completed tasks directly, 
    // we mark all active tasks as not completed
    const tasksWithCompletionStatus = activeTasks.map(task => ({
      ...task,
      completed: false
    }));

    console.log("API: /api/todoist/all - Returning all tasks");
    return NextResponse.json(tasksWithCompletionStatus);
  } catch (error) {
    console.error("API: /api/todoist/all - Error fetching tasks:", error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' }, 
      { status: 500 }
    );
  }
}
