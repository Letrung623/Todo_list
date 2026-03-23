/* ==========================================================================
   FILE: app.js
   CÔNG DỤNG: File gốc khởi chạy ứng dụng. Lắng nghe các sự kiện click chung 
              toàn cục như đổi Tab Menu, bật tắt Modal popup.
   ========================================================================== */
import { db } from './mockData.js';
import { initKanban } from './kanban.js';        // Thêm dòng này
import { initDragAndDrop } from './dragDrop.js';
import { initTimetable } from './timetable.js';
import { initWidgets } from './widgets.js';
import { initProjects } from './projects.js';

/* ✨ THÊM: Import mascot module */
import { initMascot } from './mascot.js';

/* 🎨 THÊM: Import pet module */
import { initPet } from './pet.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Hệ thống đã kết nối Mock Data:", db);

    initNavigation();
    initModals();
    /* 🎨 THÊM: Khởi tạo collapse/expand sidebar & right panel functionality */
    initCollapsible();

    initKanban();
    initDragAndDrop();
    initTimetable();
    initWidgets();
    initProjects();

    /* ✨ THÊM: Khởi tạo mascot (linh vật) */
    initMascot();

    /* 🎨 THÊM: Khởi tạo Pet Dashboard */
    initPet();
});

/**
 * 1. XỬ LÝ ĐIỀU HƯỚNG SIDEBAR MENU (Chuyển View)
 */
function initNavigation() {
    const menuItems = document.querySelectorAll('.sidebar .menu-item[data-target]');
    const views = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('page-title');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Đổi hiệu ứng active cho Menu
            menuItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');

            // Đổi tiêu đề Topbar
            pageTitle.innerText = item.querySelector('span').innerText;

            // Ẩn tất cả các view, chỉ hiện view được chọn
            const targetId = item.getAttribute('data-target');
            views.forEach(view => {
                if (view.id === targetId) {
                    view.classList.remove('hidden');
                } else {
                    view.classList.add('hidden');
                }
            });
        });
    });

    // Xử lý nút Đăng xuất (Log Out)
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {

                // 1. DÒNG LỆNH CỐT LÕI: Ném chìa khóa vào thùng rác!
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_name');
                localStorage.removeItem('user_email');

                // 2. Xong xuôi mới đá văng ra ngoài
                window.location.href = 'login.html';
            }
        });
    };
}

/**
 * 2. XỬ LÝ ĐÓNG / MỞ CÁC MODAL
 */
function initModals() {
    // Nút mở Modal
    const btnAddBoard = document.getElementById('btn-add-board');
    const btnSettings = document.getElementById('btn-open-settings');

    // Các Modal tương ứng
    const modalAddBoard = document.getElementById('modal-add-board');
    const modalSettings = document.getElementById('modal-settings');
    const modalAddTask = document.getElementById('modal-add-task');

    // Sự kiện mở Modal
    if (btnAddBoard) btnAddBoard.addEventListener('click', () => openModal(modalAddBoard));
    if (btnSettings) btnSettings.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(modalSettings);
    });

    // Sự kiện đóng Modal khi bấm nút X hoặc nút Hủy
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = e.target.closest('.modal-overlay');
            if (modal) closeModal(modal);
        });
    });

    // Sự kiện đóng Modal khi click ra ngoài vùng xám (overlay)
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay);
            }
        });
    });
}

// Hàm tiện ích đóng/mở
export function openModal(modalElement) {
    if (modalElement) modalElement.classList.remove('hidden');
}

export function closeModal(modalElement) {
    if (modalElement) modalElement.classList.add('hidden');
}

/* ========================================================================
   🎨 THÊM: SIDEBAR & RIGHT PANEL COLLAPSE FUNCTIONALITY
   ========================================================================
   
   Quản lý thu gọn (collapse) và mở rộng (expand) left sidebar phai right-panel.
   Sử dụng localStorage để lưu trạng thái người dùng.
   
   Features:
   - Click nút toggle để tắt/bật sidebar
   - Click nút toggle để tắt/bật right-panel
   - Trạng thái được lưu trong localStorage
   - Khi collapse, main content tự động mở rộng (flexbox tự động)
   - Smooth animation (0.3s transition)
   ======================================================================== */

/**
 * initCollapsible()
 * Khởi tạo event listeners cho các nút collapse/expand
 * Đọc trạng thái từ localStorage khi trang load
 */
function initCollapsible() {
    const sidebar = document.getElementById('sidebar');
    const rightPanel = document.getElementById('right-panel');
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const btnToggleRightPanel = document.getElementById('btn-toggle-right-panel');
    /* 🎨 THÊM: Ghost buttons để mở lại sidebar/right-panel khi collapsed */
    const ghostBtnLeft = document.getElementById('ghost-btn-left');
    const ghostBtnRight = document.getElementById('ghost-btn-right');

    // BƯỚC 1: Đọc trạng thái collapse từ localStorage
    // Nếu người dùng đã collapse sidebar lần trước, khôi phục lại trạng thái
    const isSidebarCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    const isRightPanelCollapsed = localStorage.getItem('right-panel-collapsed') === 'true';

    if (isSidebarCollapsed && sidebar) {
        sidebar.classList.add('collapsed');
        /* 🎨 THÊM: Khôi phục visibility của ghost button khi trang load */
        if (ghostBtnLeft) ghostBtnLeft.classList.add('visible');
    }
    if (isRightPanelCollapsed && rightPanel) {
        rightPanel.classList.add('collapsed');
        /* 🎨 THÊM: Khôi phục visibility của ghost button khi trang load */
        if (ghostBtnRight) ghostBtnRight.classList.add('visible');
    }

    // BƯỚC 2: Gắn event listeners vào nút toggle
    if (btnToggleSidebar) {
        btnToggleSidebar.addEventListener('click', () => {
            toggleSidebar(sidebar, ghostBtnLeft);
        });
    }

    if (btnToggleRightPanel) {
        btnToggleRightPanel.addEventListener('click', () => {
            toggleRightPanel(rightPanel, ghostBtnRight);
        });
    }

    /* 🎨 THÊM: Gắn event listeners vào ghost buttons
       Khi bấm ghost button, mở lại sidebar/right-panel */
    if (ghostBtnLeft) {
        ghostBtnLeft.addEventListener('click', () => {
            toggleSidebar(sidebar, ghostBtnLeft);
        });
    }

    if (ghostBtnRight) {
        ghostBtnRight.addEventListener('click', () => {
            toggleRightPanel(rightPanel, ghostBtnRight);
        });
    }

    // BƯỚC 3: Tùy chọn - Tự động collapse sidebar trên mobile (<768px)
    // Bỏ comment dòng dưới nếu muốn auto-collapse trên điện thoại
    // if (window.innerWidth < 768) {
    //     if (sidebar) sidebar.classList.add('collapsed');
    //     localStorage.setItem('sidebar-collapsed', 'true');
    // }
}

/**
 * toggleSidebar(sidebarElement, ghostBtnElement)
 * Chuyển đổi trạng thái collapse/expand của left sidebar
 * 
 * @param {HTMLElement} sidebarElement - Phần tử .sidebar DOM
 * @param {HTMLElement} ghostBtnElement - Ghost button để mở lại sidebar (optional)
 */
function toggleSidebar(sidebarElement, ghostBtnElement) {
    if (!sidebarElement) return;

    // Toggle class 'collapsed'
    sidebarElement.classList.toggle('collapsed');

    // Lưu trạng thái vào localStorage
    const isCollapsed = sidebarElement.classList.contains('collapsed');
    localStorage.setItem('sidebar-collapsed', isCollapsed);

    /* 🎨 THÊM: Toggle visibility của ghost button
       Khi sidebar collapsed, ghost button hiển thị (.visible class)
       Khi sidebar expanded, ghost button ẩn đi (remove .visible class) */
    if (ghostBtnElement) {
        if (isCollapsed) {
            ghostBtnElement.classList.add('visible');
        } else {
            ghostBtnElement.classList.remove('visible');
        }
    }

    // Log ra console để debug
    console.log('🎨 Sidebar toggled:', isCollapsed ? 'COLLAPSED' : 'EXPANDED');
}

/**
 * toggleRightPanel(rightPanelElement, ghostBtnElement)
 * Chuyển đổi trạng thái collapse/expand của right panel
 * 
 * @param {HTMLElement} rightPanelElement - Phần tử .right-panel DOM
 * @param {HTMLElement} ghostBtnElement - Ghost button để mở lại right panel (optional)
 */
function toggleRightPanel(rightPanelElement, ghostBtnElement) {
    if (!rightPanelElement) return;

    // Toggle class 'collapsed'
    rightPanelElement.classList.toggle('collapsed');

    // Lưu trạng thái vào localStorage
    const isCollapsed = rightPanelElement.classList.contains('collapsed');
    localStorage.setItem('right-panel-collapsed', isCollapsed);

    /* 🎨 THÊM: Toggle visibility của ghost button
       Khi right-panel collapsed, ghost button hiển thị (.visible class)
       Khi right-panel expanded, ghost button ẩn đi (remove .visible class) */
    if (ghostBtnElement) {
        if (isCollapsed) {
            ghostBtnElement.classList.add('visible');
        } else {
            ghostBtnElement.classList.remove('visible');
        }
    }

    // Log ra console để debug
    console.log('🎨 Right panel toggled:', isCollapsed ? 'COLLAPSED' : 'EXPANDED');
}