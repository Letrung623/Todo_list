import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTaskStore = create(
  persist(
    (set) => ({
      columns: [
        { id: 'col-1', title: 'tên công việc', color: 'yellow' },
      ],
      tasks: [],
      
      filterType: 'All', 
      selectedDate: null,
      isDarkMode: false,
      activeSidebarMenu: 'Inbox',
      
      showCompletedTasks: true,
      toggleShowCompletedTasks: () => set((state) => ({ showCompletedTasks: !state.showCompletedTasks })),

      // STATE MỚI: Ẩn/Hiện Bảng đã hoàn thành
      showCompletedColumns: true,
      toggleShowCompletedColumns: () => set((state) => ({ showCompletedColumns: !state.showCompletedColumns })),

      setActiveSidebarMenu: (menu) => set({ activeSidebarMenu: menu }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setFilterType: (type) => set({ filterType: type }),

      toggleSelectedDate: (date) => set((state) => {
        if (state.selectedDate && date.toDateString() === new Date(state.selectedDate).toDateString()) {
          return { selectedDate: null };
        }
        return { selectedDate: date };
      }),

      addColumn: (newColumn) => set((state) => ({
        columns: [...state.columns, { id: `col-${Date.now()}`, ...newColumn }]
      })),

      deleteColumn: (id) => set((state) => ({
        columns: state.columns.filter(col => col.id !== id),
        tasks: state.tasks.filter(task => task.columnId !== id) 
      })),

      // HÀM MỚI: Đổi vị trí cột (Kéo thả)
      reorderColumns: (dragId, dropId) => set((state) => {
        const dragIndex = state.columns.findIndex(c => c.id === dragId);
        const dropIndex = state.columns.findIndex(c => c.id === dropId);
        if (dragIndex === -1 || dropIndex === -1 || dragIndex === dropIndex) return state;
        
        const newColumns = [...state.columns];
        const [draggedItem] = newColumns.splice(dragIndex, 1);
        newColumns.splice(dropIndex, 0, draggedItem);
        
        return { columns: newColumns };
      }),

      addTask: (newTask) => set((state) => ({
        tasks: [{ id: Date.now(), status: 'pending', ...newTask }, ...state.tasks]
      })),

      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } : task
        )
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      })),
    }),
    {
      name: 'taskmaster-storage',
    }
  )
);