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

function toggleToolbarMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('toolbarMenu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';

    // Ẩn/hiện các mục nâng cao theo loại object
    const active = window.canvas.getActiveObject();
    document.getElementById('changeColorMenu').style.display = (active && (
        active.type === 'rect' || active.type === 'circle' || active.type === 'line' ||
        active.type === 'textbox' || active.type === 'text'
    )) ? 'flex' : 'none';
    document.getElementById('changeImageMenu').style.display = (active && active.type === 'image' && !active.customType) ? 'flex' : 'none';
    document.getElementById('editQRMenu').style.display = (active && active.customType === 'staticQR') ? 'flex' : 'none';
}

// Ẩn menu khi click ra ngoài
document.addEventListener('mousedown', function(e) {
    const menu = document.getElementById('toolbarMenu');
    if (menu && !menu.contains(e.target)) menu.style.display = 'none';
});

window.showToolbar = showToolbar;
window.groupSelected = groupSelected;
window.ungroupSelected = ungroupSelected;
window.lockSelected = lockSelected;
window.unlockAll = unlockAll;
window.toggleToolbarMenu = toggleToolbarMenu;