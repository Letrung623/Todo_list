import React from 'react';
import { Circle, AlertCircle, CheckCircle2, MapPin, Trash2, CalendarDays } from 'lucide-react'; 
import { useTaskStore } from '../store/useTaskStore';

const TaskItem = ({ task }) => {
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const isOverdue = task.status === 'overdue';
  const isCompleted = task.status === 'completed';

  // Format ngày để hiển thị ngắn gọn đẹp mắt
  const formatDate = (dateStr) => {
      if(!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  return (
    <div className={`group bg-white p-4 rounded-lg shadow-sm mb-3 flex items-start gap-4 border transition-all duration-300 ${
      isOverdue ? 'border-l-4 border-l-red-500 border-gray-100' : 'border-gray-100'
    } ${isCompleted ? 'opacity-50 grayscale' : ''}`}>
      
      <button 
        onClick={() => toggleTask(task.id)}
        className={`mt-1 transition-colors ${
          isCompleted ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
        }`}
      >
        {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </button>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className={`font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {task.title}
          </h4>
          
          <button 
            onClick={() => deleteTask(task.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 p-1 rounded-md"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        {task.subtitle && (
          <p className="text-sm text-gray-500 mt-1">{task.subtitle}</p>
        )}
        
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-medium">
          {task.priority && (
            <span className={`flex items-center gap-1 px-2 py-1 rounded-md ${
              task.priority === 'High' ? 'text-red-600 bg-red-50' : 
              task.priority === 'Medium' ? 'text-yellow-600 bg-yellow-50' : 
              'text-green-600 bg-green-50'
            }`}>
               <AlertCircle size={12} /> {task.priority}
            </span>
          )}
          
          {/* Giao diện Hiển thị Khoảng Thời Gian */}
          {task.startDate && task.endDate && (
             <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                <CalendarDays size={12} /> 
                {formatDate(task.startDate)} ➔ {formatDate(task.endDate)}
             </span>
          )}

          {task.location && (
            <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
              <MapPin size={12} /> {task.location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;