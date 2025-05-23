import React from 'react';
import { completeTask } from '@/lib/todoist';

// Priority color mapping (Todoist uses 1-4 with 4 being highest)
const priorityColors = {
  1: '#808080', // Normal - Gray
  2: '#246FE0', // Medium - Blue
  3: '#EB8909', // High - Orange
  4: '#D1453B', // Urgent - Red
};

// Priority text labels
const priorityLabels = {
  1: 'Normal',
  2: 'Medium',
  3: 'High',
  4: 'Urgent',
};

interface TaskItemProps {
  task: {
    id: string;
    content: string;
    priority: number;
    due?: {
      date: string;
    };
  };
  onComplete: () => void;
}

export default function TaskItem({ task, onComplete }: TaskItemProps) {
  const priorityColor =
    priorityColors[task.priority as keyof typeof priorityColors] ||
    priorityColors[1];
  const priorityLabel =
    priorityLabels[task.priority as keyof typeof priorityLabels] || 'Normal';

  const handleComplete = async () => {
    try {
      await completeTask(task.id);
      onComplete();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  return (
    <div className="border-b border-gray-200 p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors">
      {/* Checkbox */}
      <button
        onClick={handleComplete}
        className="mt-0.5 rounded-full border-2 border-gray-300 w-5 h-5 flex-shrink-0 hover:border-blue-500 transition-colors"
        aria-label="Complete task"
      />

      {/* Task content */}
      <div className="flex-grow min-w-0">
        <div className="text-sm font-medium truncate">{task.content}</div>

        <div className="flex items-center mt-1 gap-2 text-xs">
          {/* Priority indicator */}
          <span
            className="px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${priorityColor}20`, // 20% opacity
              color: priorityColor,
            }}
          >
            {priorityLabel}
          </span>

          {/* Due date if available */}
          {task.due && (
            <span className="text-gray-500">
              Due: {new Date(task.due.date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}