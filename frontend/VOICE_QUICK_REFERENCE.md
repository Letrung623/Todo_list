# 🎵 Hệ Thống Giọng Nói - Hướng Dẫn Nhanh

## 📁 Các Tệp Tin Tạo

| Tệp Tin | Mục Đích |
|---------|---------|
| `petVoices.js` | 📚 Lưu trữ tất cả URLs Cloudinary |
| `voiceManager.js` | 🎛️ Service quản lý phát âm thanh |
| `mascot.js` | 🐾 Đã cập nhật để dùng Voice Manager |
| `README_VOICE.md` | 📖 Tài liệu đầy đủ |
| `VOICE_INTEGRATION_EXAMPLES.js` | 💡 Ví dụ code |

---

## ⚡ Cách Dùng Nhanh (2 Phút)

### 1. Phát Âm Thanh Đơn Giản
```javascript
window.voiceManager.play('greeting')
```

### 2. Phát Với Tùy Chọn
```javascript
window.voiceManager.play('levelUp', {
  volume: 0.9,      // 90% âm lượng
  interrupt: true   // Ngắt âm thanh cũ
})
```

### 3. Dừng Phát
```javascript
window.voiceManager.stop()
```

### 4. Điều Chỉnh Âm Lượng
```javascript
window.voiceManager.setVolume(0.8)  // 80%
```

### 5. Bật/Tắt
```javascript
window.voiceManager.setEnabled(false)  // Tắt
window.voiceManager.setEnabled(true)   // Bật
```

---

## 🎵 Danh Sách Giọng Nói Sẵn Có

**Chào Hỏi:** `greeting`, `hello`

**Tương Tác:** `click`, `playful`, `excited`

**Cảm Xúc:** `happy`, `sad`, `angry`, `tired`

**Game:** `levelUp`, `levelDown`, `taskComplete`, `taskFailed`

**Hoạt Động:** `feeding`, `sleeping`, `evolving`

---

## ➕ Thêm Giọng Nói Mới (3 Bước)

### Bước 1: Upload Lên Cloudinary
- Truy cập https://cloudinary.com/console
- Upload file .mp3
- Copy URL

### Bước 2: Sửa `petVoices.js`
```javascript
export const PET_VOICES = {
  // Thêm dòng này
  myNewVoice: 'https://res.cloudinary.com/...'
}
```

### Bước 3: Sử Dụng
```javascript
window.voiceManager.play('myNewVoice')
```

---

## 💡 Ví Dụ Phổ Biến

### Click Pet
```javascript
window.voiceManager.play('greeting')
```

### Hoàn Thành Task
```javascript
window.voiceManager.play('taskComplete', {
  volume: 0.8,
  interrupt: false,
  queue: true
})
```

### Pet Lên Level
```javascript
window.voiceManager.play('levelUp', { volume: 0.9 })
```

### Giọng Ngẫu Nhiên
```javascript
const voices = ['happy', 'playful', 'excited']
const random = voices[Math.floor(Math.random() * voices.length)]
window.voiceManager.play(random)
```

---

## 🔧 API Tham Khảo

| Hàm | Mô Tả |
|-----|-------|
| `play(action, options)` | Phát âm thanh |
| `stop()` | Dừng phát |
| `setVolume(0-1)` | Đặt âm lượng |
| `setEnabled(true/false)` | Bật/tắt |
| `getAvailableActions()` | Danh sách hành động |
| `clearQueue()` | Xóa hàng đợi |
| `getStats()` | Xem thống kê |

---

## ⚙️ Tùy Chọn Phát

```javascript
voiceManager.play('action', {
  volume: 0.7,        // 0-1 (mặc định: 0.7)
  interrupt: true,    // Ngắt cũ (mặc định: true)
  queue: false        // Queue (mặc định: false)
})
```

---

## 🐛 Debug Nhanh

```javascript
// Bật debug mode
window.voiceManager.debug = true

// Xem danh sách hành động
console.log(window.voiceManager.getAvailableActions())

// Xem thống kê
console.log(window.voiceManager.getStats())

// Test phát
window.voiceManager.play('greeting')
```

---

## 📚 Tài Liệu Đầy Đủ

👉 Xem [README_VOICE.md](README_VOICE.md) để biết thêm chi tiết

👉 Xem [VOICE_INTEGRATION_EXAMPLES.js](js/VOICE_INTEGRATION_EXAMPLES.js) để xem ví dụ

---

## ❓ Câu Hỏi Thường Gặp

**Q: Âm thanh không phát?**
A: Kiểm tra browser có mute không, test URL trực tiếp

**Q: Làm thế nào để thêm giọng nói?**
A: Upload lên Cloudinary, copy URL vào petVoices.js

**Q: Phát 2 âm thanh cùng lúc?**
A: Quá không được! Dùng `queue: true` hoặc `interrupt: true`

**Q: Làm cách nào để bật/tắt âm thanh?**
A: `window.voiceManager.setEnabled(false/true)`

---

**🎉 Xong! Bạn đã sẵn sàng sử dụng hệ thống voice này**
