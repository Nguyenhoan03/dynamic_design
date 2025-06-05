function showToolbar(e) {
    const obj = window.canvas.getActiveObject();
    if (!obj) return;
    const bound = obj.getBoundingRect();
    const zoom = window.canvas.getZoom();
    // Lấy vị trí canvas trên trang
    const canvasRect = window.canvas.getElement().getBoundingClientRect();
    window.objectToolbar.style.display = 'flex';
    window.objectToolbar.style.left = (canvasRect.left + (bound.left + bound.width / 2) * zoom - 40) + 'px';
    window.objectToolbar.style.top = (canvasRect.top + (bound.top - 30) * zoom) + 'px';
}

function groupSelected() {
    if (!window.canvas.getActiveObject()) return;
    if (window.canvas.getActiveObject().type !== 'activeSelection') return;
    window.canvas.getActiveObject().toGroup();
    window.canvas.requestRenderAll();
}

function ungroupSelected() {
    const obj = window.canvas.getActiveObject();
    if (obj && obj.type === 'group') {
        obj.toActiveSelection();
        window.canvas.requestRenderAll();
    }
}

function lockSelected() {
    const obj = window.canvas.getActiveObject();
    if (obj) {
        obj.set({
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true
        });
        window.canvas.discardActiveObject();
        window.canvas.requestRenderAll();
    }
}

function unlockAll() {
    window.canvas.getObjects().forEach(obj => {
        obj.set({
            selectable: true,
            evented: true,
            lockMovementX: false,
            lockMovementY: false
        });
    });
    window.canvas.requestRenderAll();
}


window.showToolbar = showToolbar;
window.groupSelected = groupSelected;
window.ungroupSelected = ungroupSelected;
window.lockSelected = lockSelected;
window.unlockAll = unlockAll;