import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createTask } from '@/lib/todoist';
import { breakdownTask } from '@/services/gemini';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { taskContent, parentId, additionalDetails } = await request.json();

  if (!taskContent || !parentId) {
    return NextResponse.json({ error: 'Missing taskContent or parentId' }, { status: 400 });
  }

  try {
    // Use the centralized service to break down the task with optional additional details
    const subtasks = await breakdownTask(taskContent, additionalDetails);

    const createdSubtasks = [];
    for (const subtask of subtasks) {
      const newSubtask = await createTask(subtask, undefined, undefined, parentId);
      createdSubtasks.push(newSubtask);
    }

    return NextResponse.json({ subtasks: createdSubtasks });
  } catch (error) {
    console.error('Error breaking down task:', error);
    // It's good practice to check the error type if possible
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Failed to break down task', details: errorMessage }, { status: 500 });
  }
}
