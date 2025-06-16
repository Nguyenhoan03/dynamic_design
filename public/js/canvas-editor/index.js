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
    const width =  window.defaultCanvasWidth || localStorage.getItem('canvas_design_width') ;
    const height = window.defaultCanvasHeight || localStorage.getItem('canvas_design_height') ;

    console.log(width, height);
    const box = document.getElementById('canvasBox');
    if (box) {
        box.style.width = width + 'px';
        box.style.height = height + 'px';
    }
    const canvasEl = document.getElementById('templateCanvas');
    if (canvasEl) {
        canvasEl.width = width;
        canvasEl.height = height;
    }
    // Đảm bảo fabric canvas cũng cập nhật kích thước
    if (window.canvas) {
        window.canvas.setWidth(Number(width));
        window.canvas.setHeight(Number(height));
        window.canvas.renderAll();
    }
});