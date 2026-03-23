# 🎵 Thư mục âm thanh Mascot

## Hướng dẫn thêm âm thanh cho linh vật

### 📁 Cấu trúc thư mục hiện tại:
```
assets/sounds/
├── README.md (tệp này)
└── mascot-click.mp3 (bạn sẽ thêm)
```

### 🎯 Các bước thêm âm thanh:

1. **Chuẩn bị file âm thanh**
   - Chuẩn bị file âm thanh: `.mp3`, `.ogg`, hoặc `.wav`
   - Dung lượng nên nhỏ (< 100KB) để load nhanh
   - Độ dài âm thanh: 0.5-2 giây là tốt nhất

2. **Đặt file vào thư mục này**
   - Đặt file `mascot-click.mp3` (hoặc tên file khác) vào folder này

3. **Cập nhật đường dẫn trong mascot.js**
   - Mở file: `frontend/js/mascot.js`
   - Tìm hàm `playSound()`
   - Sửa dòng này:
     ```javascript
     const audioPath = './assets/sounds/mascot-click.mp3';
     ```
   - Thay `mascot-click.mp3` bằng tên file âm thanh của bạn

### 📝 Ví dụ:
```javascript
// Nếu file âm thanh của bạn là mascot-squeak.ogg
const audioPath = './assets/sounds/mascot-squeak.ogg';

// Hoặc nếu file là notify.wav
const audioPath = './assets/sounds/notify.wav';
```

### 🔊 Điều chỉnh âm lượng
- Mở file `frontend/js/mascot.js`
- Tìm dòng: `audio.volume = 0.7;`
- Thay số: 
  - `0.5` = nhỏ (50%)
  - `0.7` = trung bình (70%) - mặc định hiện tại
  - `1.0` = tối đa (100%)

### 💡 Gợi ý file âm thanh:
- 🎵 Tiếng "click" nhẹ nhàng
- 🎵 Tiếng "ding" ngắn
- 🎵 Tiếng "pop" vui vẻ (từ Freesound hoặc Zapsplat)

### 🔗 Nguồn tài nguyên âm thanh miễn phí:
- Freesound.org - Âm thanh miễn phí có chất lượng cao
- Zapsplat.com - Hiệu ứng âm thanh miễn phí
- OpenGameArt.org - Tài nguyên game miễn phí

---

## ✅ Checklist hoàn tất:
- [ ] Tìm được file âm thanh `.mp3` hoặc `.ogg`
- [ ] Copy file vào thư mục này (`frontend/assets/sounds/`)
- [ ] Cập nhật đường dẫn trong `mascot.js`
- [ ] Kiểm tra console khi click mascot (phải in "🎵 Mascot được click")

---

**💬 Lưu ý:** Nếu bạn muốn thêm nhiều âm thanh khác nhau:
- Tạo thêm file như `mascot-hover.mp3`, `mascot-idle.mp3`
- Thêm hàm riêng trong mascot.js để phát các âm thanh khác
