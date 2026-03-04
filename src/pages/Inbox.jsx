import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import TaskItem from '../components/TaskItem';
import AddTaskModal from '../components/AddTaskModal';
import { 
  Plus, CalendarDays, Rocket, Trash2, X, Archive,
  UploadCloud, Loader2, Edit3, Check, MapPin, Clock 
} from 'lucide-react';

// ==========================================
// CẤU HÌNH KANBAN BOARD
// ==========================================
const columnBgColors = {
  red: 'bg-red-100/70 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  blue: 'bg-blue-100/70 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  green: 'bg-green-100/70 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  yellow: 'bg-yellow-100/70 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  purple: 'bg-purple-100/70 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  orange: 'bg-orange-100/70 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  pink: 'bg-pink-100/70 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
  teal: 'bg-teal-100/70 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
};

const pickerColors = { red: 'bg-red-500', blue: 'bg-blue-500', green: 'bg-green-500', yellow: 'bg-yellow-500', purple: 'bg-purple-500', orange: 'bg-orange-500', pink: 'bg-pink-500', teal: 'bg-teal-500' };
const colorOptions = Object.keys(pickerColors);

// ==========================================
// THUẬT TOÁN TIMETABLE
// ==========================================
const daysHeader = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};
const calcPosition = (clsStart, clsEnd, sessionStart, sessionEnd) => {
  const startMins = timeToMinutes(clsStart);
  const endMins = timeToMinutes(clsEnd);
  const sStartMins = timeToMinutes(sessionStart);
  const sEndMins = timeToMinutes(sessionEnd);
  if (startMins >= sEndMins || endMins <= sStartMins) return null;
  const sessionDuration = sEndMins - sStartMins;
  const effectiveStart = Math.max(startMins, sStartMins);
  const effectiveEnd = Math.min(endMins, sEndMins);
  const topPercent = ((effectiveStart - sStartMins) / sessionDuration) * 100;
  const heightPercent = ((effectiveEnd - effectiveStart) / sessionDuration) * 100;
  return { top: `${topPercent}%`, height: `${heightPercent}%` };
};
const timetableColorMap = {
  blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  green: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
  orange: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
  red: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
};


const Inbox = () => {
  // STATE ZUSTAND
  const tasks = useTaskStore((state) => state.tasks);
  const columns = useTaskStore((state) => state.columns);
  const addColumn = useTaskStore((state) => state.addColumn);
  const deleteColumn = useTaskStore((state) => state.deleteColumn);
  const reorderColumns = useTaskStore((state) => state.reorderColumns);
  const filterType = useTaskStore((state) => state.filterType);
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const activeSidebarMenu = useTaskStore((state) => state.activeSidebarMenu); 
  const showCompletedTasks = useTaskStore((state) => state.showCompletedTasks);
  const showCompletedColumns = useTaskStore((state) => state.showCompletedColumns);
  
  // STATE KANBAN BOARD
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('yellow');
  const [draggedColId, setDraggedColId] = useState(null);

  // STATE TIMETABLE
  const [timetableStep, setTimetableStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedClasses, setParsedClasses] = useState([]);
  const [sessionTimes, setSessionTimes] = useState({
    morning: { start: '07:00', end: '11:30' },
    afternoon: { start: '13:00', end: '17:30' },
    evening: { start: '18:30', end: '21:00' }
  });

  // --- LOGIC KANBAN ---
  let filteredTasks = filterType === 'All' ? tasks : tasks.filter(task => task.priority === filterType);
  if (!showCompletedTasks) filteredTasks = filteredTasks.filter(task => task.status !== 'completed');
  if (selectedDate) {
    filteredTasks = filteredTasks.filter(task => {
      if (!task.startDate || !task.endDate) return false;
      const checkDate = new Date(selectedDate).setHours(0,0,0,0);
      return checkDate >= new Date(task.startDate).setHours(0,0,0,0) && checkDate <= new Date(task.endDate).setHours(0,0,0,0);
    });
  }

  const processedColumns = columns.map(col => {
    const allTasksInCol = tasks.filter(t => t.columnId === col.id);
    const isCompleted = allTasksInCol.length > 0 && allTasksInCol.every(t => t.status === 'completed');
    
    const displayTasks = filteredTasks
      .filter(t => t.columnId === col.id)
      .sort((a, b) => {
        const isCompletedA = a.status === 'completed' ? 1 : 0;
        const isCompletedB = b.status === 'completed' ? 1 : 0;
        if (isCompletedA !== isCompletedB) return isCompletedA - isCompletedB;
        
        const priorityScore = { 'High': 1, 'Medium': 2, 'Low': 3 };
        return (priorityScore[a.priority] || 4) - (priorityScore[b.priority] || 4);
      });

    return { ...col, isCompleted, displayTasks };
  });

  const activeCols = processedColumns.filter(c => !c.isCompleted);
  const completedCols = processedColumns.filter(c => c.isCompleted);

  const handleOpenTaskModal = (colId) => { setActiveColumnId(colId); setIsTaskModalOpen(true); };
  const handleSaveColumn = () => {
    if (!newColumnTitle.trim()) return;
    addColumn({ title: newColumnTitle, color: newColumnColor });
    setNewColumnTitle(''); setIsAddingColumn(false);
  };
  const handleDeleteColumn = (colId) => {
    if (window.confirm("Bạn có chắc muốn xóa bảng này và toàn bộ công việc bên trong?")) deleteColumn(colId);
  };

  // --- LOGIC TIMETABLE ---
  const sampleAIData = [
    { id: 1, subject: 'Cấu trúc dữ liệu', day: 'Thứ 2', startTime: '07:00', endTime: '09:15', room: 'A101', color: 'blue' },
    { id: 2, subject: 'Toán rời rạc', day: 'Thứ 3', startTime: '09:30', endTime: '11:15', room: 'B202', color: 'green' },
    { id: 3, subject: 'Cơ sở dữ liệu', day: 'Thứ 4', startTime: '13:00', endTime: '15:15', room: 'Lab 3', color: 'purple' },
    { id: 4, subject: 'Triết học', day: 'Thứ 6', startTime: '07:00', endTime: '08:45', room: 'C303', color: 'orange' },
    { id: 5, subject: 'Lập trình Web', day: 'Thứ 6', startTime: '08:50', endTime: '11:15', room: 'Lab 1', color: 'red' },
    { id: 6, subject: 'Anh văn Giao tiếp', day: 'Thứ 7', startTime: '18:30', endTime: '20:30', room: 'Tầng 4', color: 'blue' },
  ];
  const handleSimulateAIUpload = () => {
    setIsUploading(true);
    setTimeout(() => { setParsedClasses(sampleAIData); setIsUploading(false); setTimetableStep(2); }, 1500);
  };
  const handleEditClass = (id, field, value) => { setParsedClasses(classes => classes.map(cls => cls.id === id ? { ...cls, [field]: value } : cls)); };
  const handleDeleteClass = (id) => setParsedClasses(classes => classes.filter(cls => cls.id !== id));
  const handleAddClass = () => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setParsedClasses([...parsedClasses, { id: Date.now(), subject: 'Môn học mới', day: 'Thứ 2', startTime: '07:00', endTime: '09:00', room: 'Phòng...', color: randomColor }]);
  };
  const handleSessionChange = (session, field, value) => { setSessionTimes(prev => ({ ...prev, [session]: { ...prev[session], [field]: value } })); };
  
  // --- NÚT ĐIỀU HƯỚNG BƯỚC TIMETABLE (Đã fix lỗi bị giấu) ---
  const handleConfirmTimetable = () => setTimetableStep(3);
  const handleBackToStep1 = () => setTimetableStep(1);
  const handleBackToStep2 = () => setTimetableStep(2);


  // --- COMPONENT RENDER 1 BẢNG KANBAN ---
  const renderColumn = (col, isActive) => {
    const bgColorClass = columnBgColors[col.color] || columnBgColors.yellow;
    const isDragging = draggedColId === col.id;

    return (
      <div 
        key={col.id} draggable={isActive} 
        onDragStart={() => setDraggedColId(col.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (draggedColId && draggedColId !== col.id) reorderColumns(draggedColId, col.id);
          setDraggedColId(null);
        }}
        // Vẫn giữ tính năng Kéo giãn chiều dài/rộng (resize)
        className={`shrink-0 rounded-xl p-4 flex flex-col border transition-colors duration-300 ${bgColorClass} 
          w-80 min-w-[280px] max-w-[1000px] h-fit min-h-[200px] resize overflow-auto relative
          ${isDragging ? 'opacity-50 scale-95 border-dashed' : 'opacity-100'} 
          ${!isActive ? 'grayscale opacity-70' : 'cursor-grab active:cursor-grabbing'}`
        }
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className={`font-bold text-lg px-1 ${!isActive ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-gray-100'}`}>{col.title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md font-medium text-gray-700 dark:text-gray-300">{col.displayTasks.length}</span>
            <button onClick={() => handleDeleteColumn(col.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
          </div>
        </div>
        
        {isActive && (
          <button onClick={() => handleOpenTaskModal(col.id)} className="w-full shrink-0 flex items-center justify-center gap-2 py-2.5 mb-4 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 border border-transparent hover:border-blue-300 dark:hover:border-blue-700 rounded-lg text-gray-600 dark:text-gray-300 transition-all font-medium text-sm shadow-sm">
            <Plus size={16} /> Thêm công việc
          </button>
        )}

        <div className="flex flex-col flex-1 pb-1">
          {col.displayTasks.map(task => <TaskItem key={task.id} task={task} />)}
          {col.displayTasks.length === 0 && <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 font-medium italic">Chưa có công việc nào</p>}
        </div>
      </div>
    );
  };

  return (
    // FIX: Thay "overflow-hidden" thành "min-h-full" để thanh cuộn dọc (đường màu đỏ) hoạt động
    <div className="p-8 min-h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 transition-colors">
          {activeSidebarMenu === 'Timetable' && 'University Schedule'}
          {activeSidebarMenu === 'Projects' && 'Your Projects'}
        </h2>
        {selectedDate && (
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors">
            <CalendarDays size={16} /> 
            <span className="text-sm font-medium">Date: {new Date(selectedDate).toLocaleDateString('en-GB')}</span>
          </div>
        )}
      </div>

      {/* ===== KHU VỰC 1: KANBAN BOARD ===== */}
      {activeSidebarMenu === 'Inbox' && (
        // FIX: Bỏ khóa chiều cao h-[80%] và h-[20%], để flex-col đẩy dữ liệu tự nhiên
        <div className="flex-1 flex flex-col gap-8 pb-8">
          
          {/* Vùng Bảng Đang Làm */}
          <div className="flex overflow-x-auto gap-6 items-start pb-4 pr-4 min-h-[50vh]">
            {activeCols.map(col => renderColumn(col, true))}

            <div className="shrink-0 flex items-start pt-2">
              {!isAddingColumn ? (
                <button onClick={() => setIsAddingColumn(true)} className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105" title="Thêm bảng mới"><Plus size={28} /></button>
              ) : (
                <div className="w-80 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl">
                  <input type="text" autoFocus placeholder="Nhập tên bảng..." value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent dark:text-white mb-4 font-medium" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Chọn màu sắc:</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {colorOptions.map(color => (
                      <button key={color} onClick={() => setNewColumnColor(color)} className={`w-6 h-6 rounded-full ${pickerColors[color]} transition-transform ${newColumnColor === color ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800 scale-110' : 'hover:scale-110'}`} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveColumn} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 font-medium transition-colors">Lưu bảng</button>
                    <button onClick={() => setIsAddingColumn(false)} className="px-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"><X size={20} /></button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vùng Bảng Đã Xong (Tự động rớt xuống dưới cùng nhờ luồng flex-col) */}
          {showCompletedColumns && completedCols.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col shrink-0">
              <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-4 flex items-center gap-2 shrink-0"><Archive size={18} /> Bảng đã hoàn thành</h3>
              <div className="flex overflow-x-auto gap-6 items-start pb-2 pr-4">
                {completedCols.map(col => renderColumn(col, false))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== KHU VỰC 2: TIMETABLE ===== */}
      {activeSidebarMenu === 'Timetable' && (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><Clock className="text-blue-500" /> Time-based Schedule</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{timetableStep === 3 ? 'Grid View' : `Step ${timetableStep} of 3`}</p>
            </div>
          </div>

          <div className="p-6">
            {timetableStep === 1 && (
              <div className="py-12 text-center flex flex-col items-center">
                <div className="w-full max-w-md border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={handleSimulateAIUpload}>
                  <UploadCloud size={48} className="text-blue-400 mx-auto mb-4" />
                  <h4 className="text-gray-800 dark:text-gray-200 font-bold mb-2">Tải ảnh Thời khóa biểu</h4>
                  <button disabled={isUploading} className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2 mx-auto w-48">
                    {isUploading ? <><Loader2 className="animate-spin" size={18} /> Đang quét...</> : 'Chọn ảnh'}
                  </button>
                </div>
              </div>
            )}

            {timetableStep === 2 && (
              <div>
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2"><Clock size={16} className="text-gray-400"/> Cấu hình Thời gian các Buổi</h4>
                  <div className="flex flex-wrap gap-4">
                    {['morning', 'afternoon', 'evening'].map((session, idx) => (
                      <div key={session} className="flex-1 min-w-[150px] bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{idx === 0 ? 'Sáng' : idx === 1 ? 'Chiều' : 'Tối'}</p>
                        <div className="flex items-center gap-2">
                          <input type="time" className="w-full bg-gray-50 dark:bg-gray-900 text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700" value={sessionTimes[session].start} onChange={(e) => handleSessionChange(session, 'start', e.target.value)} />
                          <span className="text-gray-400">-</span>
                          <input type="time" className="w-full bg-gray-50 dark:bg-gray-900 text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700" value={sessionTimes[session].end} onChange={(e) => handleSessionChange(session, 'end', e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex gap-2 px-2 text-xs font-semibold text-gray-500 uppercase">
                     <div className="w-6"></div><div className="flex-1">Môn học</div><div className="w-20">Ngày</div>
                     <div className="w-24">Giờ Bắt đầu</div><div className="w-24">Giờ Kết thúc</div><div className="w-24">Phòng</div><div className="w-6"></div>
                  </div>
                  {parsedClasses.map((cls) => (
                    <div key={cls.id} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Edit3 size={16} className="text-gray-400 shrink-0" />
                      <input className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm dark:text-gray-200" value={cls.subject} onChange={(e) => handleEditClass(cls.id, 'subject', e.target.value)} />
                      <select className="w-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1 py-1.5 text-sm dark:text-gray-200" value={cls.day} onChange={(e) => handleEditClass(cls.id, 'day', e.target.value)}>{daysHeader.map(d=><option key={d}>{d}</option>)}</select>
                      <input type="time" className="w-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm dark:text-gray-200 text-center" value={cls.startTime} onChange={(e) => handleEditClass(cls.id, 'startTime', e.target.value)} />
                      <input type="time" className="w-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm dark:text-gray-200 text-center" value={cls.endTime} onChange={(e) => handleEditClass(cls.id, 'endTime', e.target.value)} />
                      <input className="w-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-sm dark:text-gray-200" value={cls.room} onChange={(e) => handleEditClass(cls.id, 'room', e.target.value)} />
                      <button onClick={() => handleDeleteClass(cls.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>

                <button onClick={handleAddClass} className="mb-8 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline p-2"><Plus size={16} /> Thêm môn học</button>

                {/* --- CÁC NÚT ĐIỀU HƯỚNG --- */}
                <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 pt-6 mt-4">
                  <button onClick={handleBackToStep1} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors">Quay lại tải ảnh</button>
                  <button onClick={handleConfirmTimetable} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"><Check size={18} /> Chốt thời khóa biểu</button>
                </div>
              </div>
            )}

            {timetableStep === 3 && (
              <div className="overflow-x-auto">
                {/* --- NÚT ĐIỀU HƯỚNG QUAY LẠI --- */}
                <div className="flex justify-end mb-4">
                   <button onClick={handleBackToStep2} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-md"><Edit3 size={14} /> Chỉnh sửa thời gian</button>
                </div>

                <div className="flex flex-col border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 text-sm min-w-[800px]">
                  
                  <div className="flex bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-200">
                    <div className="w-[50px] border-r border-gray-300 dark:border-gray-600 p-2 text-center">Buổi</div>
                    <div className="w-[80px] border-r border-gray-300 dark:border-gray-600 p-2 text-center">Thời gian</div>
                    {daysHeader.map(day => (
                      <div key={day} className="flex-1 border-r last:border-0 border-gray-300 dark:border-gray-600 p-2 text-center">{day}</div>
                    ))}
                  </div>

                  {[
                    { id: 'morning', label: 'SÁNG', times: sessionTimes.morning },
                    { id: 'afternoon', label: 'CHIỀU', times: sessionTimes.afternoon },
                    { id: 'evening', label: 'TỐI', times: sessionTimes.evening }
                  ].map((session) => {
                    
                    const durationMins = timeToMinutes(session.times.end) - timeToMinutes(session.times.start);
                    const minHeightPx = Math.max(150, durationMins); 

                    return (
                      <div key={session.id} className="flex border-b last:border-0 border-gray-300 dark:border-gray-600" style={{ minHeight: `${minHeightPx}px` }}>
                        
                        <div className="w-[50px] border-r border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                          <span className="font-bold text-gray-400 dark:text-gray-500 [writing-mode:vertical-rl] rotate-180 tracking-widest">{session.label}</span>
                        </div>
                        
                        <div className="w-[80px] border-r border-gray-300 dark:border-gray-600 flex flex-col items-center justify-between py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500">
                          <span>{session.times.start}</span>
                          <div className="flex-1 w-px bg-gray-300 dark:bg-gray-600 my-2"></div>
                          <span>{session.times.end}</span>
                        </div>

                        {daysHeader.map((day) => {
                          const classesInThisBlock = parsedClasses.filter(cls => cls.day === day);

                          return (
                            <div key={day} className="flex-1 border-r last:border-0 border-gray-200 dark:border-gray-700 relative bg-white dark:bg-gray-900">
                              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(transparent 50%, #e5e7eb 50%)', backgroundSize: '100% 40px' }}></div>
                              
                              {classesInThisBlock.map(cls => {
                                 const pos = calcPosition(cls.startTime, cls.endTime, session.times.start, session.times.end);
                                 if (!pos) return null; 

                                 const colorClass = timetableColorMap[cls.color] || timetableColorMap.blue;

                                 return (
                                   <div 
                                     key={cls.id}
                                     className={`absolute left-1 right-1 p-2 rounded-lg border ${colorClass} shadow-sm overflow-hidden hover:shadow-md transition-all z-10 cursor-pointer flex flex-col`}
                                     style={{ top: pos.top, height: pos.height, minHeight: '40px' }} 
                                   >
                                      <h5 className="font-bold text-xs leading-tight line-clamp-2">{cls.subject}</h5>
                                      <div className="text-[10px] opacity-80 mt-1 flex items-center gap-1 truncate"><MapPin size={10} className="shrink-0"/> {cls.room}</div>
                                      <div className="text-[10px] opacity-80 mt-auto pt-1 font-medium truncate">{cls.startTime} - {cls.endTime}</div>
                                   </div>
                                 )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== KHU VỰC 3: PROJECTS ===== */}
      {activeSidebarMenu === 'Projects' && (
        <div className="text-center py-16 text-gray-500"><Rocket size={48} className="text-blue-400 mx-auto mb-4" /><h3>Projects Module</h3></div>
      )}

      <AddTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} targetColumnId={activeColumnId} />
    </div>
  );
};

export default Inbox;