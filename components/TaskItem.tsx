'use client';

import React, { useState, useEffect } from 'react';
import { completeTaskClient } from '@/lib/todoistClient';
import { CheckCircleIcon, ChevronDownIcon, ChevronRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import TaskList from './TaskList';
import TaskBreakdownModal from './TaskBreakdownModal';

interface Task {
  id: string;
  content: string;
  is_completed: boolean;
  priority: number;
  due?: {
    date: string;
  };
  parent_id?: string; // Parent task ID for subtasks
  // Add other properties as needed
}

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void; // Modified to accept taskId
  onBreakdown: (taskId: string, taskContent: string) => void; // Added for AI breakdown
  allTasks?: Task[]; // All tasks to identify subtasks
  level?: number; // For indentation in recursive rendering
}

export default function TaskItem({ task, allTasks, onComplete, onBreakdown }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [hasSubtasks, setHasSubtasks] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if this task has any subtasks
  useEffect(() => {
    if (allTasks) {
      const childTasks = allTasks.filter(t => t.parent_id === task.id);
      setHasSubtasks(childTasks.length > 0);
    }
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

  const handleBreakdownClick = () => {
    setShowBreakdownModal(true);
  };

  const handleBreakdownSubmit = async (details: string) => {
    setBreakdownLoading(true);
    try {
      await onBreakdown(task.id, task.content);
      setExpanded(true); // Auto-expand after breakdown
      setShowBreakdownModal(false);
    } catch (error) {
      console.error('Error in breakdown:', error);
    } finally {
      setBreakdownLoading(false);
    }
  };

  return (
    <>
      <li className="border rounded-md overflow-hidden mb-2 relative">
        <div 
          className="flex items-center p-3 bg-white hover:bg-gray-50"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Checkbox */}
          <div className="flex-shrink-0 mr-3">
            <input
              type="checkbox"
              className="h-5 w-5 text-blue-600 rounded cursor-pointer"
              checked={task.is_completed}
              onChange={handleComplete}
              disabled={task.is_completed}
            />
          </div>

          {/* Task content */}
          <div className="flex-grow">
            <p className={task.is_completed ? "line-through text-gray-500" : ""}>
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
            {task.priority && task.priority > 1 && (
              <span 
                className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: priorityColor }}
              >
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
                onClick={handleBreakdownClick}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                aria-label="Break down task"
                disabled={breakdownLoading}
              >
                {breakdownLoading ? 'Breaking...' : 'Break down'}
              </button>
            )}
          </div>
        </div>

        {/* Tooltip que aparece no hover */}
        {showTooltip && (
          <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-gray-900 text-white text-sm rounded-md shadow-lg z-10">
            <div className="mb-2">
              <span className="font-semibold">Task:</span> {task.content}
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-gray-700 px-2 py-1 rounded">
                Priority: {priorityLabel}
              </span>
              {dueDateDisplay && (
                <span className="bg-gray-700 px-2 py-1 rounded">
                  Due: {dueDateDisplay}
                </span>
              )}
              <span className="bg-gray-700 px-2 py-1 rounded">
                Status: {task.is_completed ? 'Completed' : 'Active'}
              </span>
              {hasSubtasks && (
                <span className="bg-gray-700 px-2 py-1 rounded">
                  Has Subtasks
                </span>
              )}
            </div>
            {/* Seta do tooltip */}
            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        )}

        {/* Subtasks section - only render if expanded */}
        {expanded && hasSubtasks && allTasks && (
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

      <TaskBreakdownModal
        isOpen={showBreakdownModal}
        onClose={() => setShowBreakdownModal(false)}
        onSubmit={handleBreakdownSubmit}
        taskContent={task.content}
        loading={breakdownLoading}
      />
    </>
  );
}