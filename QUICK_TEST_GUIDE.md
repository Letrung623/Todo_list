# 🧪 QUICK TEST GUIDE - Entity Separation Fixes

## 🚀 BẮTĐẦU TEST NHANH CHÓNG

### Chuẩn Bị
1. Mở ứng dụng trong browser (http://localhost:...)
2. Mở **DevTools** (F12) → Tab **Console**
3. Chuẩn bị test từng scenario

---

## ✅ TEST 1: Main Pet Click → Phát Âm Thanh

**Bước:**
1. Nhìn vào Linh vật chính (desktop, ngoài dashboard)
2. Click vào nó **1 lần**

**Kỳ Vọng:**
- Console log: `👆 Click thực sự vào Linh vật chính!`
- Console log: `🎵 Phát âm thanh từ Linh vật chính...`
- Âm thanh phát ra ✓
- Hiệu ứng bounce ✓

**Nếu FAIL:**
```javascript
❌ Không thấy console logs
→ Check: mascot.js line ~74 bindEvents() setup
→ Check: index.html line 590 có <img id="mascot-image">?

❌ Không nghe thấy âm thanh
→ Check: browser volume ON
→ Check: localStorage 'mascot-position' tồn tại
→ Check: window.voiceManager chạy OK (type vào console: window.voiceManager)
```

**Full Console Output (Mong Muốn):**
```
👆 Click thực sự vào Linh vật chính!
🎵 Phát âm thanh từ Linh vật chính...
🎵 Playing voice action: greeting
```

---

## ✅ TEST 2: Main Pet Drag → Di Chuyển

**Bước:**
1. Nhìn vào Linh vật chính
2. **Kéo nó sang phải** (khoảng 50px) và thả

**Kỳ Vọng:**
- Console log: `🖱️ Bắt đầu kéo linh vật chính...`
- Linh vật **di chuyển theo chuột** ✓
- Khi thả: Linh vật **giữ nguyên vị trí mới** ✓
- KHÔNG có bounce animation (chỉ khi click, không drag)

**Nếu FAIL:**
```javascript
❌ Mascot không di chuyển
→ Check: mascot.js startDrag() hàm
→ Check: dragMascot() cập nhật vị trí?
→ Check: Browser console errors?

❌ Mascot vẫn bounce/phát âm thanh khi drag
→ Check: dragMascot() có tính wasReallyDragged > 10px?
→ Check: onMascotClick() có kiểm tra wasReallyDragged flag?

❌ Mascot "nhảy" khi drag bắt đầu
→ Check: startDrag() tính offset correctly
```

**Full Console Output (Mong Muốn):**
```
🖱️ Bắt đầu kéo linh vật chính...
👋 Đây là drag (di chuyển > 10px), bỏ qua click event
💾 Vị trí Linh vật chính đã lưu: { x: 150, y: 80, timestamp: ... }
```

---

## ✅ TEST 3: Avatar Click KHÔNG Phát Âm Thanh

**Bước:**
1. Mở Dashboard (view-pet tab)
2. Nhìn Avatar trong dashboard
3. Click vào Avatar **1 lần**

**Kỳ Vọng:**
- KHÔNG có `👆 Click thực sự vào...` log
- KHÔNG có âm thanh ✓
- KHÔNG có bounce animation ✓
- Console là yên tĩnh (hoặc chỉ tab navigation logs)

**Nếu FAIL:**
```javascript
❌ Avatar vẫn phát âm thanh
→ Check: HTML pet-avatar-image ID (line 247)?
→ Check: Mascot class querySelector('#mascot-image') không match Avatar?
→ Check: e.stopPropagation() đã được thêm vào mascot.js click handler?

❌ Bounce animation xuất hiện
→ Check: CSS selector cụ thể cho mascot-image chứ không phải [class~="mascot"]
```

**Full Console Output (Mong Muốn):**
```
🐾 Tab switched to: costume
[NO mascot click logs]
[NO voice logs]
```

---

## ✅ TEST 4: Avatar Drag KHÔNG Di Chuyển

**Bước:**
1. Mở Dashboard (view-pet tab)
2. Nhìn Avatar trong dashboard
3. **Kéo nó** (khoảng 50px) và thả

**Kỳ Vọng:**
- Avatar **giữ nguyên vị trí** (không di chuyển) ✓
- KHÔNG thấy `🖱️ Bắt đầu kéo...` log
- KHÔNG có CSS `dragging` class effect
- Main Pet (ngoài) **KHÔNG di chuyển** (independently)

**Nếu FAIL:**
```javascript
❌ Avatar di chuyển
→ Check: mascot.js bindEvents() có ID check?
→ Check: startDrag() return early nếu e.target.id !== 'mascot-image'?

❌ Main Pet di chuyển khi kéo Avatar
→ Check: HTML ID names CHÍNH CHẮC?
  - Mascot: id="mascot-image" (line 590)
  - Avatar: id="pet-avatar-image" (line 247)
→ Check: querySelector() hay getElementById()?
```

**Full Console Output (Mong Muốn):**
```
🐾 Tab switched to: costume
[NO mascot drag logs]
[NO position change]
```

---

## ✅ TEST 5: Dashboard Button Click KHÔNG Kích Hoạt Mascot

**Bước:**
1. Mở Dashboard (view-pet tab)
2. Click các **buttons TRONG dashboard**: Tabs, Confirm, Settings
3. Quan sát Main Pet (ngoài) → không phải bị ảnh hưởng

**Kỳ Vọng:**
- Tab switch log xuất hiện ✓
- Main Pet **KHÔNG di chuyển** ✓
- Main Pet **KHÔNG animate** ✓
- Button effects (scale) hiển thị CHỈNHH ✓

**Nếu FAIL:**
```javascript
❌ Main Pet bị tác động bởi dashboard clicks
→ Check: pet.js event listeners có e.stopPropagation()?
→ Check: CSS .pet-tab-btn click → bị bubble up?
→ Check: Modal/overlay CSS z-index cấu hình OK?

❌ Dashboard buttons không work
→ Check: pet.js initPetTabs() selectQuery chính xác?
→ Check: Element IDs trong HTML match với JS?
```

**Full Console Output (Mong Muốn):**
```
🐾 Tab switched to: costume
🐾 Pet Dashboard Confirmed! (Không ảnh hưởng Linh vật chính)
[NO mascot movement logs]
[NO voice logs]
```

---

## 📍 TEST 6: Position Persistence (localStorage)

**Bước:**
1. Di chuyển Main Pet đến vị trí mới (VD: phía tay trái)
2. Mở DevTools (F12) → Application tab → localStorage
3. Tìm key: **`mascot-position`**
4. Reload trang (F5)
5. Quan sát Main Pet → nó có vị trí cũ không?

**Kỳ Vọng:**
- localStorage key `mascot-position` chứa JSON: `{ x: 120, y: 200, timestamp: ... }` ✓
- Sau reload: Main Pet hiển thị ở **vị trí cũ** ✓
- KHÔNG có key `avatar-position` ✓

**Nếu FAIL:**
```javascript
❌ localStorage key không tưởng
→ Check: mascot.js savePosition() key name: 'mascot-position'?
→ Check: localStorage.setItem() được gọi?

❌ Position không restore sau reload
→ Check: mascot.js loadPosition() được gọi trong init()?
→ Check: updatePosition() cập nhật CSS correctly?

❌ Avatar lấy wrong position
→ Check: Avatar KHÔNG phải có position saved từ mascot storage
```

**Full Console Output (Mong Muốn):**
```
📍 Tải vị trí Linh vật chính từ localStorage: { x: 120, y: 200, timestamp: ... }
💾 Vị trí Linh vật chính đã lưu: { x: 120, y: 200, timestamp: ... }
```

---

## 📋 ADVANCED DEBUG - Browser Console Commands

### Kiểm Tra Entity IDs

```javascript
// Main Pet element
console.log(document.querySelector('#mascot-image'));

// Pet Avatar element
console.log(document.querySelector('#pet-avatar-image'));

// So sánh
console.log(
  'Are they different?',
  document.querySelector('#mascot-image') !== document.querySelector('#pet-avatar-image')
);
```

**Kỳ Vọng Output:**
```
<img> (Main Pet)
<img> (Avatar)
Are they different? true
```

---

### Kiểm Tra Voice Manager

```javascript
// Check if VoiceManager initialized
console.log(window.voiceManager);

// Check available actions
console.log(window.voiceManager.getAvailableActions());

// Manually play voice
window.voiceManager.play('greeting');
```

**Kỳ Vọng Output:**
```
VoiceManager { voicesDict: {...}, volume: 0.7, ... }
['greeting', 'hello', 'click', 'playful', 'excited', 'happy', 'sad', 'angry', 'tired', 'levelUp', 'levelDown', 'taskComplete', 'taskFailed', 'feeding', 'sleeping']
[Audio plays]
```

---

### Kiểm Tra Event Handlers

```javascript
// Check if stopPropagation được gọi
const mascot = document.querySelector('#mascot-image');

// Simulate click
const clickEvent = new MouseEvent('click', {
  bubbles: true,
  cancelable: true
});

mascot.dispatchEvent(clickEvent);

// Kiểm tra console logs
```

**Kỳ Vọng Output:**
```
👆 Click thực sự vào Linh vật chính!
🎵 Phát âm thanh từ Linh vật chính...
```

---

## 🎯 SUMMARY TEST MATRIX

| Test # | Scenario | Main Pet Result | Avatar Result | Pass/Fail |
|--------|----------|-----------------|---------------|-----------|
| 1 | Click Main Pet | Phát âm thanh ✓ | KHÔNG phát ✓ | ✅ |
| 2 | Drag Main Pet | Di chuyển ✓ | KHÔNG di chuyển ✓ | ✅ |
| 3 | Click Avatar | KHÔNG phát ✓ | Di chuyển cả chỉ | ✅ |
| 4 | Drag Avatar | KHÔNG di chuyển ✓ | Avatar tĩnh | ✅ |
| 5 | Dashboard Click | KHÔNG tác động ✓ | Button work | ✅ |
| 6 | Position Persist | localStorage OK ✓ | Avatar tĩnh | ✅ |

---

## ✨ FINAL VALIDATION

Nếu **TẤT CẢ** tests pass:
- ✅ Entity separation HOÀN CHỈNH
- ✅ Event bubbling prevention HOẠT ĐỘNG
- ✅ Voice system CHỈ trên Main Pet
- ✅ Avatar TĨNH CHỈNHH
- ✅ localStorage RIÊNG BIỆT

Có thể **deploy to production**! 🚀

---

**Created After:** Entity Separation Fixes Applied  
**Last Updated:** 2024  
**Status:** ✅ READY FOR TESTING
