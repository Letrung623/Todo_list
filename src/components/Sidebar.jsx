import React from 'react';
import { Inbox as InboxIcon, ListTodo, Settings, LogOut, GraduationCap } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

const Sidebar = () => {
  const activeSidebarMenu = useTaskStore((state) => state.activeSidebarMenu);
  const setActiveSidebarMenu = useTaskStore((state) => state.setActiveSidebarMenu);
  const tasks = useTaskStore((state) => state.tasks);

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;

  // Đã dọn dẹp Today và Upcoming, thay bằng Timetable và giữ lại Projects
  const menuItems = [
    { id: 'Inbox', icon: <InboxIcon size={20} />, label: 'Tasks Inbox', count: pendingTasksCount },
    { id: 'Timetable', icon: <GraduationCap size={20} />, label: 'Timetable' },
    { id: 'Projects', icon: <ListTodo size={20} />, label: 'Projects' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">T</span>
        </div>
        <span className="text-xl font-bold text-gray-800 dark:text-gray-100">TaskMaster</span>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1">
        <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Menu</p>
        
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSidebarMenu(item.id)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
              activeSidebarMenu === item.id
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.count !== undefined && item.count > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeSidebarMenu === item.id 
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Settings size={20} /> Settings
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
          <LogOut size={20} /> Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;