import './canvas.js';
import './panels.js';
import './tools.js';
import './objects.js';
import './state.js';
import './toolbar.js';
import './events.js';

// Lưu canvas vào localStorage mỗi khi có thay đổi
window.canvas.on('object:added', saveCanvasToLocal);
window.canvas.on('object:modified', saveCanvasToLocal);
window.canvas.on('object:removed', saveCanvasToLocal);

function saveCanvasToLocal() {
    const json = window.canvas.toJSON(['customType', 'variable']);
    const name_design = document.querySelector('.name_design')?.value || '';
    localStorage.setItem('canvas_design', JSON.stringify(json));
    localStorage.setItem('canvas_design_name', name_design);
}

// Khởi tạo canvas từ localStorage nếu có, ngược lại lưu trạng thái trắng
const saved = localStorage.getItem('canvas_design');
const savedName = localStorage.getItem('canvas_design_name');
if (saved) {
    window.canvas.loadFromJSON(saved, function () {
        window.canvas.renderAll();
        if (typeof updateCanvasInfo === 'function') updateCanvasInfo();
        const nameInput = document.querySelector('.name_design');
        if (savedName && nameInput && !nameInput.value) {
            nameInput.value = savedName;
        }
        saveCanvasToLocal();
    });
} else {
    saveCanvasToLocal();
}

// Khi trang load xong, cập nhật kích thước canvas-box và thẻ canvas cho đúng
document.addEventListener('DOMContentLoaded', function () {
    // Lấy giá trị width, height, unit từ biến toàn cục hoặc localStorage
    let width = window.defaultCanvasWidth || localStorage.getItem('canvas_design_width') || 750;
    let height = window.defaultCanvasHeight || localStorage.getItem('canvas_design_height') || 350;
    let unit = window.defaultCanvasUnit || localStorage.getItem('canvas_design_unit') || 'px';

    width = Number(width);
    height = Number(height);

    // Chuyển width/height về px nếu cần
    let pxW = width, pxH = height;
    if (unit === 'mm') {
        pxW = width * 3.7795275591;
        pxH = height * 3.7795275591;
    } else if (unit === 'cm') {
        pxW = width * 37.795275591;
        pxH = height * 37.795275591;
    } else if (unit === 'inch') {
        pxW = width * 96;
        pxH = height * 96;
    }

    const box = document.getElementById('canvasBox');
    if (box) {
        box.style.width = pxW + 'px';
        box.style.height = pxH + 'px';
    }
    const canvasEl = document.getElementById('templateCanvas');
    if (canvasEl) {
        canvasEl.width = pxW;
        canvasEl.height = pxH;
    }
    if (window.canvas) {
        window.canvas.setWidth(pxW);
        window.canvas.setHeight(pxH);
        window.canvas.renderAll();
    }
});

document.addEventListener('keydown', function(e) {
    if ((e.key === 'Delete' || e.key === 'Backspace') &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (typeof deleteSelected === 'function') {
            deleteSelected();
        }
    }
});

document.getElementById('addStaticQRBtn')?.addEventListener('click', function() {
    addStaticQR();
});