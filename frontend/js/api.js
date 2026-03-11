/* ==========================================================================
   FILE: js/api.js
   CÔNG DỤNG: Cục phát wifi kết nối thẳng tới Backend FastAPI (Đã có Bảo mật Token)
   ========================================================================== */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// 1. Hàm lục ví lấy Vòng tay VIP (THIẾU HÀM NÀY LÀ TOANG NHÉ)
function getAuthHeader() {
    const token = localStorage.getItem('access_token');
    if (token) {
        return { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };
    }
    return { 'Content-Type': 'application/json' };
}

// 2. Hàm giải mã Vòng tay VIP (JWT) để lấy UserID
function getCurrentUserId() {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedJson = atob(payloadBase64);
        const payload = JSON.parse(decodedJson);
        return parseInt(payload.sub); 
    } catch (e) {
        console.error("Lỗi giải mã token:", e);
        return null;
    }
}

export const API = {
    // 0. ĐĂNG NHẬP (Lấy Token)
    // 0. ĐĂNG NHẬP (Lấy Token)
    login: async (email, password) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (!response.ok) throw new Error("Sai tài khoản hoặc mật khẩu");
            const data = await response.json();
            
            // LƯU CẢ 3 THỨ VÀO KÉT SẮT:
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user_name', data.FullName);
            localStorage.setItem('user_email', data.Email);
            
            return true;
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            return false;
        }
    },

    // 0.1. ĐĂNG KÝ (Tạo tài khoản mới)
    register: async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Lỗi đăng ký");
            }
            return await response.json();
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            return { error: error.message }; 
        }
    },

    // 1. Lấy danh sách Boards CỦA ĐÚNG USER ĐANG ĐĂNG NHẬP
    getBoards: async () => { 
        try {
            const userId = getCurrentUserId(); 
            if (!userId) throw new Error("Chưa đăng nhập");

            const response = await fetch(`${API_BASE_URL}/boards/${userId}`, { headers: getAuthHeader() });
            return await response.json();
        } catch (error) { return []; }
    },

    // 2. Lấy Tasks của một Board
    getTasks: async (boardId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/boards/${boardId}/tasks`, { headers: getAuthHeader() });
            return await response.json();
        } catch (error) { return []; }
    },

    // 3. Tạo Board mới (Gắn luôn tên chủ sở hữu vào)
    createBoard: async (boardData) => {
        try {
            const userId = getCurrentUserId();
            boardData.UserID = userId; 

            const response = await fetch(`${API_BASE_URL}/boards/`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(boardData)
            });
            return await response.json();
        } catch (error) { console.error("Lỗi tạo Bảng:", error); }
    },

    // 4. Tạo Task mới
    createTask: async (taskData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(taskData)
            });
            return await response.json();
        } catch (error) { console.error("Lỗi tạo Task:", error); }
    },

    // 5. Cập nhật Task (Sửa nội dung)
    updateTask: async (taskId, taskData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(taskData)
            });
            return await response.json();
        } catch (error) { console.error("Lỗi cập nhật Task:", error); }
    },

    // 6. Cập nhật Trạng thái Checkbox
    updateTaskStatus: async (taskId, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: getAuthHeader(),
                body: JSON.stringify({ Status: status })
            });
            return await response.json();
        } catch (error) { console.error("Lỗi cập nhật trạng thái:", error); }
    },

    // 7. Cập nhật Bảng khi Kéo thả Task
    moveTask: async (taskId, newBoardId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/move`, {
                method: 'PATCH',
                headers: getAuthHeader(),
                body: JSON.stringify({ BoardID: newBoardId })
            });
            return await response.json();
        } catch (error) { console.error("Lỗi chuyển bảng:", error); }
    },

    // 8. Cập nhật Bảng
    updateBoard: async (boardId, boardData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(boardData)
            });
            return await response.json();
        } catch (error) { console.error("Lỗi cập nhật bảng:", error); }
    },
    // 9. Xóa Bảng
    deleteBoard: async (boardId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            return await response.json();
        } catch (error) { console.error("Lỗi xóa bảng:", error); }
    },
};