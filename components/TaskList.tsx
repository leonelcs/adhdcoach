'use client';

import React from 'react';
import TaskItem from './TaskItem';

interface Task {
  id: string;
  content: string;
  priority: number;
  due?: { date: string };
  is_completed: boolean;
  parent_id?: string;
}

interface TaskListProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onBreakdown: (taskId: string, taskContent: string) => void;
  parentId?: string | null;  // To identify root vs child tasks
}

export default function TaskList({ 
  tasks, 
  onTaskComplete, 
  onBreakdown,
  parentId = null 
}: TaskListProps) {
  // Filter tasks based on their parent_id
  // Root tasks have no parent_id or it matches the parentId parameter
  const filteredTasks = tasks.filter(task => 
    parentId === null ? !task.parent_id : task.parent_id === parentId
  );

  if (filteredTasks.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-2">
      {filteredTasks.map(task => (
        <TaskItem 
          key={task.id}
          task={task}
          allTasks={tasks}
          onComplete={onTaskComplete}
          onBreakdown={onBreakdown}
        />
      ))}
    </ul>
  );
}