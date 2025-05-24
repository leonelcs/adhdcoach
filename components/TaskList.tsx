'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TaskItem from './TaskItem';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    if (status !== 'authenticated') {
      return;
    }

    // Fetch all tasks (active and completed)
    async function fetchTasks() {
      setLoading(true);
      try {
        const response = await fetch('/api/todoist/all'); // <-- You may need to create this endpoint

        if (response.status === 401) {
          router.push('/connect-todoist');
          return;
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [status, router]);

  // Split tasks into active and completed
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  if (status === 'loading' || loading) {
    return <div className="py-10 text-center">Loading tasks...</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Active Tasks</h2>
      {activeTasks.length === 0 && <div className="text-gray-400">No active tasks.</div>}
      {activeTasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onComplete={() => {/* your complete logic here */}}
          completed={false}
        />
      ))}

      <h2 className="text-lg font-bold mt-8 mb-2">Completed Tasks</h2>
      {completedTasks.length === 0 && <div className="text-gray-400">No completed tasks.</div>}
      {completedTasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onComplete={() => {/* maybe allow undo here */}}
          completed={true}
        />
      ))}
    </div>
  );
}