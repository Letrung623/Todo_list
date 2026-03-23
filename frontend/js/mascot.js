/* ==========================================================================
   FILE: mascot.js
   CÔNG DỤNG: Xử lý tất cả logic linh vật (mascot):
              - Di chuyển tự do trên màn hình (drag and drop)
              - Lưu vị trí vào localStorage
              - Tương tác click để phát âm thanh
              - Hiệu ứng sinh động
   ========================================================================== */

/**
 * MASCOT CLASS
 * Quản lý toàn bộ chức năng của linh vật từ khởi tạo đến tương tác
 */
class Mascot {
  constructor() {
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
   * GẮN EVENT LISTENERS
   * - mousedown/touchstart → Bắt đầu kéo
   * - mousemove/touchmove → Đang kéo
   * - mouseup/touchend → Kết thúc kéo
   * - click → Phát âm thanh (nếu không phải kéo)
   */
  bindEvents() {
    // ========== SỰ KIỆN BẮT ĐẦU KÉO ==========
    // mousedown = sự kiện chuột nhấn xuống
    // touchstart = sự kiện chạm trên thiết bị di động
    this.image.addEventListener('mousedown', (e) => this.startDrag(e));
    this.image.addEventListener('touchstart', (e) => this.startDrag(e));

    // ========== SỰ KIỆN ĐANG KÉO ==========
    // Sử dụng document để bắt chuyển động chuột ở bất kỳ vị trí nào
    document.addEventListener('mousemove', (e) => this.dragMascot(e));
    document.addEventListener('touchmove', (e) => this.dragMascot(e), { passive: false });

    // ========== SỰ KIỆN KẾT THÚC KÉO ==========
    document.addEventListener('mouseup', () => this.endDrag());
    document.addEventListener('touchend', () => this.endDrag());

    // ========== SỰ KIỆN CLICK (TƯƠNG TÁC) ==========
    // Phát âm thanh khi click (nếu không phải kéo)
    this.image.addEventListener('click', (e) => this.onMascotClick(e));
  }

  /**
   * BẮT ĐẦU KÉO LINH VẬT
   * @param {MouseEvent|TouchEvent} e - Sự kiện chuột hoặc chạm
   * 
   * Tính toán:
   * - dragOffsetX/Y = khoảng cách từ vị trí click đến tâm element
   * - Điều này giúp element không bị "nhảy" khi bắt đầu kéo
   */
  startDrag(e) {
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
  }

  /**
   * ĐANG KÉO LINH VẬT
   * @param {MouseEvent|TouchEvent} e - Sự kiện chuột hoặc chạm
   * 
   * Cập nhật vị trí theo chuột/ngón tay của người dùng
   * Chuyển đổi từ tọa độ (x,y) sang (bottom, right) và ngược lại
   */
  dragMascot(e) {
    // Nếu không đang kéo, dừng hàm
    if (!this.isDragging) return;

    // Ngăn hành động mặc định (ví dụ: scroll khi chạm)
    e.preventDefault?.();

    // Lấy tọa độ chuột/ngón tay
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    // ✏️ SỬA: Tính khoảng cách di chuyển thực tế từ vị trí ban đầu
    const 거리X = Math.abs(clientX - this.dragStartX);
    const distanceY = Math.abs(clientY - this.dragStartY);
    const movementDistance = Math.sqrt(거리X ** 2 + distanceY ** 2);

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
   * KẾT THÚC KÉO LINH VẬT
   * - Bỏ flag isDragging
   * - Loại bỏ class CSS dragging
   * - Lưu vị trí vào localStorage
   */
  endDrag() {
    if (!this.isDragging) return;

    this.isDragging = false;

    // Loại bỏ class dragging
    this.image.classList.remove('dragging');

    // Lưu vị trí vào localStorage để không quên sau khi reload trang
    this.savePosition();
  }

  /**
   * XỬ LÝ CLICK VÀO LINH VẬT
   * @param {MouseEvent} e - Sự kiện click
   * 
   * Khi click vào linh vật:
   * 1. Phát hiệu ứng bounce (nhảy)
   * 2. Phát âm thanh (nếu người dùng drag < 10px, coi như click)
   */
  onMascotClick(e) {
    // ✏️ SỬA: Kiểm tra xem có phải là "drag thực sự" hay không
    // Nếu wasReallyDragged = true, tức là người dùng đã di chuyển > 10px
    // Trong trường hợp đó, bỏ qua click event (không phát âm thanh)
    if (this.wasReallyDragged) {
      console.log('👋 Đây là drag, bỏ qua click event');
      return; // Đây là kéo, không phải click
    }

    // console.log('👍 Click thực sự được phát hiện!');

    // ========== HIỆU ỨNG BOUNCE ==========
    // Thêm class 'clicked' để chạy animation bounce
    this.image.classList.add('clicked');

    // Loại bỏ class sau animation kết thúc (0.4s = thời gian animation)
    setTimeout(() => {
      this.image.classList.remove('clicked');
    }, 400);

    // ========== PHÁT ÂM THANH ==========
    // ✏️ SỬA: Gọi playSound() để phát âm thanh khi click
    // console.log('🎵 Phát âm thanh mascot...');
    this.playSound();
  }

  /**
   * PHÁT ÂM THANH
   * 
   * HẠNG MỤC AUDIO (bạn sắp thêm):
   * ========================================
   * audioPath: Đường dẫn đến file âm thanh
   * - assets/sounds/mascot-click.mp3  (sẽ thêm sau)
   * - assets/sounds/mascot-squeak.ogg (hoặc định dạng khác)
   * 
   * CÁCH GẮN ÂM THANH:
   * 1. Tạo file âm thanh .mp3/.ogg
   * 2. Đặt trong thư mục assets/sounds/
   * 3. Sửa audioPath trong hàm này
   * 4. AudioContext sẽ tự động phát
   */
  playSound() {
    try {
      // 🔇 ĐƯỜNG DẪN ÂMTHANH (BẠN SẮP THÊM)
      // Thay đổi đường dẫn theo file âm thanh của bạn
      const audioPath = './assets/sounds/gai.mp3';

      // Tạo audio element
      const audio = new Audio(audioPath);

      // Đặt âm lượng (0 = im lặng, 1 = tối đa)
      audio.volume = 0.7;

      // Phát âm thanh
      audio.play().catch(error => {
        // Nếu lỗi (ví dụ: file không tìm thấy), log warning
        console.warn('⚠️ Không thể phát âm thanh:', error);
        console.log('📝 Hãy thêm file âm thanh vào ./assets/sounds/');
      });

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
   * LƯU VỊ TRÍ VÀO LOCALSTORAGE
   * Các lần load trang tiếp theo mascot sẽ có vị trí cũ
   * 
   * localStorage là storage nhỏ trong browser của người dùng
   * Dữ liệu tồn tại cho đến khi user xóa cache hoặc clear data
   */
  savePosition() {
    try {
      // Lưu dưới dạng JSON
      const positionData = {
        x: this.x,
        y: this.y,
        timestamp: new Date().getTime()
      };

      // Lưu vào localStorage với key 'mascot-position'
      localStorage.setItem('mascot-position', JSON.stringify(positionData));

      // console.log('💾 Vị trí linh vật đã lưu:', positionData);
    } catch (error) {
      console.warn('⚠️ Không thể lưu vị trí (localStorage full?):', error);
    }
  }

  /**
   * TẢI VỊ TRÍ TỪ LOCALSTORAGE
   * Nếu chưa có vị trí lưu, dùng vị trí mặc định (20px từ dưới phải)
   */
  loadPosition() {
    try {
      const saved = localStorage.getItem('mascot-position');

      if (saved) {
        const positionData = JSON.parse(saved);
        this.x = positionData.x;
        this.y = positionData.y;
        console.log('📍 Tải vị trí từ localStorage:', positionData);
      } else {
        // Vị trí mặc định: 20px từ dưới, 20px từ phải
        this.x = 20;
        this.y = 20;
        console.log('📍 Sử dụng vị trí mặc định');
      }

      // Cập nhật CSS để hiển thị mascot ở vị trí đúng
      this.updatePosition();
    } catch (error) {
      console.error('❌ Lỗi tải vị trí:', error);
      this.x = 20;
      this.y = 20;
      this.updatePosition();
    }
  }

  /**
   * ẨN/HIỆN LINH VẬT
   * @param {boolean} hidden - true = ẩn, false = hiển thị
   */
  setHidden(hidden) {
    if (hidden) {
      this.container.classList.add('hidden');
    } else {
      this.container.classList.remove('hidden');
    }
  }
}

/**
 * KHỞI ĐỘNG MASCOT KHI TRANG LOAD XONG
 * Gọi từ app.js
 */
export function initMascot() {
  // Tạo instance mascot mới
  const mascot = new Mascot();

  // Chờ DOM sẵn sàng rồi khởi tạo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mascot.init();
    });
  } else {
    mascot.init();
  }

  // Return mascot instance để có thể điều khiển từ nơi khác nếu cần
  return mascot;
}
