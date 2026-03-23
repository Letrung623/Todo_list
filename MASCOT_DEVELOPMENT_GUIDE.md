================================================================================
📋 HƯỚNG DẪN PHÁT TRIỂN CHỨC NĂNG LINH VẬT (MASCOT)
================================================================================

## 🎉 Những gì đã được tạo:

### 1️⃣ FILE CSS MỚI
📁 Đường dẫn: frontend/CSS/mascot.css
✨ Nội dung:
   - Styling cho container mascot (position: fixed, z-index: 9999)
   - Hiệu ứng hover (scale: 1.05)
   - Animation bounce khi click
   - Responsive design (tự động thay đổi kích thước theo màn hình)
   - Transition smooth cho drag effect

### 2️⃣ FILE JAVASCRIPT MỚI
📁 Đường dẫn: frontend/js/mascot.js
✨ Chức năng chính:
   ✅ CLASS Mascot:
      • init() - Khởi tạo mascot
      • bindEvents() - Gắn sự kiện chuột/chạm
      • startDrag(), dragMascot(), endDrag() - Xử lý kéo mascot
      • onMascotClick() - Xử lý click
      • playSound() - Phát âm thanh (chuẩn bị sẵn)
      • loadPosition() - Tải vị trí từ localStorage
      • savePosition() - Lưu vị trí vào localStorage
      
   ✅ EXPORT FUNCTION:
      • initMascot() - Hàm khởi động (gọi từ app.js)

   💾 Lưu trữ:
      - Vị trí mascot được lưu vào localStorage
      - Khi load trang tiếp theo, mascot sẽ ở vị trí cũ

### 3️⃣ CẬP NHẬT index.html
📝 Thay đổi:
   ✅ THÊM dòng 20: Link CSS mascot
      <link rel="stylesheet" href="CSS/mascot.css">
      
   ✅ THÊM dòng 467-484: HTML container cho mascot
      <div id="mascot-container">
          <img id="mascot-image" src="[ảnh placeholder]" .../>
      </div>
      
      📌 Hiện tại dùng:
         - SVG placeholder với emoji 🎭
         - Bạn sẽ thay bằng ảnh thực của mình

### 4️⃣ CẬP NHẬT app.js
📝 Thay đổi:
   ✅ THÊM dòng 13: Import mascot module
      import { initMascot } from './mascot.js';
      
   ✅ THÊM dòng 28-29: Gọi khởi tạo mascot
      initMascot();

### 5️⃣ THÀNH PHẦN ĐỌC CỬ LỰC SỲN SÀNG
📁 Thư mục: frontend/assets/
   
   📂 assets/sounds/ (cho âm thanh)
      • README.md - Hướng dẫn thêm âm thanh
      • mascot-click.mp3 (bạn sẽ thêm)
      
   📂 assets/images/ (cho hình ảnh)
      • README.md - Hướng dẫn thêm hình ảnh
      • mascot.png (bạn sẽ thêm)

================================================================================

## ⚙️ CHỨC NĂNG MASCOT:

### 1️⃣ DI CHUYỂN (Drag & Drop)
✨ Cách dùng:
   - Click và kéo mascot để di chuyển
   - Mascot có thể được kéo đến bất kỳ vị trí nào trên màn hình
   - Vị trí sẽ được tự động lưu (localStorage)
   - Khi reload trang, mascot vẫn ở vị trí cũ

🎨 Hiệu ứng:
   - Khi hover: Mascot phóng to lên 1.05x
   - Khi kéo: Opacity giảm, cursor hiển thị "grabbing"
   - Smooth transition: animation 0.1s

### 2️⃣ CLICK TƯƠNG TÁC
✨ Cách dùng:
   - Click vào mascot để tương tác
   - Hiệu ứng bounce (nhảy) được kích hoạt
   - Âm thanh sẽ phát (sau khi bạn thêm file)

🎨 Hiệu ứng:
   - Animation bounce: scale từ 1 → 1.15 → 1 (0.4s)
   - Xoay nhẹ: rotate ±5 độ
   - Tạo cảm giác sống động

### 3️⃣ ÂM THANH (Chuẩn bị sẵn)
📝 Cách thêm âm thanh:
   1. Tìm file âm thanh .mp3 hoặc .ogg (< 100KB)
   2. Đặt vào: frontend/assets/sounds/
   3. Mở: frontend/js/mascot.js
   4. Tìm hàm: playSound()
   5. Sửa dòng: const audioPath = './assets/sounds/mascot-click.mp3';
   
   ✅ HTML sẵn sàng:
      - Cấu trúc code để phát âm thanh
      - Hàm playSound() chờ file audio
      - Error handling nếu file không tìm thấy

### 4️⃣ ĐỘC LẬP VỚI GIAO DIỆN
✨ Thiết kế:
   - position: fixed (giữ vị trí cố định khi cuộn trang)
   - z-index: 9999 (luôn nằm ở trên cùng)
   - pointer-events: none trên container (không chặn click)
   - pointer-events: auto trên image (nhận click)
   
✅ Lợi ích:
   - Không bị CSS chính của app ảnh hưởng
   - Không gây lỗi giao diện
   - Hoạt động độc lập hoàn toàn

================================================================================

## 📱 CÁCH SỬ DỤNG:

### Bước 1: Thêm hình ảnh mascot
   a) Tìm ảnh mascot (PNG hoặc GIF)
   b) Đặt vào: frontend/assets/images/
   c) Mở: frontend/index.html
   d) Tìm dòng: <img id="mascot-image" src="...
   e) Sửa src="./assets/images/mascot.png"

### Bước 2: Thêm âm thanh mascot
   a) Tìm file âm thanh (.mp3 hoặc .ogg)
   b) Đặt vào: frontend/assets/sounds/
   c) Mở: frontend/js/mascot.js
   d) Tìm hàm: playSound()
   e) Sửa: const audioPath = './assets/sounds/mascot-click.mp3';

### Bước 3: Kiểm tra hoạt động
   a) Mở trình duyệt, reload trang
   b) Xem mascot hiển thị ở góc dưới phải
   c) Thử kéo mascot di chuyển
   d) Thử click mascot (sẽ thấy bounce animation)
   e) Mở DevTools (F12) để kiểm tra console

================================================================================

## 🔍 KIỂM TRA TRONG CONSOLE (F12):

✅ Bật console (F12) để xem thông báo:

1️⃣ Khởi tạo:
   "✅ Mascot đã được khởi tạo thành công"

2️⃣ Tải vị trí:
   "📍 Tải vị trí từ localStorage: {...}"
   Hoặc "📍 Sử dụng vị trí mặc định"

3️⃣ Lưu vị trí:
   "💾 Vị trí linh vật đã lưu: {...}"

4️⃣ Click mascot:
   "🎵 Mascot được click - Chuẩn bị phát âm thanh..."

5️⃣ Nếu không tìm thấy file âm thanh:
   "⚠️ Không thể phát âm thanh: NotFoundError"
   "📝 Hãy thêm file âm thanh vào ./assets/sounds/"

================================================================================

## 🐛 TROUBLESHOOTING:

❌ Mascot không hiển thị:
   ✅ Kiểm tra xem 'mascot-container' có trong index.html không
   ✅ Kiểm tra console xem có lỗi gì không
   ✅ Reload trang (Ctrl+F5)

❌ Mascot không kéo được:
   ✅ Kiểm tra xem mascot.js có được import không
   ✅ Kiểm tra console xem initMascot() có được gọi không
   ✅ Kiểm tra xem mascot-image có id đúng không

❌ Âm thanh không phát:
   ✅ Kiểm tra file audio có tồn tại không
   ✅ Kiểm tra đường dẫn audioPath trong playSound() đúng không
   ✅ Xem console xem có lỗi không
   ✅ Kiểm tra volume của trình duyệt/máy tính

❌ Vị trí mascot không được lưu:
   ✅ Kiểm tra localStorage xem có bị disabled không
   ✅ Thử xóa cache trình duyệt rồi reload

================================================================================

## 📚 CẤU TRÚC FILE:

```
Todo_list/
├── frontend/
│   ├── index.html ............ ✏️ ĐÃ SỬA (thêm CSS, HTML)
│   ├── CSS/
│   │   ├── mascot.css ........ ✨ TẠO MỚI
│   │   └── ... (file CSS khác)
│   ├── js/
│   │   ├── mascot.js ......... ✨ TẠO MỚI
│   │   ├── app.js ............ ✏️ ĐÃ SỬA (thêm import + gọi init)
│   │   └── ... (file JS khác)
│   └── assets/ ............... ✨ TẠO MỚI
│       ├── images/ ........... 📁 Thêm hình ảnh ở đây
│       │   ├── README.md
│       │   └── mascot.png ... (bạn sẽ thêm)
│       └── sounds/ ........... 📁 Thêm âm thanh ở đây
│           ├── README.md
│           └── mascot-click.mp3 (bạn sẽ thêm)
└── ... (folder backend, file khác)
```

================================================================================

## ✅ CHECKLIST HOÀN TẤT:

- [ ] Kiểm tra mascot.css tồn tại và link vào index.html
- [ ] Kiểm tra mascot.js tồn tại và import vào app.js
- [ ] Kiểm tra import { initMascot } trong app.js
- [ ] Kiểm tra initMascot() được gọi trong app.js
- [ ] Kiểm tra HTML container <div id="mascot-container"> trong index.html
- [ ] Kiểm tra <img id="mascot-image"> trong container
- [ ] Tạo thư mục assets/images/ và assets/sounds/
- [ ] Reload trang và xem mascot hiển thị
- [ ] Thử kéo mascot di chuyển
- [ ] Thử click mascot (xem animation bounce)
- [ ] Thêm file ảnh mascot trong assets/images/
- [ ] Cập nhật src trong index.html
- [ ] Thêm file âm thanh mascot trong assets/sounds/
- [ ] Cập nhật audioPath trong mascot.js
- [ ] Test phát âm thanh khi click

================================================================================

## 🎓 GHI CHÚ CHO VIDEO CODING:

✏️ ĐIỂM THÊM/SỬA TRONG CODE:

1. index.html:
   - Dòng 20: Thêm <link rel="stylesheet" href="CSS/mascot.css">
   - Dòng 467-484: Thêm <div id="mascot-container">...</div>

2. app.js:
   - Dòng 13: Thêm import { initMascot } from './mascot.js';
   - Dòng 28-29: Thêm initMascot();

3. Các file JÌA TẠO MỚI:
   - mascot.css (CSS styling)
   - mascot.js (logic mascot)
   - assets/sounds/README.md (hướng dẫn âm thanh)
   - assets/images/README.md (hướng dẫn hình ảnh)

================================================================================

Chúc bạn phát triển vui vẻ! 🚀✨

Nếu có câu hỏi, hãy check console (F12) để xem thông báo chi tiết. 💌
