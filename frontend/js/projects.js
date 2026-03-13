/* ==========================================================================
   FILE: js/projects.js
   CÔNG DỤNG: Xử lý logic màn hình Projects (ĐÃ NỐI SQL SERVER)
   ========================================================================== */
import { openModal, closeModal } from './app.js';
import { API } from './api.js';

let currentColumns = [];
let currentCards = {}; 

export async function initProjects() {
    setupProjectForms();
    await loadProjectData();
}

// 🌟 HÀM KÉO DATA TỪ SQL SERVER
async function loadProjectData() {
    currentColumns = await API.getProjectColumns() || [];
    currentCards = {};
    for (const col of currentColumns) {
        const cards = await API.getProjectCards(col.ColumnID) || [];
        currentCards[col.ColumnID] = cards;
    }
    renderProjectsBoard();
}

function setupProjectForms() {
    // === 1. FORM THÊM / SỬA CỘT DỰ ÁN ===
    const btnAddCol = document.querySelector('.projects-actions .btn-primary');
    const modalAddCol = document.getElementById('modal-add-project-col');
    const formAddCol = document.getElementById('form-add-project-col');

    if (btnAddCol && modalAddCol) {
        btnAddCol.addEventListener('click', () => {
            document.getElementById('edit-col-id').value = ''; 
            formAddCol.reset();
            openModal(modalAddCol);
        });
    }

    if (formAddCol) {
        formAddCol.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editColId = document.getElementById('edit-col-id').value;
            const title = document.getElementById('project-col-title').value;
            const color = document.getElementById('project-col-color').value;

            if (editColId) {
                // GỌI API SỬA CỘT
                await API.updateProjectColumn(editColId, { Title: title, ColorClass: color, OrderIndex: 0 });
            } else {
                // GỌI API THÊM CỘT
                await API.createProjectColumn({ Title: title, ColorClass: color, OrderIndex: currentColumns.length });
            }
            await loadProjectData();
            closeModal(modalAddCol);
        });
    }

    // === 2. FORM THÊM / SỬA THẺ DỰ ÁN ===
    const modalAddCard = document.getElementById('modal-add-project-card');
    const formAddCard = document.getElementById('form-add-project-card');

    if (formAddCard) {
        formAddCard.addEventListener('submit', async (e) => {
            e.preventDefault();
            const colId = document.getElementById('card-col-id').value;
            const editId = document.getElementById('edit-card-id').value; 
            const name = document.getElementById('project-card-name').value;
            const overrideColor = document.getElementById('project-card-color').value;
            const totalVal = document.getElementById('project-card-total').value;
            const total = parseInt(totalVal) || 10;

            if (editId) {
                // GỌI API SỬA THẺ
                await API.updateProjectCard(editId, {
                    Title: name,
                    TotalBoxes: total,
                    ColorClass: overrideColor !== "" ? overrideColor : null
                });
            } else {
                // GỌI API TẠO THẺ MỚI
                await API.createProjectCard({
                    ColumnID: parseInt(colId),
                    Title: name,
                    TotalBoxes: total,
                    DoneBoxes: 0,
                    ColorClass: overrideColor !== "" ? overrideColor : null
                });
            }
            await loadProjectData();
            closeModal(modalAddCard);
        });
    }
}

export function renderProjectsBoard() {
    const container = document.getElementById('projects-board-container');
    if (!container) return;

    if (currentColumns.length === 0) {
        container.innerHTML = `
            <div style="width: 100%; text-align: center; padding: 40px; color: var(--text-muted); font-style: italic;">
                <i class="fa-solid fa-layer-group" style="font-size: 40px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>Chưa có cột dự án nào. Hãy bấm "Thêm Cột Mới" góc trên bên phải để bắt đầu!</p>
            </div>`;
        return;
    }

    let html = '';
    currentColumns.forEach(col => {
        let cardsHtml = '';
        const cards = currentCards[col.ColumnID] || [];
        
        cards.forEach(card => {
            const cardColor = card.ColorClass || col.ColorClass;
            const percent = card.TotalBoxes > 0 ? Math.round((card.DoneBoxes / card.TotalBoxes) * 100) : 0;
            
            let boxesHtml = '';
            for (let i = 0; i < card.TotalBoxes; i++) {
                if (i < card.DoneBoxes) {
                    boxesHtml += `<div class="pj-box done-${cardColor}" data-col-id="${col.ColumnID}" data-card-id="${card.CardID}" data-index="${i}" style="cursor: pointer;"></div>`;
                } else {
                    boxesHtml += `<div class="pj-box empty-${cardColor}" data-col-id="${col.ColumnID}" data-card-id="${card.CardID}" data-index="${i}" style="cursor: pointer;"></div>`;
                }
            }

            cardsHtml += `
                <div class="pj-card">
                    <div class="pj-card-header pj-col-${cardColor}" style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${card.Title}</span>
                        <div class="pj-card-actions">
                            <i class="fa-solid fa-pen btn-edit-card" data-col-id="${col.ColumnID}" data-card-id="${card.CardID}" style="cursor: pointer; margin-right: 8px; font-size: 11px; opacity: 0.8;" title="Sửa thẻ"></i>
                            <i class="fa-solid fa-trash btn-delete-card" data-col-id="${col.ColumnID}" data-card-id="${card.CardID}" style="cursor: pointer; font-size: 11px; opacity: 0.8;" title="Xóa thẻ"></i>
                        </div>
                    </div>
                    <div class="pj-card-body">
                        <div class="pj-progress-boxes">${boxesHtml}</div>
                        <div class="pj-percent">${percent}%</div>
                    </div>
                </div>
            `;
        });

        html += `
            <div class="pj-column">
                <div class="pj-col-header pj-col-${col.ColorClass}" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${col.Title}</span>
                    <div>
                        <i class="fa-solid fa-pen btn-edit-col" data-col-id="${col.ColumnID}" style="cursor: pointer; margin-right: 12px; font-size: 13px; opacity: 0.8;" title="Sửa tên/màu cột"></i>
                        <i class="fa-solid fa-trash btn-delete-col" data-col-id="${col.ColumnID}" style="cursor: pointer; font-size: 13px; opacity: 0.8;" title="Xóa toàn bộ cột"></i>
                    </div>
                </div>
                <div class="pj-card-list">${cardsHtml}</div>
                <div class="pj-col-footer btn-add-card" data-col-id="${col.ColumnID}">
                    <i class="fa-solid fa-plus"></i> Thêm thẻ
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Gắn sự kiện cho các nút Edit/Delete
    attachCardAndColumnEvents(container);
}

function attachCardAndColumnEvents(container) {
    // Sửa cột
    container.querySelectorAll('.btn-edit-col').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const colId = e.currentTarget.dataset.colId;
            const col = currentColumns.find(c => c.ColumnID == colId);
            if (col) {
                document.getElementById('edit-col-id').value = col.ColumnID; 
                document.getElementById('project-col-title').value = col.Title;
                document.getElementById('project-col-color').value = col.ColorClass;
                openModal(document.getElementById('modal-add-project-col'));
            }
        });
    });

    // Xóa cột (Gọi API DELETE)
    container.querySelectorAll('.btn-delete-col').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm("CẢNH BÁO: Xóa cột này sẽ làm bốc hơi toàn bộ Thẻ dự án bên trong. Bạn chắc chắn chứ?")) {
                const colId = e.currentTarget.dataset.colId;
                await API.deleteProjectColumn(colId);
                await loadProjectData();
            }
        });
    });

    // Thêm thẻ
    container.querySelectorAll('.btn-add-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const colId = e.currentTarget.dataset.colId;
            document.getElementById('card-col-id').value = colId;
            document.getElementById('edit-card-id').value = ''; 
            const form = document.getElementById('form-add-project-card');
            if (form) form.reset();
            openModal(document.getElementById('modal-add-project-card'));
        });
    });

    // Sửa thẻ
    container.querySelectorAll('.btn-edit-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const colId = e.currentTarget.dataset.colId;
            const cardId = e.currentTarget.dataset.cardId;
            const cards = currentCards[colId] || [];
            const card = cards.find(c => c.CardID == cardId);
            if(card) {
                document.getElementById('card-col-id').value = colId;
                document.getElementById('edit-card-id').value = card.CardID; 
                document.getElementById('project-card-name').value = card.Title;
                document.getElementById('project-card-total').value = card.TotalBoxes;
                document.getElementById('project-card-color').value = card.ColorClass || "";
                openModal(document.getElementById('modal-add-project-card'));
            }
        });
    });

    // Xóa thẻ (Gọi API DELETE)
    container.querySelectorAll('.btn-delete-card').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if(confirm("Bạn có chắc chắn muốn xóa thẻ dự án này không?")) {
                const cardId = e.currentTarget.dataset.cardId;
                await API.deleteProjectCard(cardId);
                await loadProjectData(); 
            }
        });
    });

    // 🌟 MA THUẬT: CLICK Ô VUÔNG LƯU THẲNG XUỐNG DB
    container.querySelectorAll('.pj-box').forEach(box => {
        box.addEventListener('click', async (e) => {
            e.stopPropagation(); 
            const colId = e.target.dataset.colId;
            const cardId = e.target.dataset.cardId;
            const index = parseInt(e.target.dataset.index);

            const cards = currentCards[colId] || [];
            const card = cards.find(c => c.CardID == cardId);
            if (card) {
                // Tính toán số ô done mới
                let newDone = (card.DoneBoxes === index + 1) ? index : index + 1;
                
                // Cập nhật giao diện tạm thời cho mượt
                card.DoneBoxes = newDone;
                renderProjectsBoard(); 

                // Đẩy xuống Backend
                await API.updateProjectCard(cardId, { DoneBoxes: newDone });
            }
        });
    });
}