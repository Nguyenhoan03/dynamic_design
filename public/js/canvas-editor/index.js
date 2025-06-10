import './canvas.js';
import './panels.js';
import './tools.js';
import './objects.js';
import './state.js';
import './toolbar.js';
import './events.js';

window.canvas.on('object:added', saveCanvasToLocal);
window.canvas.on('object:modified', saveCanvasToLocal);
window.canvas.on('object:removed', saveCanvasToLocal);

function saveCanvasToLocal() {
    const json = window.canvas.toJSON(['customType', 'variable']);
    const name_design = window.document.querySelector('.name_design').value;
    localStorage.setItem('canvas_design', JSON.stringify(json));
    localStorage.setItem('canvas_design_name', name_design);
}
const saved = localStorage.getItem('canvas_design');
const savedName = localStorage.getItem('canvas_design_name');
if (saved) {
    window.canvas.loadFromJSON(saved, function() {
        window.canvas.renderAll();
        if (typeof updateCanvasInfo === 'function') updateCanvasInfo();
        if (savedName && document.querySelector('.name_design')) {
            document.querySelector('.name_design').value = savedName;
        }
        saveCanvasToLocal();
    });
} else {
    saveCanvasToLocal();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    const w = localStorage.getItem('canvas_design_width') || 750;
    const h = localStorage.getItem('canvas_design_height') || 350;
    window.canvas.setWidth(w);
    window.canvas.setHeight(h);
});