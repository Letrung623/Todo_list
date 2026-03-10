/* ==========================================================================
   FILE: js/kanban.js
   CÔNG DỤNG: Xử lý logic Kanban (Đã nối thẳng ống nước vào SQL Server)
   ========================================================================== */
import { openModal, closeModal } from './app.js';
import { updateWidgets } from './widgets.js';
import { API } from './api.js';
import { db } from './mockData.js';


// 1. TRẠNG THÁI TOÀN CỤC (Thay thế hoàn toàn file mockData.js cũ)
export let currentFilter = 'all';
export let currentDateFilter = null;
export let currentBoards = [];
export let currentTasks = [];

// Giả lập cấu hình Settings vì chưa có Backend cho phần này
export let settings = {
    hideCompletedTasks: false,
    hideCompletedBoards: false,
    enableTaskDragDrop: false
};

export function initKanban() {
    setupFilters();
    setupForms();
    setupSettingsToggle();
    loadDataAndRenderKanban(); // Gọi API kéo dữ liệu ngay khi mở web
}

// ==========================================
// KHU VỰC GIAO TIẾP LẤY DỮ LIỆU TỪ BACKEND
// ==========================================
export async function loadDataAndRenderKanban() {
    try {
        // Lấy Bảng của User 1 (Tài khoản nháp)
        currentBoards = await API.getBoards(1);
        if (!currentBoards) currentBoards = [];

        // Lấy Công việc của từng Bảng
        currentTasks = [];
        for (const board of currentBoards) {
            const tasks = await API.getTasks(board.BoardID);
            if (tasks) currentTasks = currentTasks.concat(tasks);
        }
        
        // Có Data thật rồi thì vẽ lên màn hình thôi!
        renderKanban();
    } catch (error) {
        console.error("Lỗi tải dữ liệu Backend:", error);
    }
}

// ==========================================
// KHU VỰC VẼ GIAO DIỆN KANBAN
// ==========================================
export function renderKanban() {
    const activeContainer = document.getElementById('active-boards-container');
    const completedContainer = document.getElementById('completed-boards-container');
    if (!activeContainer || !completedContainer) return;

    activeContainer.innerHTML = '';
    completedContainer.innerHTML = '';

    const activeBoards = [];
    const completedBoards = [];

    // Sắp xếp bảng theo OrderIndex từ Database
    currentBoards.sort((a, b) => a.OrderIndex - b.OrderIndex).forEach(board => {
        let boardTasks = currentTasks.filter(t => t.BoardID === board.BoardID);

        // --- TẦNG LỌC 1: ĐỘ ƯU TIÊN ---
        if (currentFilter !== 'all') boardTasks = boardTasks.filter(t => t.PriorityLevel === currentFilter);
        if (settings.hideCompletedTasks) boardTasks = boardTasks.filter(t => t.Status !== 'completed');
        if (currentFilter !== 'all' && boardTasks.length === 0) {
            return; 
        }
        // --- TẦNG LỌC 2: ẨN TASK ĐÃ XONG THEO LỊCH ---
        if (currentDateFilter) {
            boardTasks = boardTasks.filter(t => {
                if (!t.StartDate && !t.EndDate) return false;
                const start = t.StartDate || t.EndDate;
                const end = t.EndDate || t.StartDate;
                return currentDateFilter >= start && currentDateFilter <= end;
            });
        }

        // --- TẦNG LỌC 3: LỊCH TRỐNG THÌ BỎ QUA BẢNG ---
        if (currentDateFilter && boardTasks.length === 0) {
            return;
        }

        // --- LOGIC SẮP XẾP TASK ---
        if (!settings.enableTaskDragDrop) {
            const priorityWeight = { 'high': 3, 'medium': 2, 'low': 1 };
            boardTasks.sort((a, b) => {
                if (a.Status !== b.Status) return a.Status === 'completed' ? 1 : -1;
                return priorityWeight[b.PriorityLevel] - priorityWeight[a.PriorityLevel];
            });
        }

        const isBoardCompleted = boardTasks.length > 0 && boardTasks.every(t => t.Status === 'completed');
        
        const boardHTML = createBoardHTML(board, boardTasks);

        if (isBoardCompleted) completedBoards.push(boardHTML);
        else activeBoards.push(boardHTML);
    });

    activeContainer.innerHTML = activeBoards.join('');

    const completedArea = document.getElementById('completed-area-wrapper');
    if (settings.hideCompletedBoards || completedBoards.length === 0) {
        completedArea.classList.add('hidden');
    } else {
        completedArea.classList.remove('hidden');
        completedContainer.innerHTML = completedBoards.join('');
    }

    attachBoardEvents();
    setupDragAndDrop();
    if (typeof updateWidgets === 'function') updateWidgets();
}

function createBoardHTML(board, tasks) {
    const tasksHTML = tasks.map(t => createTaskHTML(t)).join('');
    return `
        <div class="board-column" data-board-id="${board.BoardID}" draggable="true" style="background-color: var(--${board.Color});">
            <div class="board-header">
                <span class="board-title" style="color: var(--text-main);">${board.Title}</span>
                <div class="board-actions">
                    <span style="font-size: 12px; font-weight: 600; margin-right: 8px;">${tasks.length}</span>
                    <div class="action-menu">
                        <i class="fa-solid fa-ellipsis-vertical action-menu-icon"></i>
                        <div class="menu-content">
                            <button class="action-btn btn-edit btn-edit-board" data-id="${board.BoardID}"><i class="fa-solid fa-pen"></i></button>
                            <button class="action-btn btn-delete btn-delete-board" data-id="${board.BoardID}"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="board-task-list" data-board-id="${board.BoardID}">${tasksHTML}</div>
            <div class="board-footer">
                <button class="btn-add-task-board" data-board-id="${board.BoardID}">
                    <i class="fa-solid fa-plus"></i> Thêm công việc
                </button>
            </div>
        </div>
    `;
}

function createTaskHTML(task) {
    const isCompleted = task.Status === 'completed';
    const checkedHtml = isCompleted ? 'checked' : '';
    const classCompleted = isCompleted ? 'completed' : '';
    const isDraggable = 'draggable="true"';

    let timeHtml = '';
    if (task.StartDate || task.EndDate) {
        const formatDate = (dateStr) => {
            if (!dateStr) return '...';
            const parts = dateStr.split('-');
            return `${parts[2]}/${parts[1]}`;
        };

        const startStr = formatDate(task.StartDate);
        const endStr = formatDate(task.EndDate);
        const displayTime = (task.StartDate === task.EndDate) ? startStr : `${startStr} - ${endStr}`;

        timeHtml = `
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px; font-weight: 500; display: flex; align-items: center; gap: 4px;">
                <i class="fa-regular fa-clock"></i> ${displayTime}
            </div>
        `;
    }

    return `
        <div class="task-card ${classCompleted}" data-task-id="${task.TaskID}" ${isDraggable}>
            <div class="task-checkbox-wrap">
                <input type="checkbox" class="toggle-task-status" data-task-id="${task.TaskID}" ${checkedHtml}>
            </div>
            <div class="task-content">
                <div style="display: flex; justify-content: space-between;">
                    <h4 class="task-title">${task.Title}</h4>
                    <div class="action-menu">
                        <i class="fa-solid fa-ellipsis-vertical action-menu-icon" style="font-size: 12px;"></i>
                        <div class="menu-content" style="top: 14px;">
                            <button class="action-btn btn-edit btn-edit-task" data-id="${task.TaskID}"><i class="fa-solid fa-pen"></i></button>
                            <button class="action-btn btn-delete btn-delete-task" data-id="${task.TaskID}"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
                ${task.Description ? `<p class="task-desc">${task.Description}</p>` : ''}
                
                ${timeHtml} <div class="task-tags">
                    <span class="tag tag-${task.PriorityLevel === 'medium' ? 'med' : task.PriorityLevel}">${task.PriorityLevel}</span>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// KHU VỰC BẮT SỰ KIỆN CLICKS VÀ GỌI API
// ==========================================
function attachBoardEvents() {
    const kanbanView = document.getElementById('view-kanban');
    // TÍCH CHECKBOX: Đã nối thẳng vào SQL Server bằng PATCH
    kanbanView.querySelectorAll('.toggle-task-status').forEach(checkbox => {
        checkbox.addEventListener('change', async (e) => {
            const taskId = parseInt(e.target.dataset.taskId);
            const newStatus = e.target.checked ? 'completed' : 'pending';
            
            // Gọi API báo cho Backend biết trạng thái mới
            await API.updateTaskStatus(taskId, newStatus);
            
            // Render lại màn hình để nó gạch ngang chữ hoặc chuyển sang cột Completed
            await loadDataAndRenderKanban(); 
        });
    });

    // NÚT XÓA BẢNG: Báo lỗi do Backend chưa có API
    kanbanView.querySelectorAll('.btn-delete-board').forEach(btn => btn.addEventListener('click', (e) => {
        alert('Chức năng Xóa Bảng đang chờ thầy trò mình xây API Backend ở bài sau nhé!');
    }));

    // NÚT XÓA TASK: Đã nối API DELETE
    kanbanView.querySelectorAll('.btn-delete-task').forEach(btn => btn.addEventListener('click', async (e) => {
        if(confirm("Bạn có chắc muốn xóa công việc này khỏi SQL Server không?")) {
            const taskId = e.currentTarget.dataset.id;
            try {
                await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}`, { method: 'DELETE' });
                // Xóa xong thì làm tươi lại trang
                loadDataAndRenderKanban(); 
            } catch (error) {
                console.error("Lỗi xóa task:", error);
            }
        }
    }));

    // NÚT MỞ FORM SỬA BẢNG
    kanbanView.querySelectorAll('.btn-edit-board').forEach(btn => btn.addEventListener('click', (e) => {
        const boardId = parseInt(e.currentTarget.dataset.id);
        const board = currentBoards.find(b => b.BoardID === boardId);
        if(board) {
            document.getElementById('edit-board-id').value = board.BoardID;
            document.getElementById('board-title').value = board.Title;
            openModal(document.getElementById('modal-add-board'));
        }
    }));

    // NÚT MỞ FORM SỬA TASK
    kanbanView.querySelectorAll('.btn-edit-task').forEach(btn => btn.addEventListener('click', (e) => {
        const taskId = parseInt(e.currentTarget.dataset.id);
        const task = currentTasks.find(t => t.TaskID === taskId);
        if(task) {
            document.getElementById('edit-task-id').value = task.TaskID;
            document.getElementById('task-board-id').value = task.BoardID;
            document.getElementById('task-title').value = task.Title;
            document.getElementById('task-desc').value = task.Description || '';
            document.getElementById('task-priority').value = task.PriorityLevel;
            document.getElementById('task-start-date').value = task.StartDate || '';
            document.getElementById('task-end-date').value = task.EndDate || '';
            openModal(document.getElementById('modal-add-task'));
        }
    }));

    // NÚT THÊM TASK VÀO ĐÚNG BẢNG ĐÓ
    kanbanView.querySelectorAll('.btn-add-task-board').forEach(btn => btn.addEventListener('click', (e) => {
        document.getElementById('task-board-id').value = e.currentTarget.dataset.boardId;
        document.getElementById('edit-task-id').value = ''; 
        document.getElementById('form-add-task').reset();
        openModal(document.getElementById('modal-add-task'));
    }));
}



function setupForms() {
    // ========================================================
    // 0. BẮT SỰ KIỆN MỞ MODAL CHO NÚT "THÊM CỘT MỚI" (DÒNG MỚI THÊM)
    // ========================================================
    // Tìm cái nút có class .btn-primary (nút Thêm Cột Mới ở góc trên)
    const btnOpenAddBoard = document.querySelector('.btn-primary'); 
    if (btnOpenAddBoard) {
        btnOpenAddBoard.addEventListener('click', () => {
            document.getElementById('form-add-board').reset(); // Xóa trắng form cũ
            document.getElementById('edit-board-id').value = ''; // Báo hiệu là Tạo mới
            openModal(document.getElementById('modal-add-board')); // Hiện Modal lên
        });
    }
    // FORM ĐỔI MÀU GIAO DIỆN
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
        });
    });

    // FORM THÊM BẢNG DỰ ÁN MỚI
    document.getElementById('form-add-board')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('edit-board-id').value;
        const title = document.getElementById('board-title').value;
        const color = `pastel-${document.querySelector('.color-option.selected')?.dataset.color || 'blue'}`;

        if(editId) {
            await API.updateBoard(editId, { Title: title, Color: color, OrderIndex: 0 });
            await loadDataAndRenderKanban();
        } else {
            // TẠO BẢNG MỚI BẰNG API
            try {
                await fetch('http://127.0.0.1:8000/api/boards/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ UserID: 1, Title: title, Color: color, OrderIndex: currentBoards.length + 1 })
                });
                await loadDataAndRenderKanban(); // Làm tươi màn hình
            } catch (err) { console.error("Lỗi tạo bảng:", err); }
        }
        closeModal(document.getElementById('modal-add-board'));
        e.target.reset(); document.getElementById('edit-board-id').value = '';
    });

    // FORM THÊM TASK MỚI (Dùng api.js)
    document.getElementById('form-add-task')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('edit-task-id').value;
        
        const title = document.getElementById('task-title').value;
        const desc = document.getElementById('task-desc').value;
        const priority = document.getElementById('task-priority').value;
        const startDate = document.getElementById('task-start-date').value;
        const endDate = document.getElementById('task-end-date').value;
        
        if(editId) {
            // SỬA TASK (GỌI API PUT)
            const updateTaskData = {
                Title: title,
                Description: desc ? desc : null,
                PriorityLevel: priority,
                StartDate: startDate ? startDate : null,
                EndDate: endDate ? endDate : null,
                Status: 'pending' // Tạm thời cứ giữ pending, bài sau mình làm checkbox đổi status
            };
            
            await API.updateTask(editId, updateTaskData);
            await loadDataAndRenderKanban(); // Cập nhật xong thì vẽ lại màn hình
        } else {
            // TẠO TASK MỚI BẰNG API
            const newTaskData = {
                BoardID: parseInt(document.getElementById('task-board-id').value),
                Title: title,
                Description: desc ? desc : null,
                PriorityLevel: priority,
                StartDate: startDate ? startDate : null,
                EndDate: endDate ? endDate : null,
                Status: 'pending'
            };
            
            await API.createTask(newTaskData);
            await loadDataAndRenderKanban(); // Kéo DB về vẽ lại màn hình
        }
        
        closeModal(document.getElementById('modal-add-task'));
        e.target.reset(); document.getElementById('edit-task-id').value = '';
    });
}

// ==========================================
// CÁC HÀM TIỆN ÍCH LỌC DỮ LIỆU CŨ (GIỮ NGUYÊN LÕI)
// ==========================================
function setupFilters() {
    const filterBtns = document.querySelectorAll('#kanban-filters .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentFilter = e.currentTarget.dataset.filter;
            renderKanban();
        });
    });
}

function setupSettingsToggle() {
    const toggle = document.getElementById('toggle-task-drag');
    if(toggle) {
        toggle.checked = settings.enableTaskDragDrop;
        toggle.addEventListener('change', (e) => {
            settings.enableTaskDragDrop = e.target.checked;
            renderKanban();
        });
    }
}

export function setDateFilter(dateStr) {
    currentDateFilter = dateStr;
    const badge = document.getElementById('selected-date-badge');
    const text = document.getElementById('selected-date-text');

    if(dateStr && badge && text) {
        badge.classList.remove('hidden');
        const parts = dateStr.split('-');
        text.innerText = parts[2] + '/' + parts[1];
    } else if (badge) {
        badge.classList.add('hidden');
    }
    renderKanban(); 
}

// ==========================================
// MA THUẬT KÉO THẢ (DRAG & DROP) HTML5
// ==========================================
// Biến cờ toàn cục để biết đang kéo cái gì (Task hay Board)
let draggedItemType = null; 

function setupDragAndDrop() {
    const kanbanView = document.getElementById('view-kanban');
    const tasks = kanbanView.querySelectorAll('.task-card');
    const columns = kanbanView.querySelectorAll('.board-column');

    // ==========================================
    // 1. KHI BẮT ĐẦU NẮM KÉO THẺ CÔNG VIỆC (TASK)
    // ==========================================
    tasks.forEach(task => {
        task.addEventListener('dragstart', (e) => {
            draggedItemType = 'task'; // Phất cờ báo hiệu đang kéo Task
            e.dataTransfer.setData('text/plain', task.dataset.taskId);
            
            // 🌟 Lệnh này CỰC KỲ QUAN TRỌNG: Ngăn chặn thao tác kéo lan ra cái Bảng ở ngoài
            e.stopPropagation(); 
            
            // Dùng setTimeout để mượt UI khi kéo
            setTimeout(() => task.style.opacity = '0.5', 0); 
        });

        task.addEventListener('dragend', (e) => {
            task.style.opacity = '1';
            draggedItemType = null; // Kéo xong thì hạ cờ xuống
        });
    });

    // ==========================================
    // 2. KHI KÉO BẢNG & LƯỚT QUA CỘT MỚI
    // ==========================================
    columns.forEach(column => {
        // KHI BẮT ĐẦU NẮM KÉO CHÍNH CÁI BẢNG (MỚI)
        column.addEventListener('dragstart', (e) => {
            if (draggedItemType === 'task') return; // Đang cầm task thì cấm kéo bảng
            draggedItemType = 'board'; // Phất cờ báo hiệu đang kéo Bảng
            e.dataTransfer.setData('text/plain', column.dataset.boardId);
            setTimeout(() => column.style.opacity = '0.5', 0);
        });

        column.addEventListener('dragend', (e) => {
            column.style.opacity = '1';
            draggedItemType = null;
        });

        // KHI LƯỚT QUA (Giữ nguyên của em)
        column.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            column.style.transform = 'scale(1.02)';
        });

        column.addEventListener('dragleave', (e) => {
            column.style.transform = 'scale(1)';
        });

        // ==========================================
        // 3. KHI BUÔNG CHUỘT THẢ XUỐNG CỘT (DROP)
        // ==========================================
        column.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            column.style.transform = 'scale(1)';

            const droppedId = e.dataTransfer.getData('text/plain');
            const targetColumn = e.target.closest('.board-column');
            
            // Nếu thả ra ngoài cột -> Báo lỗi ra màn hình F12 ngay!
            if (!targetColumn) {
                console.log("❌ Thả trượt rồi! Bạn phải thả chính xác vào bên trong một Cột.");
                return; 
            }

            const targetBoardId = targetColumn.dataset.boardId;

            // KỊCH BẢN A: ĐANG THẢ TASK 
            if (draggedItemType === 'task') {
                const taskId = droppedId;
                const newBoardId = targetBoardId;
                
                console.log(`🚀 Đang kéo Task ID: ${taskId} thả vào Bảng ID: ${newBoardId}`);

                if (taskId && newBoardId) {
                    const task = currentTasks.find(t => t.TaskID == taskId);
                    
                    if (task && (task.BoardID != newBoardId || task.Status === 'completed')) {
                        if (task.BoardID != newBoardId) {
                            await API.moveTask(parseInt(taskId), parseInt(newBoardId));
                        }
                        if (task.Status === 'completed') {
                            await API.updateTaskStatus(parseInt(taskId), 'pending');
                        }
                        await loadDataAndRenderKanban();
                        console.log("✅ Hồi sinh Task thành công!");
                    }
                }
            } 
            // KỊCH BẢN B: ĐANG THẢ BẢNG
            else if (draggedItemType === 'board') {
                const sourceBoardId = droppedId; 
                const destBoardId = targetBoardId; 
                
                console.log(`🚀 Đang tráo Bảng ID: ${sourceBoardId} với Bảng ID: ${destBoardId}`);

                if (sourceBoardId !== destBoardId) {
                    const boardA = currentBoards.find(b => b.BoardID == sourceBoardId);
                    const boardB = currentBoards.find(b => b.BoardID == destBoardId);

                    if (boardA && boardB) {
                        const newOrderA = boardB.OrderIndex;
                        const newOrderB = boardA.OrderIndex;
                        await API.updateBoard(sourceBoardId, { Title: boardA.Title, Color: boardA.Color, OrderIndex: newOrderA });
                        await API.updateBoard(destBoardId, { Title: boardB.Title, Color: boardB.Color, OrderIndex: newOrderB });
                        await loadDataAndRenderKanban();
                        console.log("✅ Tráo Bảng thành công!");
                    }
                }
            }
        });
    });
}