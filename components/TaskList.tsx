'use client';

import React from 'react';
import TaskItem from './TaskItem';

interface Task {
  id: string;
  content: string;
  priority: number;
  due?: { date: string };
  completed?: boolean; // Make completed optional as it might not always be present
  is_completed?: boolean; // Support for is_completed from API
  // Add other task properties as needed
}

interface TaskListProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onBreakdown: (taskId: string, taskContent: string) => void;
  onRefresh: () => void; // Added for consistency, though not used in this simplified version
}

export default function TaskList({ tasks, onTaskComplete, onBreakdown }: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return <div className="py-10 text-center text-gray-500">No tasks found.</div>;
  }

  // Split tasks into active and completed
  // Ensure we check both `completed` and `is_completed` for flexibility
  const activeTasks = tasks.filter(task => !task.completed && !task.is_completed);
  const completedTasks = tasks.filter(task => task.completed || task.is_completed);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Active Tasks</h2>
      {activeTasks.length === 0 && <div className="text-gray-400 italic">No active tasks.</div>}
      {activeTasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onComplete={() => onTaskComplete(task.id)}
          completed={false}
          onBreakdown={onBreakdown} // Pass down onBreakdown
        />
      ))}

      {completedTasks.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-8 mb-3 text-gray-700">Completed Tasks</h2>
          {completedTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={() => onTaskComplete(task.id)} // Or disable for completed tasks
              completed={true}
              onBreakdown={onBreakdown} // Pass down onBreakdown, though likely disabled/hidden in TaskItem for completed
            />
          ))}
        </>
      )}
    </div>
  );
}