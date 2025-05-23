'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TaskItem from './TaskItem';
import { completeTask } from '@/lib/todoist';

interface Task {
  id: string;
  content: string;
  priority: number;
  due?: {
    date: string;
  };
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (status !== 'authenticated') {
      return;
    }

    async function fetchTasks() {
      try {
        const response = await fetch('/api/todoist');
        
        if (response.status === 401) {
          router.push('/connect-todoist');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError('Failed to load tasks. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [status, router]);

  const handleComplete = async (id: string) => {
    console.log('🔍 TaskList.handleComplete called with id=', id);
    if (!id) {
      console.error('❌ TaskList.handleComplete: id is undefined!');
      return;
    }
    try {
      console.log('🚀 TaskList: calling completeTask with', id);
      await completeTask(id);
      console.log('✅ TaskList: completeTask succeeded for', id);

      // Refresh tasks
      const response = await fetch('/api/todoist');
      console.log('📥 TaskList: fetched /api/todoist status', response.status);
      const data = await response.json();
      console.log('📊 TaskList: new tasks array length=', data?.length);
      setTasks(data);
    } catch (error) {
      console.error('❌ TaskList: Failed to complete task for id=', id, error);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="py-10 text-center">Loading tasks...</div>;
  }

  if (error) {
    return <div className="py-10 text-center text-red-500">{error}</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        <p>No tasks found</p>
        <button
          onClick={() => router.push('/connect-todoist')}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Connect Todoist Account
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-200">
        {tasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No tasks available
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onComplete={handleComplete} 
            />
          ))
        )}
      </div>
    </div>
  );
}