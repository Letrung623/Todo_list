import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const todayStr = new Date().toISOString().split('T')[0];

export const useTaskStore = create(
  persist(
    (set) => ({
      tasks: [
        { id: 1, title: 'Fix database connection timeout error', subtitle: 'Users are reporting intermittent 504 errors on login.', priority: 'High', location: 'Server Room', status: 'overdue', startDate: '2026-02-20', endDate: '2026-02-24' },
        { id: 2, title: 'Draft quarterly marketing report', subtitle: '', priority: 'Medium', location: 'Meeting Room A', status: 'today', startDate: todayStr, endDate: todayStr },
        { id: 3, title: 'Update team roster', subtitle: '', priority: 'Low', location: 'HR Office', status: 'today', startDate: todayStr, endDate: '2026-02-28' },
        { id: 4, title: 'Review Q4 Budget Proposals', subtitle: '', priority: '', location: 'Online', status: 'next', startDate: '2026-03-01', endDate: '2026-03-05' },
        { id: 5, title: 'Client Presentation: Alpha Corp', subtitle: '', priority: 'High', location: 'Client HQ', status: 'next', startDate: '2026-03-02', endDate: '2026-03-10' },
      ],
      stats: { completed: 12, pending: 4, percentage: 75 },
      
      filterType: 'All', 
      selectedDate: null,
      isDarkMode: false,
      
      // HÀM MỚI: Quản lý Menu bên trái
      activeSidebarMenu: 'Inbox',
      setActiveSidebarMenu: (menu) => set({ activeSidebarMenu: menu }),

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, status: task.status === 'completed' ? 'today' : 'completed' } : task
        )
      })),

      addTask: (newTask) => set((state) => ({
        tasks: [{ id: Date.now(), status: 'today', ...newTask }, ...state.tasks]
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      })),

      setFilterType: (type) => set({ filterType: type }),

      toggleSelectedDate: (date) => set((state) => {
        if (state.selectedDate && date.toDateString() === new Date(state.selectedDate).toDateString()) {
          return { selectedDate: null };
        }
        return { selectedDate: date };
      }),
    }),
    {
      name: 'taskmaster-storage',
    }
  )
);