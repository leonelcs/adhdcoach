'use client';

import React from 'react';
import { completeTaskClient } from '@/lib/todoistClient';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

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

interface Task {
  id: string;
  content: string;
  completed?: boolean;
  priority?: number;
  due?: {
    date: string;
  };
  // Add other properties as needed
}

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void; // Modified to accept taskId
  completed: boolean;
  onBreakdown: (taskId: string, taskContent: string) => void; // Added for AI breakdown
}

export default function TaskItem({ task, onComplete, completed, onBreakdown }: TaskItemProps) {
  console.log('🔍 TaskItem rendered with task.id=', task.id);

  const priorityColor =
    priorityColors[task.priority as keyof typeof priorityColors] ||
    priorityColors[1];
  const priorityLabel =
    priorityLabels[task.priority as keyof typeof priorityLabels] || 'Normal';

  const handleComplete = async () => {
    console.log('🖱️ TaskItem.handleComplete, sending up id=', task.id);
    try {
      await completeTaskClient(task.id);
      console.log('✅ TaskItem: completeTaskClient succeeded for', task.id);
      onComplete(task.id);
    } catch (error) {
      console.error('❌ TaskItem: completeTaskClient failed for', task.id, error);
    }
  };

  // Format due date if available
  const dueDateDisplay = task.due?.date
    ? new Date(task.due.date).toLocaleDateString()
    : null;

  return (
    <div className="border-b border-gray-200 p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors relative group">
      {/* Checkbox */}
      <button
        onClick={handleComplete}
        className="mt-0.5 rounded-full border-2 border-gray-300 w-5 h-5 flex-shrink-0 hover:border-blue-500 transition-colors"
        aria-label="Complete task"
        disabled={completed}
      />

      {/* Task content */}
      <div className="flex-grow min-w-0">
        <div
          className={`text-sm font-medium truncate ${
            completed ? 'line-through text-gray-400' : ''
          }`}
        >
          {task.content}
        </div>

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
          {dueDateDisplay && (
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{dueDateDisplay}</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Breakdown Button - visible on hover */}
      {!completed && (
        <button
          onClick={() => onBreakdown(task.id, task.content)}
          className="absolute top-2 right-2 p-1 rounded-md bg-gray-100 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="AI Detailing"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.25l-1.25-2.25L13.5 11l2.25-1.25L17 7.5l1.25 2.25L20.5 11l-2.25 1.25z" />
          </svg>
          <span className="sr-only">AI Detailing</span>
        </button>
      )}
    </div>
  );
}