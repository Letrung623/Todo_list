import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { Clock } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

const RightPanel = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const toggleSelectedDate = useTaskStore((state) => state.toggleSelectedDate);
  
  // Lấy trạng thái Dark Mode để chỉnh màu vòng tròn phần trăm
  const isDarkMode = useTaskStore((state) => state.isDarkMode);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900/50 h-screen border-l border-gray-200 dark:border-gray-800 p-6 overflow-y-auto hidden lg:block transition-colors duration-300">
      
      {/* Daily Progress */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col items-center transition-colors">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Daily Progress</h3>
        <div className="w-32 h-32 mb-4">
          <CircularProgressbar 
            value={percentage} 
            text={`${percentage}%`} 
            styles={buildStyles({
              pathColor: '#3b82f6',
              textColor: isDarkMode ? '#f3f4f6' : '#1f2937', // Đổi chữ % sang trắng khi tắt đèn
              trailColor: isDarkMode ? '#374151' : '#eff6ff',
              textSize: '24px',
              pathTransitionDuration: 0.5,
            })}
          />
        </div>
        <div className="flex justify-between w-full text-center mt-2">
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{completedTasks}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
          </div>
          <div>
             <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{pendingTasks}</p>
             <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 custom-calendar transition-colors">
         <Calendar 
            onClickDay={(value) => toggleSelectedDate(value)} 
            value={selectedDate || new Date()} 
            formatShortWeekday={(locale, date) => date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const today = new Date();
                if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
                  return <div className="dot-indicator"></div>;
                }
              }
              return null;
            }}
         />
      </div>

      {/* Today Focus */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Today's Focus</h4>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg p-4 flex items-start gap-3 transition-colors">
          <Clock className="text-blue-500 dark:text-blue-400 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Deep Work</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2h 30m remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;