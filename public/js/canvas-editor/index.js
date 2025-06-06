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
    localStorage.setItem('canvas_design', JSON.stringify(json));
}
const saved = localStorage.getItem('canvas_design');
if (saved) {
    window.canvas.loadFromJSON(saved, function() {
        window.canvas.renderAll();
        if (typeof updateCanvasInfo === 'function') updateCanvasInfo();
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Any initialization code can go here
    console.log('Canvas editor initialized');
});