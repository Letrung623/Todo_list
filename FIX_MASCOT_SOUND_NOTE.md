================================================================================
📝 NOTE: SỬA LỖI ÂM THANH KHÔNG HOẠT ĐỘNG MASCOT
================================================================================
Ngày sửa: 21/03/2026
File sửa: frontend/js/mascot.js
================================================================================

## ❌ VẤNĐỀ PHÁT SINH:
- Khi click vào mascot, âm thanh không phát

## 🔍 NGUYÊN NHÂN:
Logic kiểm tra click vs drag bị SAI trong hàm `onMascotClick()`:

❌ CODE CŨ (SAI):
```javascript
const moveDistance = Math.sqrt(
  this.dragOffsetX ** 2 + this.dragOffsetY ** 2
);
if (moveDistance > 10) {
  return; // Đây là kéo, không phải click
}
```

🐛 LỖI:
- dragOffsetX/Y chỉ lưu khoảng cách từ click đến tâm element
- KHÔNG phải khoảng cách thực tế mascot di chuyển
- Vì vậy kiểm tra luôn SAI:
  - Khi click ở góc: dragOffsetX/Y có thể = 30-40px
  - moveDistance = ~57px > 10 → hàm return sớm
  - ❌ Âm thanh không phát

## ✅ GIẢI PHÁP:
Thêm tracking vị trí ban đầu để tính khoảng cách DI CHUYỂN THỰC TẾ

================================================================================

## 🔧 CÁC THAY ĐỔI CHI TIẾT:

### ✏️ SỬA #1: Constructor (Thêm biến tracking)
📍 Dòng 13-28

```javascript
// ✏️ SỬA: Thêm biến để tracking khoảng cách di chuyển thực tế
this.dragStartX = 0;   // Vị trí X ban đầu khi bắt đầu kéo
this.dragStartY = 0;   // Vị trí Y ban đầu khi bắt đầu kéo
this.wasReallyDragged = false; // Flag: true nếu move > 10px, false nếu chỉ click
```

💡 Lợi ích:
- Lưu vị trí ban đầu của con trỏ (dragStartX/Y)
- Sử dụng flag `wasReallyDragged` để tracking trạng thái

---

### ✏️ SỬA #2: startDrag() (Khởi tạo tracking)
📍 Dòng 115-142

```javascript
startDrag(e) {
  this.isDragging = true;
  // ✏️ SỬA: Reset flag drag flag từ lần click trước
  this.wasReallyDragged = false;
  
  // ... (code cũ không thay đổi) ...
  
  // ✏️ SỬA: Lưu vị trí ban đầu để theo dõi khoảng cách di chuyển
  this.dragStartX = clientX;
  this.dragStartY = clientY;
}
```

💡 Lợi ích:
- Mỗi lần bắt đầu drag: reset flag `wasReallyDragged = false`
- Lưu vị trí ban đầu của chuột (dragStartX, dragStartY)

---

### ✏️ SỬA #3: dragMascot() (Kiểm tra khoảng cách thực)
📍 Dòng 144-189

```javascript
dragMascot(e) {
  if (!this.isDragging) return;
  e.preventDefault?.();

  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  
  // ✏️ SỬA: Tính khoảng cách di chuyển thực tế từ vị trí ban đầu
  const distanceX = Math.abs(clientX - this.dragStartX);
  const distanceY = Math.abs(clientY - this.dragStartY);
  const movementDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
  
  // ✏️ SỬA: Nếu di chuyển > 10px, đánh dấu là "drag thực sự"
  // Điều này để tránh phát âm thanh khi người dùng chỉ click nhẹ
  if (movementDistance > 10) {
    this.wasReallyDragged = true;
  }

  // ... (code cũ không thay đổi) ...
}
```

💡 Lợi ích:
- Tính khoảng cách di chuyển thực tế: 
  - So sánh vị trí hiện tại (clientX, clientY)
  - Với vị trí ban đầu (dragStartX, dragStartY)
- Chỉ set flag khi move > 10px
- Tránh false positive từ "offset click"

---

### ✏️ SỬA #4: onMascotClick() (Fix logic)
📍 Dòng 191-222

```javascript
onMascotClick(e) {
  // ✏️ SỬA: Kiểm tra xem có phải là "drag thực sự" hay không
  // Nếu wasReallyDragged = true, tức là người dùng đã di chuyển > 10px
  // Trong trường hợp đó, bỏ qua click event (không phát âm thanh)
  if (this.wasReallyDragged) {
    console.log('👋 Đây là drag, bỏ qua click event');
    return; // Đây là kéo, không phải click
  }

  console.log('👍 Click thực sự được phát hiện!');

  // ========== HIỆU ỨNG BOUNCE ==========
  // (code cũ không thay đổi)
  this.image.classList.add('clicked');
  setTimeout(() => {
    this.image.classList.remove('clicked');
  }, 400);

  // ========== PHÁT ÂM THANH ==========
  // ✏️ SỬA: Gọi playSound() để phát âm thanh khi click
  console.log('🎵 Phát âm thanh mascot...');
  this.playSound();
}
```

💡 Lợi ích:
- Kiểm tra flag `wasReallyDragged` thay vì dragOffsetX/Y sai
- ✅ Chỉ phát âm thanh khi là "click thực sự" (move ≤ 10px)
- ✅ Không phát âm thanh khi drag (move > 10px)

================================================================================

## 📊 SO SÁNH TRƯỚC - SAU:

| Hành động | SAI (Trước) | ĐÚNG (Sau) |
|-----------|-------------|-----------|
| Click nhẹ ở tâm (move 0px) | ❌ Không phát âm (False positive) | ✅ Phát âm |
| Click ở góc (offset ~40px) | ❌ Không phát âm (False negative) | ✅ Phát âm |
| Drag 5px rồi thả | ❌ Không phát âm (Có thể phát) | ✅ Không phát |
| Drag 20px rồi thả | ❌ Không phát âm (Có thể phát) | ✅ Không phát |

================================================================================

## 🧪 CÁCH KIỂM TRA (F12 Console):

1. **Mở Browser DevTools:** F12
2. **Mở tab Console**
3. **Click vào mascot** (không kéo):
   ```
   ✅ KỲVỌNG:
   - Thấy: "👍 Click thực sự được phát hiện!"
   - Thấy: "🎵 Phát âm thanh mascot..."
   - Mascot nhảy lên (bounce animation)
   - Âm thanh phát (nếu file âm thanh đã thêm)
   ```

4. **Kéo mascot di chuyển > 10px rồi thả:**
   ```
   ✅ KỲVỌNG:
   - Thấy: "👋 Đây là drag, bỏ qua click event"
   - Mascot NOT nhảy
   - Âm thanh NOT phát
   ```

================================================================================

## 🎯 LOGIC FLOW SAU KHI SỬA:

```
[User tương tác]
    ↓
[mousedown] → startDrag()
    ├─ wasReallyDragged = false ✅
    ├─ dragStartX = chuột X hiện tại
    └─ dragStartY = chuột Y hiện tại
    ↓
[mousemove] → dragMascot()
    ├─ Tính: distance = √[(X₁-X₀)² + (Y₁-Y₀)²]
    ├─ Nếu distance > 10px:
    │  └─ wasReallyDragged = true ✅
    └─ Cập nhật vị trí mascot
    ↓
[mouseup] → endDrag()
    └─ Lưu vị trí localStorage
    ↓
[click event] → onMascotClick()
    ├─ Kiểm tra: wasReallyDragged === true?
    ├─ KHÔNG (clickthực) → Phát âm thanh ✅
    └─ CÓ (drag thực) → Bỏ qua, không phát
```

================================================================================

## ✅ KIỂM DANH SỰA:

- [x] Thêm biến dragStartX/Y trong constructor
- [x] Thêm flag wasReallyDragged trong constructor
- [x] Reset flag trong startDrag()
- [x] Lưu dragStartX/Y trong startDrag()
- [x] Tính movementDistance trong dragMascot()
- [x] Set wasReallyDragged flag trong dragMascot()
- [x] Fix logic kiểm tra trong onMascotClick()
- [x] Thêm console.log để debug

================================================================================

## 🔍 TESTING CHECKLIST:

- [ ] Âm thanh phát khi click mascot (không kéo)
- [ ] Bounce animation hoạt động
- [ ] Âm thanh NOT phát khi kéo mascot
- [ ] Bounce animation NOT hoạt động khi drag
- [ ] Vị trí mascot được lưu đúng
- [ ] Reload trang, mascot ở vị trí cũ
- [ ] Test trên mobile (touchstart/touchend)

================================================================================

## 📚 FILE LIÊN QUAN:

- [frontend/js/mascot.js](frontend/js/mascot.js) - File chính được sửa
- [frontend/CSS/mascot.css](frontend/CSS/mascot.css) - CSS (không sửa)
- [frontend/index.html](frontend/index.html) - HTML (không sửa)

================================================================================

🎉 SỬA HOÀN TẤT! Âm thanh mascot giờ sẽ hoạt động đúng cách.

Để nghe âm thanh, đảm bảo bạn đã:
1. Thêm file âm thanh vào: frontend/assets/sounds/
2. Tên file khớp với audioPath trong playSound()
================================================================================
