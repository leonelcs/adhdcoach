'use client';
// filepath: /home/lcandidodasilva/Developer/mcp/adhd_coach/adhdcoach/components/ClientTaskList.tsx
import { useState, useEffect } from 'react';
import TaskList from './TaskList';

export default function ClientTaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  return (
    <div>
      {loading ? (
        <div className="p-4 text-center">Loading tasks...</div>
      ) : (
        <TaskList tasks={tasks} onRefresh={fetchTasks} />
      )}
    </div>
  );
}