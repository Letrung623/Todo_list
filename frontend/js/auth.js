/* ==========================================================================
   FILE: js/auth.js
   CÔNG DỤNG: Xử lý Đăng nhập, Đăng ký, Ẩn/Hiện mật khẩu và Lỗi Validate
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    
    // 1. CHUYỂN ĐỔI QUA LẠI GIỮA ĐĂNG NHẬP & ĐĂNG KÝ
    document.getElementById('link-to-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.add('hidden');
        registerSection.classList.remove('hidden');
    });

    document.getElementById('link-to-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });

    // 2. TÍNH NĂNG ẨN/HIỆN MẬT KHẨU (Hỗ trợ nhiều ô input)
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', (e) => {
            // Lấy ID của ô input đang liên kết với icon này
            const targetId = e.target.getAttribute('data-target');
            const pwdInput = document.getElementById(targetId);
            
            if (pwdInput) {
                const type = pwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
                pwdInput.setAttribute('type', type);
                
                e.target.classList.toggle('fa-eye');
                e.target.classList.toggle('fa-eye-slash');
            }
        });
    });
});