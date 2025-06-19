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
    const json = window.canvas.toJSON(['customType', 'variable','qrValue']);
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
    // Helper: Chuyển đơn vị sang px
    function convertToPx(value, unit) {
        const factors = {
            mm: 3.7795275591,
            cm: 37.795275591,
            inch: 96,
            px: 1
        };
        return value * (factors[unit] || 1);
    }

    // Lấy width, height, unit từ localStorage hoặc window
    const width = Number(localStorage.getItem('canvas_design_width')) || window.defaultCanvasWidth || 750;
    const height = Number(localStorage.getItem('canvas_design_height')) || window.defaultCanvasHeight || 350;
    const unit = localStorage.getItem('canvas_design_unit') || window.defaultCanvasUnit || 'px';

    const pxW = convertToPx(width, unit);
    const pxH = convertToPx(height, unit);
    

    // Cập nhật canvas box
    const box = document.getElementById('canvasBox');
    if (box) {
        box.style.width = pxW + 'px';
        box.style.height = pxH + 'px';
    }

    // Cập nhật thẻ canvas
    const canvasEl = document.getElementById('templateCanvas');
    if (canvasEl) {
        canvasEl.width = pxW;
        canvasEl.height = pxH;
    }

    // Cập nhật fabric canvas
    if (window.canvas) {
        window.canvas.setWidth(pxW);
        window.canvas.setHeight(pxH);
        window.canvas.renderAll();
    }
});

document.addEventListener('keydown', function (e) {
    if ((e.key === 'Delete' || e.key === 'Backspace') &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (typeof deleteSelected === 'function') {
            deleteSelected();
        }
    }
});

document.getElementById('addStaticQRBtn')?.addEventListener('click', function () {
    addStaticQR();
});

window.canvas.on('object:added', () => window.canvas.requestRenderAll());
window.canvas.on('object:removed', () => window.canvas.requestRenderAll());
window.canvas.on('object:modified', () => window.canvas.requestRenderAll());