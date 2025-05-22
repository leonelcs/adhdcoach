import { NextResponse } from 'next/server';
import { getTasks } from '@/lib/todoist';

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' }, 
      { status: 500 }
    );
  }
}