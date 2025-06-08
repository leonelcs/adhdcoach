'use client';
import { useState, useEffect, useCallback } from 'react';
import TaskList from './TaskList';

interface Task {
  id: string;
  content: string;
  priority: number;
  due?: { date: string };
  is_completed: boolean;
  parent_id?: string;
}

export default function ClientTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar tarefas
  const fetchTasks = useCallback(async () => {
    try {
      console.log('ClientTaskList: Starting to fetch tasks...');
      setLoading(true);
      const response = await fetch('/api/todoist/all');
      console.log('ClientTaskList: API response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      console.log('ClientTaskList: Received data:', data);
      console.log('ClientTaskList: Tasks count:', data.tasks?.length || 0);
      
      setTasks(data.tasks || []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar tarefas na inicialização
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskComplete = useCallback(async (taskId: string) => {
    try {
      // Otimisticamente atualizar a UI
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, is_completed: true } : task
        )
      );

      const response = await fetch(`/api/todoist/tasks/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        // Reverter mudança otimista se falhar
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, is_completed: false } : task
          )
        );
        const errorData = await response.text();
        throw new Error(`Failed to complete task: ${response.status} ${errorData.substring(0,100)}`);
      }

      // Recarregar tarefas para garantir sincronização
      setTimeout(() => fetchTasks(), 1000);
      
    } catch (err: any) {
      console.error('Error completing task:', err);
      setError(err.message);
    }
  }, [fetchTasks]);

  const handleBreakdown = async (taskId: string, taskContent: string, additionalDetails?: string) => {
    console.log(`Requesting AI breakdown for task ${taskId}: ${taskContent}`);
    if (additionalDetails) {
      console.log(`Additional details: ${additionalDetails}`);
    }
    
    try {
      const response = await fetch('/api/ai/breakdown-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          parentId: taskId, 
          taskContent,
          additionalDetails 
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to break down task');
      }
      
      // Recarregar tarefas imediatamente após criar subtarefas
      await fetchTasks();
      
    } catch (error: any) {
      console.error('Error breaking down task:', error);
      setError(error.message || 'Could not break down task.');
    }
  };

  if (loading) {
    console.log('ClientTaskList: Currently loading...');
    return <div className="p-4 text-center">Loading tasks...</div>;
  }

  if (error) {
    console.log('ClientTaskList: Error state:', error);
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  console.log('ClientTaskList: About to render, tasks.length:', tasks.length);

  return (
    <div className="task-list">
      <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
      <p className="text-sm text-gray-600 mb-2">Total tasks loaded: {tasks.length}</p>
      
      {loading ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : tasks.length > 0 ? (
        <TaskList 
          tasks={tasks} 
          onTaskComplete={handleTaskComplete} 
          onBreakdown={handleBreakdown}
          parentId={null} // This ensures we only get root tasks
        />
      ) : (
        <p className="text-gray-500 text-center py-4">No tasks found</p>
      )}
    </div>
  );
}