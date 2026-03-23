# 🖼️ Thư mục hình ảnh Mascot

## Hướng dẫn thêm hình ảnh cho linh vật

### 📁 Cấu trúc thư mục:
```
assets/images/
├── README.md (tệp này)
└── mascot.png (bạn sẽ thêm)
```

### 🎯 Các bước thêm hình ảnh:

1. **Chuẩn bị file hình ảnh**
   - Định dạng: `.png`, `.jpg`, `.webp`, hoặc `.gif`
   - Kích thước: nên vuông (80x80px, 100x100px, v.v.)
   - PNG với background trong suốt là tốt nhất
   - Dung lượng: < 50KB để load nhanh

2. **Đặt file hình ảnh vào thư mục này**
   - Ví dụ: `mascot.png` hoặc `pet.gif`

3. **Cập nhật đường dẫn trong index.html**
   - Mở file: `frontend/index.html`
   - Tìm dòng `<img id="mascot-image" src="..."`
   - Sửa thuộc tính `src` thành:
     ```html
     src="./assets/images/mascot.png"
     ```

### 📝 Ví dụ thay đổi trong index.html:
```html
<!-- TRƯỚC (Placeholder): -->
<img id="mascot-image" src="data:image/svg+xml,..." alt="Mascot" />

<!-- SAU (Ảnh thực): -->
<img id="mascot-image" src="./assets/images/mascot.png" alt="Mascot" />
```

### 🖌️ Yêu cầu về hình ảnh:
- ✅ Hình ảnh trong suốt (PNG) là tốt nhất
- ✅ Hình ảnh nhỏ gọn, dễ nhìn ở góc phải
- ✅ Có thể là ký tự, icon, hoặc illustration
- ✅ Hoạt động tốt ở kích thước 60x60 trở lên

### 💡 Gợi ý hình ảnh:
- 🤖 Robot/AI mascot
- 🐱 Con mèo/thú cưng
- 🧙 Wizard/nhân vật phù thủy
- 🎭 Mặt nạ/character vui vẻ
- 🕹️ Character game

### 🔗 Nguồn tài nguyên hình ảnh miễn phí:
- Flaticon.com - Icon miễn phí nhiều style
- OpenGameArt.org - Tài nguyên game art
- itch.io/game-assets - Asset game miễn phí
- Pixabay/Unsplash - Ảnh chất lượng cao

---

## ✅ Checklist hoàn tất:
- [ ] Tìm được hình ảnh mascot (`.png` hoặc `.gif`)
- [ ] Copy file vào thư mục này (`frontend/assets/images/`)
- [ ] Cập nhật `src` trong `index.html` (dòng với `<img id="mascot-image"...`)
- [ ] Mở trình duyệt, kiểm tra mascot hiển thị đúng

---

**💬 Lưu ý:** 
- Nếu hình ảnh không hiển thị, kiểm tra đường dẫn trong Browser DevTools (F12)
- Nên dùng PNG có nền trong suốt để mascot blend tốt hơn với giao diện
