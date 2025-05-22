import React from 'react';

interface Task {
  id: string;
  content: string;
  // Add other task properties as needed
}

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-medium text-gray-900">{task.content}</h3>
      {/* Add more task details or actions here */}
    </div>
  );
};

export default TaskItem;