import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TaskBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: string) => void;
  taskContent: string;
  loading?: boolean;
}

export default function TaskBreakdownModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  taskContent, 
  loading = false 
}: TaskBreakdownModalProps) {
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(details);
    setDetails(''); // Clear the form after submission
  };

  const handleClose = () => {
    setDetails(''); // Clear the form when closing
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Break Down Task with AI
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Original Task:</p>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium">{taskContent}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  id="details"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide any additional context, requirements, or specific instructions for breaking down this task..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Breaking Down...' : 'Break Down Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
