/* ==========================================================================
   FILE: pet.js
   KẾT NỐI: index.html (#view-pet), app.js
   MỤC ĐÍCH: Quản lý Dashboard Pet (Ảnh đại diện tĩnh, thống kê, items, settings)
   
   ✅ [FIX] ENTITY SEPARATION - QUAN TRỌNG:
   ================================================
   
   FILE NÀY CHỈ QUẢN LÝ AVATAR TĨNH (pet-avatar-image) TRONG DASHBOARD:
   - ✅ Hiển thị tĩnh (display only)
   - ✅ Tab switching, items grid
   - ✅ Pet stats updates (level, exp, gold, name)
   - ✅ Button handlers (confirm, settings)
   
   FILE NÀY KHÔNG CÓ:
   - ❌ Drag/drop logic (dragging chỉ cho mascot.js)
   - ❌ Click voice play logic (voice chỉ cho mascot.js)
   - ❌ Mouse event listeners trên avatar (để tránh event bubbling)
   
   AVATAR ID:
   - pet-avatar-image (CHỈ HIỂN THỊ, KHÔNG CÓ LOGIC)
   
   LINH VẬT CHÍNH ID:
   - mascot-image (ĐỦ HỌC LOGIC: drag, click, voice, animation)
   - Được quản lý bởi: mascot.js + voiceManager.js
   
   ========================================================================== */

/**
 * initPet()
 * Khởi tạo Pet Dashboard: Tab switching, item rendering, event listeners
 * 
 * ✅ CHỈNHH DÀNH CHO AVATAR TĨNH (DASHBOARD), KHÔNG PHẢI LINH VẬT CHÍNH
 */
export function initPet() {
  console.log('🐾 Initializing Pet Dashboard (Avatar - Static Display Only)...');

  // BƯỚC 1: Handle Tab Switching (tab buttons TRONG dashboard)
  initPetTabs();

  // BƯỚC 2: Render sample items (items trong tab)
  renderPetItems('costume');

  // BƯỚC 3: Handle Confirm Button (button TRONG dashboard)
  initPetConfirmBtn();

  console.log('🐾 Pet Dashboard ready! (Avatar tĩnh, không có drag/voice)');
}

/**
 * initPetTabs()
 * Xử lý sự kiện click trên các tab TRONG dashboard
 * 
 * ✅ CHỈ XỬ LÝ TABS, KHÔNG KÍCH HOẠT LINH VẬT CHÍNH
 */
function initPetTabs() {
  const tabBtns = document.querySelectorAll('.pet-tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const tabName = btn.getAttribute('data-tab');

      // Đổi active class
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Render items cho tab được chọn
      renderPetItems(tabName);

      console.log(`🐾 Tab switched to: ${tabName}`);
    });
  });
}

/**
 * renderPetItems(tabName)
 * Render items grid dựa trên tab được chọn
 * @param {string} tabName - Tên tab: 'costume', 'voice', 'evolution', 'settings'
 * 
 * ✅ CHỈ RENDER VÀ HIỂN THỊ, KHÔNG CÓ LOGIC KÉO HAY PHÁT ÂM THANH
 */
function renderPetItems(tabName) {
  const itemsGrid = document.getElementById('pet-items-grid');
  if (!itemsGrid) return;

  // Sample items data cho mỗi tab
  const itemsData = {
    costume: [
      { name: 'Trang phục đỏ', icon: '👗', desc: 'Áo khoác đỏ xinh xắn' },
      { name: 'Mũ đen', icon: '🎩', desc: 'Mũ cao cấp' },
      { name: 'Quần làn', icon: '👖', desc: 'Quần jeans xanh' },
      { name: 'Áo trắng', icon: '👔', desc: 'Áo ngực trắng' },
      { name: 'Váy công chúa', icon: '👑', desc: 'Váy dạ hội' },
      { name: 'Giày da', icon: '👞', desc: 'Giày lười đen' },
      { name: 'Khăn choàng', icon: '🧣', desc: 'Khăn ấm' },
      { name: 'Mắt kính', icon: '🕶️', desc: 'Kính mát' },
      { name: 'Vòng cổ', icon: '⌚', desc: 'Đồng hồ sang trọng' },
    ],
    voice: [
      { name: 'Giọng em bé', icon: '👶', desc: 'Tiếng kêu yêu' },
      { name: 'Giọng trưởng thành', icon: '🧑', desc: 'Tiếng nói lối loại' },
      { name: 'Giọng vui vẻ', icon: '😄', desc: 'Cười toe toét' },
      { name: 'Giọng buồn', icon: '😢', desc: 'Nấc lên' },
      { name: 'Giọng hung dữ', icon: '😠', desc: 'Gầu gừ' },
    ],
    evolution: [
      { name: 'Mini Goldie', icon: '🐤', desc: 'Dạng vàng nhỏ' },
      { name: 'Goldie bình thường', icon: '🐥', desc: 'Dạng hiện tại' },
      { name: 'Mega Goldie', icon: '🦅', desc: 'Dạng khủng long' },
      { name: 'Golden Goldie', icon: '✨', desc: 'Dạng vàng sáng' },
    ],
    settings: [
      { name: 'Âm thanh ON', icon: '🔊', desc: 'Bật âm thanh' },
      { name: 'Rung ON', icon: '📳', desc: 'Bật rung' },
      { name: 'Thông báo ON', icon: '🔔', desc: 'Bật thông báo' },
      { name: 'Full Screen', icon: '⛶', desc: 'Full màn hình' },
      { name: 'Light Mode', icon: '☀️', desc: 'Chủ đề sáng' },
    ],
  };

  // Lấy items cho tab hiện tại
  const items = itemsData[tabName] || [];

  // Clear grid hiện tại
  itemsGrid.innerHTML = '';

  // Render items
  items.forEach(item => {
    const itemCard = document.createElement('div');
    itemCard.className = 'pet-item-card';
    itemCard.innerHTML = `
            <div class="pet-item-icon">${item.icon}</div>
            <h4 class="pet-item-name">${item.name}</h4>
            <p class="pet-item-desc">${item.desc}</p>
        `;

    // Thêm hover effect (optional animation)
    itemCard.addEventListener('mouseenter', () => {
      itemCard.style.animationName = 'none';
      setTimeout(() => {
        itemCard.style.animationName = 'pet-item-bounce';
      }, 10);
    });

    itemsGrid.appendChild(itemCard);
  });
}

/**
 * initPetConfirmBtn()
 * Xử lý sự kiện click nút "Xác nhận" (button TRONG dashboard)
 * 
 * ✅ CHỈ XỬ LÝ BUTTON TRONG DASHBOARD, KHÔNG ẢNH HƯởNG LINH VẬT CHÍNH
 */
function initPetConfirmBtn() {
  const confirmBtn = document.getElementById('btn-pet-confirm');

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      // Placeholder: có thể thêm logic xác nhận ở đây
      console.log('🐾 Pet Dashboard Confirmed! (Không ảnh hưởng Linh vật chính)');

      // Tạo một hiệu ứng feedback cho người dùng
      confirmBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        confirmBtn.style.transform = 'scale(1)';
      }, 150);

      // Nếu có toast/notification, có thể hiển thị ở đây
      // showToast('🐾 Thú cưng đã được xác nhận!');
    });
  }
}

/**
 * updatePetGold(amount)
 * Cập nhật số lượng vàng của thú cưng
 * @param {number} amount - Số vàng mới
 */
export function updatePetGold(amount) {
  const goldElement = document.getElementById('pet-gold');
  if (goldElement) {
    goldElement.textContent = amount.toLocaleString();
    // Optional: animation flash
    goldElement.style.animation = 'none';
    setTimeout(() => {
      goldElement.style.animation = 'pet-gold-flash 0.6s ease';
    }, 10);
  }
}

/**
 * updatePetExp(exp, maxExp)
 * Cập nhật kinh nghiệm của thú cưng
 * @param {number} exp - Kinh nghiệm hiện tại
 * @param {number} maxExp - Kinh nghiệm tối đa cho level này
 */
export function updatePetExp(exp, maxExp) {
  const percentage = Math.min((exp / maxExp) * 100, 100);
  const expFill = document.getElementById('pet-exp-fill');
  const expText = document.getElementById('pet-exp-text');

  if (expFill) {
    expFill.style.width = percentage + '%';
  }

  if (expText) {
    expText.textContent = Math.round(percentage) + '% to Next Level';
  }
}

/**
 * updatePetLevel(level)
 * Cập nhật level của thú cưng
 * @param {number} level - Level mới
 */
export function updatePetLevel(level) {
  const levelElement = document.getElementById('pet-level');
  if (levelElement) {
    levelElement.textContent = level;
  }
}

/**
 * updatePetName(name)
 * Cập nhật tên thú cưng
 * @param {string} name - Tên mới
 */
export function updatePetName(name) {
  const nameElement = document.getElementById('pet-name');
  if (nameElement) {
    nameElement.textContent = name;
  }
}
