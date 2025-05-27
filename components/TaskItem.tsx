'use client';

import React, { useState, useEffect } from 'react';
import { completeTaskClient } from '@/lib/todoistClient';
import { CheckCircleIcon, ChevronDownIcon, ChevronRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import TaskList from './TaskList';

interface Task {
  id: string;
  content: string;
  completed?: boolean;
  priority?: number;
  due?: {
    date: string;
  };
  parent_id?: string; // Parent task ID for subtasks
  // Add other properties as needed
}

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void; // Modified to accept taskId
  completed: boolean;
  onBreakdown: (taskId: string, taskContent: string) => void; // Added for AI breakdown
  allTasks?: Task[]; // All tasks to identify subtasks
  level?: number; // For indentation in recursive rendering
}

export default function TaskItem({ task, onComplete, completed, onBreakdown, allTasks = [], level = 0 }: TaskItemProps) {
  console.log('🔍 TaskItem rendered with task.id=', task.id);

  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hasSubtasks, setHasSubtasks] = useState(false);

  // Check if this task has any subtasks
  useEffect(() => {
    const childTasks = allTasks.filter(t => t.parent_id === task.id);
    setHasSubtasks(childTasks.length > 0);
  }, [allTasks, task.id]);

  // Format due date if available
  const dueDateDisplay = task.due?.date
    ? new Date(task.due.date).toLocaleDateString()
    : null;

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

  const priorityColor =
    priorityColors[task.priority as keyof typeof priorityColors] ||
    priorityColors[1];
  const priorityLabel =
    priorityLabels[task.priority as keyof typeof priorityLabels] || 'Normal';

  // Find subtasks from all tasks where parent_id matches current task id
  useEffect(() => {
    if (allTasks && allTasks.length > 0) {
      const childTasks = allTasks.filter(t => t.parent_id === task.id);
      setSubtasks(childTasks);
    }
  }, [allTasks, task.id]);

  // Function to break down a task into subtasks using AI
  const breakdownTask = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/breakdown-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskContent: task.content,
          parentId: task.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to break down task');
      }

      const data = await response.json();

      // Update the subtasks with the newly created ones
      setSubtasks(prev => [...prev, ...data.subtasks]);
      setExpanded(true);
    } catch (error) {
      console.error('Error breaking down task:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleBreakdown = () => {
    onBreakdown(task.id, task.content);
    setExpanded(true); // Auto-expand after breakdown
  };

  return (
    <li className={`border rounded-md hover:bg-gray-50 ${level > 0 ? 'ml-6' : ''}`}>
      <div className="flex items-start p-3">
        {/* Checkbox */}
        <div className="flex-shrink-0 mr-3">
          <input
            type="checkbox"
            className="h-5 w-5 text-blue-600 rounded"
            checked={task.completed}
            readOnly
          />
        </div>

        {/* Task content */}
        <div className="flex-grow">
          <p className={task.completed ? "line-through text-gray-500" : ""}>
            {task.content}
          </p>
          {dueDateDisplay && (
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{dueDateDisplay}</span>
            </div>
          )}
        </div>

        {/* Priority and breakdown button */}
        <div className="flex items-center space-x-2">
          {task.priority && task.priority < 4 && (
            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColor}`}>
              P{task.priority}
            </span>
          )}

          {hasSubtasks ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded hover:bg-gray-200"
              aria-label={expanded ? "Collapse subtasks" : "Expand subtasks"}
            >
              {expanded ?
                <ChevronDownIcon className="h-5 w-5 text-gray-500" /> :
                <ChevronRightIcon className="h-5 w-5 text-gray-500" />
              }
            </button>
          ) : (
            <button
              onClick={handleBreakdown}
              className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              aria-label="Break down task"
            >
              {loading ? 'Breaking down...' : 'Break down'}
            </button>
          )}
        </div>
      </div>

      {/* Subtasks section - only render if expanded */}
      {expanded && hasSubtasks && (
        <div className="pl-8 pr-3 pb-2 pt-1 bg-gray-50 border-t">
          <TaskList
            tasks={allTasks}
            parentId={task.id}
            onTaskComplete={onComplete}
            onBreakdown={onBreakdown}
          />
        </div>
      )}
    </li>
  );
}