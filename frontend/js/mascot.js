/* ==========================================================================
   FILE: mascot.js
   CÔNG DỤNG: Xử lý tất cả logic linh vật (mascot):
              - Di chuyển tự do trên màn hình (drag and drop)
              - Lưu vị trí vào localStorage
              - Tương tác click để phát âm thanh
              - Hiệu ứng sinh động
   ========================================================================== */

// 🎵 IMPORT HỆ THỐNG QUẢN LÝ GIỌNG NÓI
import { VoiceManager } from './voiceManager.js';
import { PET_VOICES } from './petVoices.js';

/**
 * MASCOT CLASS - LINH VẬT CHÍNH (MAIN PET)
 * ==========================================
 * Quản lý toàn bộ chức năng của linh vật ngoài màn hình:
 * - Kéo/di chuyển (Draggable)
 * - Phát âm thanh khi click (Voice)
 * - Hiệu ứng animation (Animation)
 * 
 * ⚠️ QUAN TRỌNG:
 * - Chỉ ID "mascot-image" (ngoài body, dòng 590 HTML)
 * - KHÔNG KỀM VỚI pet-avatar-image (trong dashboard)
 * - Pet Avatar chỉ là ảnh tĩnh (Static), không có logic
 */
class Mascot {
  constructor(voiceManager = null) {
    // Cách tính vị trí: từ dưới cùng (bottom) và bên phải (right)
    this.x = 0;        // vị trí trục X (từ phải sang trái)
    this.y = 0;        // vị trí trục Y (từ dưới lên trên)
    this.isDragging = false;
    this.dragOffsetX = 0;  // Khoảng cách từ vị trí click đến tâm avatar
    this.dragOffsetY = 0;

    // ✏️ SỬA: Thêm biến để tracking khoảng cách di chuyển thực tế
    this.dragStartX = 0;   // Vị trí X ban đầu khi bắt đầu kéo
    this.dragStartY = 0;   // Vị trí Y ban đầu khi bắt đầu kéo
    this.wasReallyDragged = false; // Flag: true nếu move > 10px, false nếu chỉ click

    // Lấy các element DOM từ HTML
    this.container = null;
    this.image = null;

    // 🎵 [NEW] LƯU VOICE MANAGER ĐỂ PHÁT ÂM THANH
    // Voice manager được truyền vào từ initMascot()
    this.voiceManager = voiceManager;

    // Trạng thái mascot
    this.isInitialized = false;
  }

  /**
   * Khởi tạo mascot
   * - Lấy reference các DOM element
   * - Load vị trí từ localStorage nếu có
   * - Gắn các event listener
   * - Hiển thị linh vật
   */
  init() {
    if (this.isInitialized) return;

    // Lấy reference element từ HTML
    this.container = document.getElementById('mascot-container');
    this.image = document.getElementById('mascot-image');

    // Nếu element không tồn tại, kết thúc khởi tạo
    if (!this.container || !this.image) {
      console.warn('❌ Mascot elements không tìm thấy trong HTML');
      return;
    }

    // Load vị trí đã lưu từ localStorage
    this.loadPosition();

    // Gắn event listeners cho tương tác
    this.bindEvents();

    console.log('✅ Mascot đã được khởi tạo thành công');
    this.isInitialized = true;
  }

  /**
   * GẮN EVENT LISTENERS CHO LINH VẬT CHÍNH
   * =====================================
   * Những sự kiện này CHỈ gắn vào LINHh VẬT CHÍNH (mascot-image)
   * - mousedown/touchstart → Bắt đầu kéo
   * - mousemove/touchmove → Đang kéo
   * - mouseup/touchend → Kết thúc kéo
   * - click → Phát âm thanh (nếu không phải kéo)
   * 
   * ✅ CÓ e.stopPropagation() để NGĂN CHẶN EVENT BUBBLING
   *    Đảm bảo các sự kiện từ dashboard không ảnh hưởng đến linh vật
   */
  bindEvents() {
    // ✅ [FIX] KIỂM TRA: Đây phải là mascot-image (linh vật chính), không phải pet-avatar
    if (!this.image || this.image.id !== 'mascot-image') {
      console.error('❌ ERROR: bindEvents được gọi không phải từ mascot-image (linh vật chính)!');
      console.log('ID hiện tại:', this.image?.id);
      return;
    }

    // ========== SỰ KIỆN BẮT ĐẦU KÉO ==========
    // mousedown = sự kiện chuột nhấn xuống
    // touchstart = sự kiện chạm trên thiết bị di động
    this.image.addEventListener('mousedown', (e) => {
      // ✅ [FIX] DỪNG EVENT BUBBLING
      e.stopPropagation();
      this.startDrag(e);
    });

    this.image.addEventListener('touchstart', (e) => {
      // ✅ [FIX] DỪNG EVENT BUBBLING
      e.stopPropagation();
      this.startDrag(e);
    });

    // ========== SỰ KIỆN ĐANG KÉO ==========
    // Sử dụng document để bắt chuyển động chuột ở bất kỳ vị trí nào
    document.addEventListener('mousemove', (e) => this.dragMascot(e));
    document.addEventListener('touchmove', (e) => this.dragMascot(e), { passive: false });

    // ========== SỰ KIỆN KẾT THÚC KÉO ==========
    document.addEventListener('mouseup', () => this.endDrag());
    document.addEventListener('touchend', () => this.endDrag());

    // ========== SỰ KIỆN CLICK (TƯƠNG TÁC - PHÁT ÂM THANH) ==========
    // Phát âm thanh khi click (nếu không phải kéo)
    this.image.addEventListener('click', (e) => {
      // ✅ [FIX] DỪNG EVENT BUBBLING - Ngăn click trên linh vật ảnh hưởng đến dashboard
      e.stopPropagation();
      this.onMascotClick(e);
    });
  }

  /**
   * BẮT ĐẦU KÉO LINH VẬT CHÍNH
   * @param {MouseEvent|TouchEvent} e - Sự kiện chuột hoặc chạm
   * 
   * ✅ [FIX] CHỈNHH GHI CHÚ:
   * - Hàm này THỊ kích hoạt khi người dùng nhấn vào Linh vật chính (mascot-image)
   * - KHÔNG bao giờ được gọi từ Pet Avatar (pet-avatar-image)
   * - Tính toán offset để element không bị "nhảy" khi kéo
   */
  startDrag(e) {
    // ✅ [FIX] KIỂM TRA LẠI: Đây phải là mascot-image (linh vật chính)
    if (e.target.id !== 'mascot-image') {
      console.warn('⚠️ WARNING: startDrag được gọi từ element không phải mascot-image!', e.target.id);
      return;
    }

    this.isDragging = true;
    // ✏️ SỬA: Reset flag drag flag từ lần click trước
    this.wasReallyDragged = false;

    /**
     * Lấy tọa độ click:
     * - clientX/clientY = vị trí chuột tương đối với viewport
     * - Dùng getBoundingClientRect() để lấy vị trí element hiện tại
     */
    const rect = this.container.getBoundingClientRect();

    // Nếu là touch event, lấy tọa độ từ touches[0]
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    // Tính offset = vị trí click - vị trí element
    this.dragOffsetX = clientX - rect.left;
    this.dragOffsetY = clientY - rect.top;

    // ✏️ SỬA: Lưu vị trí ban đầu để theo dõi khoảng cách di chuyển
    this.dragStartX = clientX;
    this.dragStartY = clientY;
    this.image.classList.add('dragging');

    console.log('🖱️ Bắt đầu kéo linh vật chính...');
  }

  /**
   * ĐANG KÉO LINH VẬT CHÍNH (KHÔNG PHẢI AVATAR)
   * @param {MouseEvent|TouchEvent} e - Sự kiện chuột hoặc chạm
   * 
   * ✅ [FIX] CHỈNHH GHI CHÚ:
   * - Hàm này chỉ được gọi khi Linh vật chính (mascot-image) đang được kéo
   * - Không thể gọi từ Pet Avatar (pet-avatar-image) vì Avatar không có drag logic
   * 
   * Công việc:
   * - Cập nhật vị trí theo chuột/ngón tay của người dùng
   * - Chuyển đổi từ tọa độ (x,y) sang (bottom, right) cho CSS
   * - Phát hiện xem có phải là drag thực sự hay chỉ click nhẹ
   */
  dragMascot(e) {
    // ✅ [FIX] KIỂM TRA: Nếu không đang kéo Linh vật chính, dừng hàm
    if (!this.isDragging) return;

    // Ngăn hành động mặc định (ví dụ: scroll khi chạm)
    e.preventDefault?.();

    // Lấy tọa độ chuột/ngón tay
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    // ✅ [FIX] TÍNH KHOẢNG CÁCH: Kiểm tra xem đây có phải drag thực sự không
    const distanceX = Math.abs(clientX - this.dragStartX);
    const distanceY = Math.abs(clientY - this.dragStartY);
    const movementDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    // ✏️ SỬA: Nếu di chuyển > 10px, đánh dấu là "drag thực sự"
    // Điều này để tránh phát âm thanh khi người dùng chỉ click nhẹ
    if (movementDistance > 10) {
      this.wasReallyDragged = true;
    }

    // Tính tọa độ mới dựa trên offset
    // Ví dụ: Nếu click ở giữa element, offset = 40px (nửa chiều dài 80px)
    // Vị trí mới = clientX - 40 = vị trí tâm element
    const newX = clientX - this.dragOffsetX;
    const newY = clientY - this.dragOffsetY;

    // Chuyển đổi từ (x, y) sang (bottom=height-y, right=width-x)
    // Vì CSS dùng bottom/right thay vì top/left
    this.x = window.innerWidth - newX - this.container.offsetWidth;
    this.y = window.innerHeight - newY - this.container.offsetHeight;

    // Cập nhật vị trí trên giao diện
    this.updatePosition();
  }

  /**
   * KẾT THÚC KÉO LINH VẬT CHÍNH
   * 
   * ✅ [FIX] CHỈNHH GHI CHÚ:
   * - Hàm này chỉ kết thúc kéo cho Linh vật chính (mascot-image)
   * - Không ảnh hưởng đến Pet Avatar (pet-avatar-image)
   * 
   * Công việc:
   * - Bỏ flag isDragging để dừng cập nhật vị trí
   * - Loại bỏ class CSS dragging (ẩn hiệu ứng kéo)
   * - Lưu vị trí vào localStorage để không quên sau reload
   */
  endDrag() {
    // ✅ [FIX] KIỂM TRA: Chỉ kết thúc nếu đang kéo Linh vật chính
    if (!this.isDragging) return;

    this.isDragging = false;

    // Loại bỏ class dragging (ẩn hiệu ứng kéo)
    this.image.classList.remove('dragging');

    // ✅ [FIX] LƯU LẠI VỊ TRÍ: Chỉ lưu vị trí của Linh vật chính Linh vật chính
    // (không ảnh hưởng đến Pet Avatar)
    this.savePosition();
  }

  /**
   * XỬ LÝ CLICK VÀO LINH VẬT CHÍNH (KHÔNG PHẢI AVATAR)
   * @param {MouseEvent} e - Sự kiện click
   * 
   * ✅ [FIX] QUAN TRỌNG:
   * - Sự kiện này CHỈ kích hoạt cho Linh vật chính (mascot-image)
   * - KHÔNG kích hoạt cho Pet Avatar (pet-avatar-image)
   * - Kiểm tra: người dùng có thực sự click hay chỉ drag?
   * 
   * Khi click thực sự:
   * 1. Phát hiệu ứng bounce (nhảy)
   * 2. Phát âm thanh từ VoiceManager
   */
  onMascotClick(e) {
    // ✅ [FIX] KIỂM TRA: Đây phải là click vào linh vật chính, không phải drag
    if (this.wasReallyDragged) {
      console.log('👋 Đây là drag (di chuyển > 10px), bỏ qua click event');
      return;
    }

    console.log('👆 Click thực sự vào Linh vật chính!');

    // ========== HIỆU ỨNG BOUNCE ==========
    // Thêm class 'clicked' để chạy animation bounce
    this.image.classList.add('clicked');

    // Loại bỏ class sau animation kết thúc (0.4s = thời gian animation)
    setTimeout(() => {
      this.image.classList.remove('clicked');
    }, 400);

    // ========== PHÁT ÂM THANH BẰNG VOICE MANAGER ==========
    // ✅ [FIX] Gọi playSound() CHỈNHH VÀO từ Linh vật chính
    console.log('🎵 Phát âm thanh từ Linh vật chính...');
    this.playSound('greeting');
  }

  /**
   * PHÁT ÂM THANH BẰNG VOICE MANAGER
   * @param {string} actionName - Tên hành động (mặc định: 'greeting')
   * 
   * 🎵 [NEW] SỬ DỤNG HỆ THỐNG QUẢN LÝ GIỌNG NÓI:
   * ========================================
   * Thay vì phát file tĩnh, hệ thống sẽ:
   * 1. Tìm URL từ petVoices.js dựa trên tên hành động
   * 2. Kiểm tra xem URL có hợp lệ không
   * 3. Ngăn chặn âm thanh chồng chéo (overlap prevention)
   * 4. Bật âm lượng đúng chuẩn
   * 5. Xử lý lỗi một cách lịch sự
   */
  playSound(actionName = 'greeting') {
    // KIỂM TRA: Voice Manager đã được khởi tạo chưa
    if (!this.voiceManager) {
      console.warn('⚠️ VoiceManager chưa được khởi tạo trong Mascot');
      return;
    }

    try {
      // PHÁT ÂM THANH BẰNG VOICE MANAGER - CẬP NHẬT CHO VOICE PACKS
      // Cú pháp mới: play('default', 'actionName')
      this.voiceManager.play('default', actionName, {
        volume: 0.7,
        interrupt: true
      });

      console.log(`🎵 Phát "${actionName}" từ pack "default"`);

    } catch (error) {
      console.error('❌ Lỗi khi phát âm thanh:', error);
    }
  }

  /**
   * CẬP NHẬT VỊ TRÍ TRÊN GIAO DIỆN
   * Sử dụng CSS transform để thay đổi vị trí (hiệu suất tốt hơn top/left)
   * 
   * CSS: transform: translate(-x, -y)
   * - Dấu âm (-) vì CSS sử dụng bottom/right (từ phải xuống dưới)
   */
  updatePosition() {
    // Sử dụng CSS variables hoặc style trực tiếp
    // Cách 1: Sử dụng style.bottom và style.right (đơn giản nhất)
    this.container.style.bottom = this.y + 'px';
    this.container.style.right = this.x + 'px';
  }

  /**
   * LƯU VỊ TRÍ LINH VẬT CHÍNH VÀO LOCALSTORAGE
   * 
   * ✅ [FIX] CHỈNHH GHI CHÚ:
   * - Hàm này lưu vị trí của Linh vật chính (mascot-image) CHỈNH
   * - KHÔNG ảnh hưởng đến Pet Avatar (pet-avatar-image)
   * - Pet Avatar ở cố định trong dashboard (không cần lưu vị trí)
   * 
   * Công việc:
   * - Lưu x, y, timestamp vào localStorage
   * - Các lần load trang tiếp theo mascot sẽ có vị trí cũ
   * - localStorage tồn tại cho đến khi user xóa cache
   */
  savePosition() {
    try {
      // Lưu dưới dạng JSON
      const positionData = {
        x: this.x,
        y: this.y,
        timestamp: new Date().getTime()
      };

      // ✅ [FIX] LƯU CHỈNH VÀO LOCALSTORAGE CÓ KEY: mascot-position
      // (Khác với avatar-position hoặc bất cứ thứ gì khác)
      localStorage.setItem('mascot-position', JSON.stringify(positionData));

      console.log('💾 Vị trí Linh vật chính đã lưu:', positionData);
    } catch (error) {
      console.warn('⚠️ Không thể lưu vị trí (localStorage full?):', error);
    }
  }

  /**
   * TẢI VỊ TRÍ LINH VẬT CHÍNH TỪ LOCALSTORAGE
   * 
   * ✅ [FIX] CHỈNHH GHI CHÚ:
   * - Hàm này tải vị trí của Linh vật chính (mascot-image) CHỈTNHH
   * - KHÔNG ảnh hưởng đến Pet Avatar (pet-avatar-image)
   * - Nếu chưa có vị trí lưu, dùng vị trí mặc định (20px từ dưới phải)
   * 
   * Công việc:
   * - Đọc key 'mascot-position' từ localStorage
   * - Phân tích JSON để lấy x, y
   * - Cập nhật vị trí trên giao diện
   */
  loadPosition() {
    try {
      // ✅ [FIX] ĐỌC VỊ TRÍ CHỈ DÀNH CHO LINH VẬT CHÍNH
      const saved = localStorage.getItem('mascot-position');

      if (saved) {
        const positionData = JSON.parse(saved);
        this.x = positionData.x;
        this.y = positionData.y;
        console.log('📍 Tải vị trí Linh vật chính từ localStorage:', positionData);
      } else {
        // Vị trí mặc định: 20px từ dưới, 20px từ phải
        this.x = 20;
        this.y = 20;
        console.log('📍 Sử dụng vị trí mặc định cho Linh vật chính');
      }

      // Cập nhật CSS để hiển thị mascot ở vị trí đúng
      this.updatePosition();
    } catch (error) {
      console.error('❌ Lỗi tải vị trí Linh vật chính:', error);
      this.x = 20;
      this.y = 20;
      this.updatePosition();
    }
  }

  /**
   * ẨN/HIỆN LINH VẬT CHÍNH
   * @param {boolean} hidden - true = ẩn, false = hiển thị
   * 
   * ✅ [FIX] CHỈNHH GHI CHÚ:
   * - Hàm này ẩn/hiển thị Linh vật chính (mascot-image) CHỈNHH
   * - KHÔNG ảnh hưởng đến Pet Avatar (pet-avatar-image)
   * - Avatar có class 'pet-avatar' riêng, không có class 'hidden'
   */
  setHidden(hidden) {
    if (hidden) {
      // Thêm class 'hidden' để ẩn Linh vật chính
      this.container.classList.add('hidden');
      console.log('🙈 Ẩn Linh vật chính');
    } else {
      // Loại bỏ class 'hidden' để hiển thị Linh vật chính
      this.container.classList.remove('hidden');
      console.log('👁️ Hiển thị Linh vật chính');
    }
  }
}

/**
 * KHỞI ĐỘNG LINH VẬT CHÍNH KHI TRANG LOAD XONG
 * 
 * ✅ [FIX] CHỈNHH GHI CHÚ:
 * - Hàm này khởi động Linh vật chính (mascot-image) CHỈTNHH
 * - KHÔNG khởi động Pet Avatar (pet-avatar-image)
 * - Avatar được điều khiển bởi pet.js (static display only)
 * 
 * 🎵 [VOICE SYSTEM INITIALIZATION]:
 * 1. Tạo VoiceManager với PET_VOICES
 * 2. Làm nó global (window.voiceManager) để dùng ở bất kỳ đâu
 * 3. Truyền vào Mascot class cho Linh vật chính
 * 
 * Gọi từ: app.js khi trang load xong
 */
export function initMascot() {
  // 🎵 KHỞI TẠO HỆ THỐNG QUẢN LÝ GIỌNG NÓI (VOICE MANAGER)
  // VoiceManager sẽ quản lý phát tất cả âm thanh từ Cloudinary cho Linh vật chính
  const voiceManager = new VoiceManager(PET_VOICES);

  // 📱 LÀMCHO VOICE MANAGER CÓ PHẠM VI GLOBAL
  // window.voiceManager có thể dùng từ bất kỳ đâu trong app
  // Ví dụ: window.voiceManager.play('levelUp')
  window.voiceManager = voiceManager;

  // ✅ [FIX] TẠO MASCOT INSTANCE CHỈ CHO LINH VẬT CHÍNH
  // Mascot class sử dụng:
  // - Element ID: mascot-image (linh vật chính draggable)
  // - KHÔNG sử dụng: pet-avatar-image (avatar static trong dashboard)
  const mascot = new Mascot(voiceManager);

  // CHỜ DOM SẴN SÀNG RỒI KHỞI TẠO MASCOT
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mascot.init();
      console.log('✅ Linh vật chính (Mascot) đã được khởi động thành công!');
    });
  } else {
    mascot.init();
    console.log('✅ Linh vật chính (Mascot) đã được khởi động thành công!');
  }

  // Return mascot instance để có thể điều khiển từ nơi khác nếu cần
  return mascot;
}
