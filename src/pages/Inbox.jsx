import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import TaskItem from '../components/TaskItem';
import AddTaskModal from '../components/AddTaskModal';
import { 
  Plus, AlertTriangle, Calendar as CalIcon, Inbox as InboxIcon, 
  CheckCircle2, CalendarDays, Rocket, GraduationCap, 
  UploadCloud, Loader2, Edit3, Check, Trash2, MapPin, Clock
} from 'lucide-react';

const Inbox = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const filterType = useTaskStore((state) => state.filterType);
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const activeSidebarMenu = useTaskStore((state) => state.activeSidebarMenu); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==========================================
  // STATE TIMETABLE (CHUẨN THỜI GIAN THỰC)
  // ==========================================
  const [timetableStep, setTimetableStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedClasses, setParsedClasses] = useState([]);

  const [sessionTimes, setSessionTimes] = useState({
    morning: { start: '07:00', end: '11:30' },
    afternoon: { start: '13:00', end: '17:30' },
    evening: { start: '18:30', end: '21:00' }
  });

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
    setTimeout(() => {
      setParsedClasses(sampleAIData);
      setIsUploading(false);
      setTimetableStep(2);
    }, 1500);
  };

  const handleEditClass = (id, field, value) => {
    setParsedClasses(classes => classes.map(cls => cls.id === id ? { ...cls, [field]: value } : cls));
  };

  const handleDeleteClass = (id) => {
    setParsedClasses(classes => classes.filter(cls => cls.id !== id));
  };

  const handleAddClass = () => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setParsedClasses([...parsedClasses, {
      id: Date.now(), subject: 'Môn học mới', day: 'Thứ 2', startTime: '07:00', endTime: '09:00', room: 'Phòng...', color: randomColor
    }]);
  };

  const handleSessionChange = (session, field, value) => {
    setSessionTimes(prev => ({
      ...prev,
      [session]: { ...prev[session], [field]: value }
    }));
  };

  const handleConfirmTimetable = () => {
    setTimetableStep(3);
  };

  // ==========================================
  // THUẬT TOÁN TÍNH TỌA ĐỘ (% THEO THỜI GIAN)
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

  const colorMap = {
    blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    green: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
    purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    orange: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
    red: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  };

  // ==========================================
  // LỌC INBOX
  // ==========================================
  let filteredTasks = filterType === 'All' ? tasks : tasks.filter(task => task.priority === filterType);
  if (selectedDate) {
    filteredTasks = filteredTasks.filter(task => {
      if (!task.startDate || !task.endDate) return false;
      const checkDate = new Date(selectedDate).setHours(0,0,0,0);
      const start = new Date(task.startDate).setHours(0,0,0,0);
      const end = new Date(task.endDate).setHours(0,0,0,0);
      return checkDate >= start && checkDate <= end;
    });
  }
  const overdueTasks = filteredTasks.filter(t => t.status === 'overdue');
  const todayTasks = filteredTasks.filter(t => t.status === 'today');
  const nextTasks = filteredTasks.filter(t => t.status === 'next');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  return (
    <div className="p-8 max-w-3xl relative">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 transition-colors">
        {activeSidebarMenu === 'Inbox' && 'All Your Tasks'}
        {activeSidebarMenu === 'Timetable' && 'University Schedule'}
        {activeSidebarMenu === 'Projects' && 'Your Projects'}
      </h2>

      {/* ===== KHU VỰC 1: INBOX ===== */}
      {activeSidebarMenu === 'Inbox' && (
        <>
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"><Plus size={20} /> Add New Task</button>
            {selectedDate && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors">
                <CalendarDays size={16} /> 
                {/* FIX TẠI ĐÂY: Bọc selectedDate vào new Date() */}
                <span className="text-sm font-medium">Date: {new Date(selectedDate).toLocaleDateString('en-GB')}</span>
              </div>
            )}
          </div>
          {filteredTasks.length === 0 && (<div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 transition-colors"><p>No tasks found.</p></div>)}
          {overdueTasks.length > 0 && (<div className="mb-8"><h3 className="text-red-500 font-bold flex items-center gap-2 mb-4"><AlertTriangle size={18} /> Overdue</h3>{overdueTasks.map(task => <TaskItem key={task.id} task={task} />)}</div>)}
          {todayTasks.length > 0 && (<div className="mb-8"><h3 className="text-gray-800 dark:text-gray-200 font-bold flex items-center gap-2 mb-4 transition-colors"><CalIcon size={18} className="text-blue-500" /> Today</h3>{todayTasks.map(task => <TaskItem key={task.id} task={task} />)}</div>)}
          {nextTasks.length > 0 && (<div className="mb-8"><h3 className="text-gray-800 dark:text-gray-200 font-bold flex items-center gap-2 mb-4 transition-colors"><InboxIcon size={18} className="text-gray-400" /> Next</h3>{nextTasks.map(task => <TaskItem key={task.id} task={task} />)}</div>)}
          {completedTasks.length > 0 && (<div className="mt-12"><h3 className="text-green-600 font-bold flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 transition-colors"><CheckCircle2 size={18} /> Completed</h3>{completedTasks.map(task => <TaskItem key={task.id} task={task} />)}</div>)}
        </>
      )}

      {/* ===== KHU VỰC 2: TIMETABLE ===== */}
      {activeSidebarMenu === 'Timetable' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
          
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2"><Clock className="text-blue-500" /> Time-based Schedule</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{timetableStep === 3 ? 'Grid View' : `Step ${timetableStep} of 3`}</p>
            </div>
          </div>

          {/* BƯỚC 1 */}
          {timetableStep === 1 && (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-full max-w-md border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={handleSimulateAIUpload}>
                <UploadCloud size={48} className="text-blue-400 mx-auto mb-4" />
                <h4 className="text-gray-800 dark:text-gray-200 font-bold mb-2">Tải ảnh Thời khóa biểu</h4>
                <button disabled={isUploading} className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2 mx-auto w-48">
                  {isUploading ? <><Loader2 className="animate-spin" size={18} /> Đang quét...</> : 'Chọn ảnh'}
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 2 */}
          {timetableStep === 2 && (
            <div className="p-6">
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

              <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                <button onClick={() => setTimetableStep(1)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors">Quay lại</button>
                <button onClick={handleConfirmTimetable} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"><Check size={18} /> Chốt thời khóa biểu</button>
              </div>
            </div>
          )}

          {/* BƯỚC 3 */}
          {timetableStep === 3 && (
            <div className="p-6 overflow-x-auto">
              <div className="flex justify-end mb-4">
                 <button onClick={() => setTimetableStep(2)} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-md"><Edit3 size={14} /> Chỉnh sửa</button>
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

                               const colorClass = colorMap[cls.color] || colorMap.blue;

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
      )}

      {/* ===== KHU VỰC 3: PROJECTS ===== */}
      {activeSidebarMenu === 'Projects' && (
        <div className="text-center py-16 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-100"><Rocket size={48} className="text-blue-400 mx-auto mb-4" /><h3>Projects Module</h3></div>
      )}
      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Inbox;