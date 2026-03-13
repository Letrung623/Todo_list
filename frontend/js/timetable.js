/* ==========================================================================
   FILE: js/timetable.js
   CÔNG DỤNG: Xử lý luồng Wizard 3 bước (Upload -> Cấu hình -> Xem Lưới)
   ========================================================================== */

import { API } from './api.js'; 
import { db } from './mockData.js'; 

let aiExtractedData = []; 

export async function initTimetable() { // <--- Thêm chữ async vào đây
    setupWizardEvents();
    
    // 🌟 KHI VỪA F5 TRANG WEB, LẬP TỨC CHO NGƯỜI XUỐNG DB TÌM DATA
    const result = await API.getTimetable();
    
    if (result.success && result.data.length > 0) {
        // Nếu trong DB ĐÃ CÓ data -> Đổ thẳng vào biến
        aiExtractedData = result.data; 
        
        // Giấu Step 1, Step 2 đi, cho nhảy thẳng sang Step 3 luôn cho ngầu!
        document.getElementById('tt-step-1').classList.add('hidden');
        document.getElementById('tt-step-2').classList.add('hidden');
        document.getElementById('tt-step-3').classList.remove('hidden');
        
        renderFinalGrid(); // Vẽ bảng ngay lập tức
        renderAiDataToStep2();
    } else {
        // Nếu DB trống trơn (Chưa lưu bao giờ) -> Hiện giao diện up ảnh như bình thường
        renderConfigSubjects(); 
    }
}

/**
 * 1. ĐIỀU HƯỚNG CHUYỂN BƯỚC VÀ XỬ LÝ AI THẬT
 */
function setupWizardEvents() {
    const step1 = document.getElementById('tt-step-1');
    const step2 = document.getElementById('tt-step-2');
    const step3 = document.getElementById('tt-step-3');
    
    const btnUploadTrigger = document.getElementById('btn-upload-trigger');
    const fileInput = document.getElementById('file-upload');
    const dropZone = document.getElementById('drop-zone');

    async function handleFiles(files) {
        if (files && files.length > 0) {
            const file = files[0];
            
            if (!file.type.startsWith('image/')) {
                alert("Vui lòng chỉ tải lên định dạng ảnh (JPG, PNG)!");
                return;
            }

            console.log("Đã nhận file để AI phân tích:", file.name);

            const originalText = btnUploadTrigger.innerHTML;
            btnUploadTrigger.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI đang phân tích ảnh...';
            btnUploadTrigger.disabled = true;
            if(dropZone) dropZone.style.opacity = '0.5';

            const result = await API.extractTimetable(file);

            btnUploadTrigger.innerHTML = originalText;
            btnUploadTrigger.disabled = false;
            if(dropZone) dropZone.style.opacity = '1';
            fileInput.value = ''; 

            if (result.success) {
                console.log("Dữ liệu AI trích xuất thành công:", result.data);
                
                // Trực tiếp gán mảng JSON AI trả về vào biến của hệ thống
                aiExtractedData = result.data; 
                
                step1.classList.add('hidden');
                step2.classList.remove('hidden');
                renderAiDataToStep2(); 
                alert("AI đã đọc xong! Mời sếp kiểm tra lại thông tin bên dưới.");
            } else {
                alert("Lỗi phân tích ảnh: " + result.error);
            }
        }
    }

    if (btnUploadTrigger && fileInput) {
        btnUploadTrigger.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    }

    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        dropZone.addEventListener('drop', (e) => {
            handleFiles(e.dataTransfer.files);     
        });
    }

    document.getElementById('btn-back-step-1')?.addEventListener('click', () => {
        step2.classList.add('hidden');
        step1.classList.remove('hidden');
    });

    const btnConfirm = document.getElementById('btn-confirm-timetable');
    if (btnConfirm) {
        btnConfirm.addEventListener('click', async () => {
            const rows = document.querySelectorAll('#subject-list-container .subject-row');
            const subjectsArray = [];
            
            rows.forEach(row => {
                const inputs = row.querySelectorAll('input');
                const select = row.querySelector('select');

                if (inputs.length >= 4) {
                    subjectsArray.push({
                        "SubjectName": inputs[0].value,         
                        "DayOfWeek": parseInt(select.value),    
                        "StartTime": inputs[1].value,           
                        "EndTime": inputs[2].value,             
                        "Room": inputs[3].value || "Chưa rõ"    
                    });
                }
            });

            console.log("📤 Chuẩn bị gửi cục data này xuống SQL Server:", subjectsArray);

            const originalText = btnConfirm.innerHTML;
            btnConfirm.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu xuống DB...';
            btnConfirm.disabled = true;
            const result = await API.saveTimetable(subjectsArray);

            btnConfirm.innerHTML = originalText;
            btnConfirm.disabled = false;

            if (result.success) {
                alert("🎉 Tuyệt vời sếp ơi! Đã dập thành công " + subjectsArray.length + " môn học xuống SQL Server!");
                aiExtractedData = subjectsArray;
                step2.classList.add('hidden');
                step3.classList.remove('hidden');
                renderFinalGrid(); 
            } else {
                alert("❌ Lỗi lưu dữ liệu: " + result.error);
            }
        });
    }

    document.getElementById('btn-edit-timetable')?.addEventListener('click', () => {
        step3.classList.add('hidden');
        step2.classList.remove('hidden');
    });

    // =======================================================
    // 🌟 KHÚC NÀY LÀ KHÚC SẾP QUÊN CHƯA DÁN VÀO ĐÂY NÀY! 🌟
    // =======================================================
    const btnAddSubject = document.getElementById('btn-add-subject-row'); 
    if (btnAddSubject) {
        btnAddSubject.addEventListener('click', (e) => {
            e.preventDefault();
            const container = document.getElementById('subject-list-container');
            const newRow = document.createElement('div');
            newRow.className = 'subject-row ai-row';
            newRow.innerHTML = `
                <div><i class="fa-solid fa-pen" style="color:#9ca3af; margin-right:8px;"></i> <input type="text" placeholder="Tên môn học" value=""></div>
                <select class="select-ngay">
                    <option value="2">Thứ 2</option>
                    <option value="3">Thứ 3</option>
                    <option value="4">Thứ 4</option>
                    <option value="5">Thứ 5</option>
                    <option value="6">Thứ 6</option>
                    <option value="7">Thứ 7</option>
                    <option value="8">Chủ Nhật</option>
                </select>
                <input type="time" class="input-gio-bat-dau" value="07:00">
                <input type="time" class="input-gio-ket-thuc" value="09:00">
                <input type="text" class="input-phong" value="" placeholder="Phòng học">
                <button class="btn-delete-row"><i class="fa-solid fa-trash-can"></i></button>
            `;
            container.appendChild(newRow);
        });
    }

    const subjectContainer = document.getElementById('subject-list-container');
    if (subjectContainer) {
        subjectContainer.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete-row');
            if (deleteBtn) {
                e.preventDefault();
                const row = deleteBtn.closest('.subject-row');
                if (row) {
                    row.remove(); 
                }
            }
        });
    }
}

/**
 * HÀM MỚI: ĐỔ DỮ LIỆU TỪ AI RA MÀN HÌNH STEP 2 ĐỂ NGƯỜI DÙNG SỬA
 */
function renderAiDataToStep2() {
    const container = document.getElementById('subject-list-container');
    if (!container || !aiExtractedData || aiExtractedData.length === 0) return;

    let html = '';
    aiExtractedData.forEach((sub, index) => {
        const room = sub.Room ? sub.Room : ''; 
        const startTime = sub.StartTime ? sub.StartTime.substring(0, 5) : '07:00'; 
        const endTime = sub.EndTime ? sub.EndTime.substring(0, 5) : '09:00';
        
        html += `
            <div class="subject-row ai-row" data-index="${index}">
                <div><i class="fa-solid fa-wand-magic-sparkles" style="color:#8b5cf6; margin-right:8px;"></i> <input type="text" value="${sub.SubjectName}"></div>
                <select>
                    <option value="2" ${sub.DayOfWeek === 2 ? 'selected' : ''}>Thứ 2</option>
                    <option value="3" ${sub.DayOfWeek === 3 ? 'selected' : ''}>Thứ 3</option>
                    <option value="4" ${sub.DayOfWeek === 4 ? 'selected' : ''}>Thứ 4</option>
                    <option value="5" ${sub.DayOfWeek === 5 ? 'selected' : ''}>Thứ 5</option>
                    <option value="6" ${sub.DayOfWeek === 6 ? 'selected' : ''}>Thứ 6</option>
                    <option value="7" ${sub.DayOfWeek === 7 ? 'selected' : ''}>Thứ 7</option>
                    <option value="8" ${sub.DayOfWeek === 8 ? 'selected' : ''}>Chủ Nhật</option>
                </select>
                <input type="time" value="${startTime}">
                <input type="time" value="${endTime}">
                <input type="text" value="${room}" placeholder="Phòng học">
                <button class="btn-delete-row"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    });
    container.innerHTML = html;
}

/**
 * 2. BƯỚC 2: RENDER CÁC INPUT DỮ LIỆU ĐỂ CHỈNH SỬA
 */
function renderConfigSubjects() {
    const container = document.getElementById('subject-list-container');
    if (!container) return;

    let html = '';
    db.subjects.forEach(sub => {
        html += `
            <div class="subject-row" data-id="${sub.id}">
                <div><i class="fa-solid fa-pen" style="color:#9ca3af; margin-right:8px;"></i> <input type="text" value="${sub.title}"></div>
                <select>
                    <option value="Mon" ${sub.day === 'Mon' ? 'selected' : ''}>Thứ 2</option>
                    <option value="Tue" ${sub.day === 'Tue' ? 'selected' : ''}>Thứ 3</option>
                    <option value="Wed" ${sub.day === 'Wed' ? 'selected' : ''}>Thứ 4</option>
                    <option value="Thu" ${sub.day === 'Thu' ? 'selected' : ''}>Thứ 5</option>
                    <option value="Fri" ${sub.day === 'Fri' ? 'selected' : ''}>Thứ 6</option>
                    <option value="Sat" ${sub.day === 'Sat' ? 'selected' : ''}>Thứ 7</option>
                </select>
                <input type="time" value="${sub.startTime}">
                <input type="time" value="${sub.endTime}">
                <input type="text" value="${sub.room}">
                <button class="btn-delete-row"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    });
    container.innerHTML = html;
}

/**
 * 3. BƯỚC 3: RENDER BẢNG LƯỚI GRID VIEW FINAL
 */
function renderFinalGrid() {
    const gridBody = document.getElementById('advanced-grid-body');
    if (!gridBody) return;

    const realData = aiExtractedData && aiExtractedData.length > 0 ? aiExtractedData : db.subjects;

    const morningSubs = realData.filter(s => {
        const timeStr = s.StartTime || s.startTime; 
        return parseInt(timeStr.split(':')[0]) < 12;
    });
    
    const afternoonSubs = realData.filter(s => {
        const timeStr = s.StartTime || s.startTime;
        return parseInt(timeStr.split(':')[0]) >= 12 && parseInt(timeStr.split(':')[0]) < 18;
    });
    
    const eveningSubs = realData.filter(s => {
        const timeStr = s.StartTime || s.startTime;
        return parseInt(timeStr.split(':')[0]) >= 18;
    });

    gridBody.innerHTML = `
        ${createGridRow('SÁNG', '07:00', '11:30', morningSubs)}
        ${createGridRow('CHIỀU', '13:00', '17:30', afternoonSubs)}
        ${createGridRow('TỐI', '18:30', '21:00', eveningSubs)}
    `;
}

function createGridRow(buoiName, startTime, endTime, subjects) {
    const days = [2, 3, 4, 5, 6, 7, 8]; 
    
    let daysHtml = '';
    days.forEach(day => {
        const sub = subjects.find(s => s.DayOfWeek === day || s.day === ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day-2]);
        let cellContent = '';
        
        if (sub) {
            const title = sub.SubjectName || sub.title;
            const start = sub.StartTime || sub.startTime;
            const end = sub.EndTime || sub.endTime;
            const room = sub.Room || sub.room || "Chưa rõ";

            const titleLen = title ? title.length : 1;
            const colorClass = `color-${(titleLen % 4) + 1}`;
            
            cellContent = `
                <div class="tt-subject-card ${colorClass}">
                    <div class="tt-card-title">${title}</div>
                    <div class="tt-card-info"><i class="fa-solid fa-location-dot"></i> ${room}</div>
                    <div class="tt-card-info" style="margin-top:auto">${start} - ${end}</div>
                </div>
            `;
        }
        daysHtml += `<div class="tt-cell">${cellContent}</div>`;
    });

    return `
        <div class="tt-grid-row">
            <div class="tt-cell tt-cell-buoi">${buoiName}</div>
            <div class="tt-cell tt-cell-time">
                <span>${startTime}</span>
                <span>${endTime}</span>
            </div>
            ${daysHtml}
        </div>
    `;
}