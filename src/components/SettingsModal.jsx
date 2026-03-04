import React from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

const SettingsModal = ({ isOpen, onClose }) => {
  const showCompletedTasks = useTaskStore((state) => state.showCompletedTasks);
  const toggleShowCompletedTasks = useTaskStore((state) => state.toggleShowCompletedTasks);
  
  const showCompletedColumns = useTaskStore((state) => state.showCompletedColumns);
  const toggleShowCompletedColumns = useTaskStore((state) => state.toggleShowCompletedColumns);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-sm overflow-hidden transition-colors">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Cài đặt (Settings)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Công việc đã xong</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hiển thị các task đã đánh dấu tick</p>
            </div>
            <button 
              onClick={toggleShowCompletedTasks}
              className={`p-2 rounded-lg transition-colors ${
                showCompletedTasks 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' 
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {showCompletedTasks ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Bảng đã hoàn thành</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hiển thị các bảng đã làm xong hết</p>
            </div>
            <button 
              onClick={toggleShowCompletedColumns}
              className={`p-2 rounded-lg transition-colors ${
                showCompletedColumns 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' 
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {showCompletedColumns ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;