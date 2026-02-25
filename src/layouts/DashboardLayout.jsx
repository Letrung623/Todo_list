import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';
import { Moon, Sun, Bell, Filter } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

const DashboardLayout = ({ children }) => {
  const filterType = useTaskStore((state) => state.filterType);
  const setFilterType = useTaskStore((state) => state.setFilterType);
  const tasks = useTaskStore((state) => state.tasks);
  
  // Lấy công tắc Dark Mode ra xài
  const isDarkMode = useTaskStore((state) => state.isDarkMode);
  const toggleDarkMode = useTaskStore((state) => state.toggleDarkMode);

  // Phép thuật React: Tự động tiêm class 'dark' vào thẻ HTML cao nhất mỗi khi bật công tắc
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    // Thêm các class dark:bg-gray-900, dark:text-gray-100 vào wrapper ngoài cùng
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Inbox</h1>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-md font-medium">
              {tasks.length} tasks
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg transition-colors">
              <Filter size={16} className="text-gray-400 ml-2" />
              {['All', 'High', 'Medium', 'Low'].map((type) => (
                <button 
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    filterType === type 
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {type === 'All' ? 'All Tasks' : type}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-800 pl-6">
              
              {/* Nút bấm mặt trăng / mặt trời đổi màu xịn xò */}
              <button onClick={toggleDarkMode} className="hover:text-gray-800 dark:hover:text-white transition-colors">
                {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
              </button>
              
              <button className="hover:text-gray-800 dark:hover:text-white relative transition-colors">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <RightPanel />
    </div>
  );
};

export default DashboardLayout;