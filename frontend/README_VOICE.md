# 📖 Hệ Thống Quản Lý Giọng Nói (Voice Management System)

## 🎯 Giới Thiệu

Đây là một hệ thống hoàn chỉnh để **phát âm thanh từ Cloudinary** cho nhân vật thú cưng (Pet) trong ứng dụng của bạn.

**Tính năng chính:**
- ✅ Phát âm thanh theo tên hành động
- ✅ Ngăn chặn âm thanh chồng chéo (không cho 2 âm thanh cùng phát)
- ✅ Kiểm tra URL hợp lệ trước khi phát
- ✅ Hàng đợi âm thanh (queue system)
- ✅ Dễ dàng mở rộng thêm giọng nói mới

---

## 📁 Cấu Trúc Tệp Tin

```
📂 frontend/
├── 📄 README_VOICE.md              ← Tài liệu này
├── 📂 js/
│   ├── petVoices.js                ← 📚 Dictionary URLs
│   ├── voiceManager.js             ← 🎛️ Service class
│   ├── mascot.js                   ← 🐾 Pet component (đã cập nhật)
│   └── ...
└── ...
```

---

## ⚡ Bắt Đầu Nhanh (5 Phút)

### 1️⃣ Import Hệ Thống

Trong `mascot.js`, chúng ta đã import sẵn:

```javascript
import { VoiceManager } from './voiceManager.js';
import { PET_VOICES } from './petVoices.js';
```

### 2️⃣ VoiceManager Đã Khởi Tạo

Quando gọi `initMascot()`:

```javascript
// VoiceManager được tạo tự động
window.voiceManager = new VoiceManager(PET_VOICES);
```

### 3️⃣ Phát Âm Thanh

```javascript
// Cách đơn giản nhất - click pet phát âm thanh greeting
window.voiceManager.play('greeting');

// Phát với tùy chọn nâng cao
window.voiceManager.play('levelUp', {
  volume: 0.9,      // Âm lượng 90%
  interrupt: true   // Ngắt âm thanh cũ
});
```

---

## 🎵 Danh Sách Hành Động Sẵn Có

### Hành Động Chào Hỏi
| Tên | Mô Tả |
|-----|-------|
| `greeting` | Giọng chào mừng |
| `hello` | Giọng nói "xin chào" |

### Hành Động Tương Tác
| Tên | Mô Tả |
|-----|-------|
| `click` | Phản ứng khi click pet |
| `playful` | Giọng vui vẻ |
| `excited` | Giọng phấn khích |

### Hành Động Cảm Xúc
| Tên | Mô Tả |
|-----|-------|
| `happy` | Giọng vui |
| `sad` | Giọng buồn |
| `angry` | Giọng tức giận |
| `tired` | Giọng mệt mỏi |

### Hành Động Game
| Tên | Mô Tả |
|-----|-------|
| `levelUp` | Lên level |
| `levelDown` | Hạ level |
| `taskComplete` | Hoàn thành nhiệm vụ |
| `taskFailed` | Nhiệm vụ thất bại |

### Hành Động Hoạt Động
| Tên | Mô Tả |
|-----|-------|
| `feeding` | Đang ăn |
| `sleeping` | Đang ngủ |
| `evolving` | Đang tiến hóa |

---

## 📝 Hướng Dẫn: Thêm Giọng Nói Mới

### **Bước 1: Upload File Âm Thanh lên Cloudinary**

1. Truy cập https://cloudinary.com/console
2. Click **Upload** hoặc kéo file .mp3 vào
3. Đợi upload hoàn tất
4. **Copy URL** từ Cloudinary (sẽ dạng: `https://res.cloudinary.com/...`)

### **Bước 2: Thêm vào `petVoices.js`**

Mở file `frontend/js/petVoices.js` và thêm dòng mới vào object `PET_VOICES`:

```javascript
export const PET_VOICES = {
  greeting: 'https://res.cloudinary.com/...',
  // ✅ Thêm dòng dưới đây (sao chép URL từ Cloudinary)
  myNewVoice: 'https://res.cloudinary.com/dqm5nlomg/video/upload/v1234567890/my_sound_abc.mp3',
  // ... các giọng nói khác ...
};
```

### **Bước 3: Sử Dụng Trong Code**

```javascript
// Phát giọng nới thêm
window.voiceManager.play('myNewVoice');

// Hoặc gắn vào sự kiện
document.getElementById('pet').addEventListener('click', () => {
  window.voiceManager.play('myNewVoice');
});
```

**Xong! 🎉 Giọng nới của bạn sẵn sàng sử dụng.**

---

## 💡 Ví Dụ Tích Hợp Thực Tế

### Ví Dụ 1: Phát Giọng Khi Click Pet

Đã tích hợp sẵn trong `mascot.js`:

```javascript
// Đã được tích hợp tự động khi click pet
// Gọi hàm: this.playSound('greeting')
```

### Ví Dụ 2: Phát Giọng Khi Pet Lên Level

Trong file `pet.js`:

```javascript
export function updatePetLevel(level) {
  const levelElement = document.getElementById('pet-level');
  if (levelElement) {
    levelElement.textContent = level;

    // 🎵 Phát âm thanh level up
    if (window.voiceManager) {
      window.voiceManager.play('levelUp', {
        volume: 0.9,
        interrupt: true
      });
    }
  }
}
```

### Ví Dụ 3: Phát Giọng Khi Hoàn Thành Task

Trong file `kanban.js`:

```javascript
export function completeTask(taskId) {
  // ... logic hoàn thành task ...

  // 🎵 Phát âm thanh task complete
  if (window.voiceManager) {
    window.voiceManager.play('taskComplete', {
      volume: 0.8,
      interrupt: false,  // Không ngắt, chờ phát sau
      queue: true        // Thêm vào hàng đợi
    });
  }
}
```

### Ví Dụ 4: Phát Giọng Ngẫu Nhiên

```javascript
function playRandomGreeting() {
  const greetings = ['greeting', 'hello', 'playful', 'excited'];
  const randomVoice = greetings[Math.floor(Math.random() * greetings.length)];
  
  window.voiceManager.play(randomVoice);
}
```

### Ví Dụ 5: Điều Chỉnh Âm Lượng

```javascript
// Đặt âm lượng toàn cục
window.voiceManager.setVolume(0.8);  // 80%

// Tắt/bật âm thanh
window.voiceManager.setEnabled(false);  // Tắt
window.voiceManager.setEnabled(true);   // Bật lại
```

---

## 🎛️ API Tham Khảo

### Phát Âm Thanh

```javascript
voiceManager.play(actionName, options)

// Tham số:
// - actionName: string (tên hành động như 'greeting', 'levelUp', etc.)
// - options: object tuỳ chọn
//   - volume: 0 đến 1 (mặc định: 0.7)
//   - interrupt: true/false (mặc định: true) - ngắt âm thanh cũ
//   - queue: true/false (mặc định: false) - thêm vào hàng đợi

// Ví dụ
voiceManager.play('happy', { volume: 0.8, interrupt: true })
```

### Dừng Phát

```javascript
// Dừng âm thanh đang phát
voiceManager.stop();
```

### Đặt Âm Lượng

```javascript
// 0 = im lặng, 1 = tối đa
voiceManager.setVolume(0.5);  // 50%
```

### Bật/Tắt Âm Thanh

```javascript
voiceManager.setEnabled(true);   // Bật
voiceManager.setEnabled(false);  // Tắt
```

### Lấy Danh Sách Hành Động

```javascript
const actions = voiceManager.getAvailableActions();
console.log(actions);  // ['greeting', 'hello', 'happy', ...]
```

### Xem Thống Kê

```javascript
const stats = voiceManager.getStats();
console.log(stats);
// {
//   isEnabled: true,          // Có bật không
//   currentVolume: 0.7,       // Âm lượng hiện tại
//   isPlaying: false,         // Có đang phát không
//   queueLength: 0,           // Số âm thanh trong hàng đợi
//   totalActions: 15          // Tổng số hành động
// }
```

### Xoá Hàng Đợi

```javascript
// Xoá tất cả âm thanh chưa phát
voiceManager.clearQueue();
```

---

## ⚙️ Tùy Chọn Nâng Cao

### Options Khi Phát Âm Thanh

```javascript
voiceManager.play('angry', {
  // ✅ volume: Âm lượng cho lần phát này (0-1)
  volume: 0.5,
  
  // ✅ interrupt: Ngắt âm thanh đang phát không?
  //    - true = ngắt cái cũ, phát cái mới (mặc định)
  //    - false = bỏ qua nếu đang có âm thanh
  interrupt: true,
  
  // ✅ queue: Nếu đang phát, có thêm vào hàng đợi không?
  //    - true = chờ phát sau
  //    - false = bỏ qua yêu cầu (mặc định)
  queue: false
})
```

### Khởi Tạo Nâng Cao

```javascript
// Trong app.js
const voiceManager = new VoiceManager(PET_VOICES);

// Bật/tắt debug mode (xem log chi tiết)
voiceManager.debug = true;

// Đặt âm lượng mặc định
voiceManager.setVolume(0.8);

// Tắt âm thanh ban đầu
voiceManager.setEnabled(false);
```

---

## 🐛 Xử Lý Lỗi Thường Gặp

### ❌ Lỗi: "Voice action not found"

**Nguyên nhân:** Gọi `voiceManager.play('wrong_name')` nhưng action này không tồn tại

**Cách sửa:**
```javascript
// ❌ SAI
voiceManager.play('hallo');

// ✅ ĐÚNG
voiceManager.play('greeting');  // Tồn tại trong PET_VOICES
```

### ❌ Lỗi: "Invalid URL for..."

**Nguyên nhân:** URL Cloudinary không hợp lệ (copy sai, typo, etc.)

**Cách sửa:**
1. Kiểm tra URL có bắt đầu bằng `https://` không
2. Copy lại từ Cloudinary Dashboard
3. Test URL trong browser (paste vào address bar)

### ❌ Âm thanh không phát

**Nguyên nhân có thể:**
- Browser bị mute
- File MP3 lỗi
- CORS issue từ Cloudinary

**Cách sửa:**
```javascript
// 1. Kiểm tra thống kê
console.log(voiceManager.getStats());

// 2. Bật debug mode
voiceManager.debug = true;
voiceManager.play('greeting');  // Xem log

// 3. Test trực tiếp
const audio = new Audio('https://...');
audio.play();
```

---

## 📊 Ví Dụ Tích Hợp Hoàn Chỉnh

File `app.js`:
```javascript
import { initMascot } from './mascot.js';

// Khởi tạo mascot (đã tự động tạo VoiceManager)
document.addEventListener('DOMContentLoaded', () => {
  initMascot();
  
  // Bây giờ có thể dùng window.voiceManager ở bất kỳ đâu
  console.log('✅ Voice Manager đã sẵn sàng');
});
```

File `pet.js`:
```javascript
export function playPetSound(actionName) {
  // Kiểm tra VoiceManager tồn tại
  if (!window.voiceManager) {
    console.error('VoiceManager chưa khởi tạo');
    return;
  }

  // Phát âm thanh
  window.voiceManager.play(actionName, {
    volume: 0.7,
    interrupt: true
  });
}

// Gọi từ bất kỳ đâu
onPetClick = () => playPetSound('greeting');
onTaskComplete = () => playPetSound('taskComplete');
onLevelUp = () => playPetSound('levelUp');
```

---

## ✅ Checklist: Thiết Lập Hoàn Chỉnh

- ✅ Đã tạo file `petVoices.js` với Dictionary
- ✅ Đã tạo file `voiceManager.js` với Service
- ✅ Đã cập nhật `mascot.js` để dùng Voice Manager
- ✅ VoiceManager được khởi tạo tự động khi load trang
- ✅ `window.voiceManager` có thể dùng global ở bất kỳ đâu
- ✅ Test phát âm thanh: Click vào pet sẽ phát giọng greeting

---

## 🎓 Học Tập Từng Bước

**Ngày 1:** Đọc tài liệu này, hiểu cách hoạt động

**Ngày 2:** Thêm giọng nói mới lên Cloudinary

**Ngày 3:** Tích hợp vào các sự kiện game (task complete, level up, etc.)

**Ngày 4+:** Tạo các pattern tùy chỉnh, analytics voice usage

---

## 🔍 Debug & Troubleshooting

### Xem Log Chi Tiết

```javascript
// Bật debug mode
window.voiceManager.debug = true;

// Phát âm thanh (sẽ thấy log chi tiết)
window.voiceManager.play('greeting');
```

### Kiểm Tra Trạng Thái

```javascript
// Xem tất cả hành động có sẵn
console.log(window.voiceManager.getAvailableActions());
// ['greeting', 'hello', 'happy', ...]

// Xem thống kê hệ thống
console.log(window.voiceManager.getStats());
// { isEnabled: true, currentVolume: 0.7, isPlaying: false, ... }
```

### Reset Hệ Thống

```javascript
// Tắt debug mode
window.voiceManager.debug = false;

// Dừng âm thanh đang phát
window.voiceManager.stop();

// Xoá hàng đợi
window.voiceManager.clearQueue();

// Đặt lại âm lượng mặc định
window.voiceManager.setVolume(0.7);
```

---

## 📱 Tương Thích Trình Duyệt

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

(Dùng Web Audio API chuẩn)

---

## 🎉 Hoàn Tất!

Bây giờ bạn đã có một hệ thống quản lý giọng nói hoàn chỉnh cho pet của mình! 

**Bước tiếp theo:**
1. Thêm giọng nói mới lên Cloudinary
2. Cập nhật `petVoices.js`
3. Gắn vào các sự kiện game
4. Tận hưởng! 🎵

---

## 📞 Hỗ Trợ Nhanh

**Câu hỏi:** Làm cách nào để thêm giọng nói?
**Trả lời:** Xem phần "Hướng Dẫn: Thêm Giọng Nói Mới"

**Câu hỏi:** Âm thanh không phát?
**Trả lời:** Xem phần "Xử Lý Lỗi Thường Gặp"

**Câu hỏi:** Làm sao để tắt âm thanh?
**Trả lời:** `window.voiceManager.setEnabled(false)`

---

**Chúc bạn phát triển ứng dụng thành công! 🚀**
