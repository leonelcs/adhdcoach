'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TaskItem from './TaskItem';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}