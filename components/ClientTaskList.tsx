'use client';
import { useState, useEffect, useCallback } from 'react';
import TaskList from './TaskList';

interface Task {
  id: string;
  content: string;
  priority: number;
  due?: { date: string };
  is_completed: boolean; // Assuming this field comes from your API
  // Add other task properties as needed
}

interface ClientTaskListProps {
  tasks: Task[];
  loading: boolean;
}

export default function ClientTaskList({ tasks, loading }: ClientTaskListProps) {
  const [error, setError] = useState<string | null>(null);

  const handleTaskComplete = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/todoist/tasks/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to complete task: ${response.status} ${errorData.substring(0,100)}`);
      }
      // Optionally, you can refetch tasks or update the task list locally
    } catch (err: any) {
      console.error('Error completing task:', err);
      setError(err.message);
      // Optionally, revert UI change or show specific error to user
    }
  }, []);

  const handleBreakdown = async (taskId: string, taskContent: string) => {
    console.log(`Requesting AI breakdown for task ${taskId}: ${taskContent}`);
    try {
      const response = await fetch('/api/ai/breakdown-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: taskId, taskContent }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to break down task');
      }
      // Successfully created subtasks, you might want to update the task list
    } catch (error: any) {
      console.error('Error breaking down task:', error);
      setError(error.message || 'Could not break down task.');
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="task-list">
      <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
      
      {tasks.length > 0 ? (
        <TaskList 
          tasks={tasks} 
          onTaskComplete={handleTaskComplete} 
          onBreakdown={handleBreakdown} 
        />
      ) : (
        <p className="text-gray-500 text-center py-4">No tasks found</p>
      )}
    </div>
  );
}