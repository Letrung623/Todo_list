/* ==========================================================================
   FILE: js/api.js
   CÔNG DỤNG: Cục phát wifi kết nối thẳng tới Backend FastAPI
   ========================================================================== */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const API = {
    // 1. Lấy danh sách Boards của User (Mặc định UserID = 1 nãy mình tạo nháp)
    getBoards: async (userId = 1) => {
        try {
            const response = await fetch(`${API_BASE_URL}/boards/${userId}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi lấy Boards:", error);
            return [];
        }
    },

    // 2. Lấy Tasks của một Board
    getTasks: async (boardId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/boards/${boardId}/tasks`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi lấy Tasks:", error);
            return [];
        }
    },

    // 3. Tạo Task mới (Bắn thẳng vào SQL Server)
    createTask: async (taskData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            return await response.json();
        } catch (error) {
            console.error("Lỗi tạo Task:", error);
        }
    },

    // 4. Cập nhật Task (Sửa nội dung)
    updateTask: async (taskId, taskData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'PUT', // Dùng PUT để báo cho Backend biết là tui muốn SỬA
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            return await response.json();
        } catch (error) {
            console.error("Lỗi cập nhật Task:", error);
        }
    },

    // 5. Cập nhật Trạng thái Checkbox (PATCH)
    updateTaskStatus: async (taskId, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Status: status })
            });
            return await response.json();
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
        }
    },
    // 6. Cập nhật Bảng khi Kéo thả (PATCH)
    moveTask: async (taskId, newBoardId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/move`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ BoardID: newBoardId })
            });
            return await response.json();
        } catch (error) {
            console.error("Lỗi chuyển bảng:", error);
        }
    },
    // 7. Cập nhật Bảng (PUT)
    updateBoard: async (boardId, boardData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(boardData)
            });
            return await response.json();
        } catch (error) { console.error("Lỗi cập nhật bảng:", error); }
    },
};