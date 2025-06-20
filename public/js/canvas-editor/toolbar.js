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
//Tự động đặt vị trí menu (lên trên hoặc xuống dưới)
function showToolbarMenu(x, y) {
    const menu = document.getElementById('toolbarMenu');
    menu.style.display = 'block';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    setTimeout(() => {
        const rect = menu.getBoundingClientRect();
        const winH = window.innerHeight;
        // Nếu menu bị tràn dưới, hiển thị lên trên
        if (rect.bottom > winH) {
            menu.style.top = (y - rect.height) + 'px';
        }
        // Nếu menu bị tràn trên, hiển thị xuống dưới
        if (rect.top < 0) {
            menu.style.top = '10px';
        }
    }, 10);
}

// Đóng menu khi click ra ngoài
document.addEventListener('mousedown', function(e) {
    const menu = document.getElementById('toolbarMenu');
    if (menu && !menu.contains(e.target)) {
        menu.style.display = 'none';
    }
});

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

function updateEditMainBtn() {
    const btn = document.getElementById('editMainBtn');
    const icon = document.getElementById('editMainIcon');
    const active = window.canvas.getActiveObject();
    if (!active) {
        btn.style.display = 'none';
        return;
    }
    btn.style.display = '';
    if (active.type === 'textbox' || active.type === 'text') {
        icon.className = 'bi bi-pencil-square';
        btn.title = 'Sửa text';
    } else if (active.customType === 'staticQR') {
        icon.className = 'bi bi-qr-code';
        btn.title = 'Sửa QR';
    } else if (active.type === 'image' && !active.customType) {
        icon.className = 'bi bi-image';
        btn.title = 'Đổi ảnh';
    } else {
        icon.className = 'bi bi-pencil-square';
        btn.title = 'Sửa';
    }
}

// Gọi hàm này mỗi khi chọn object
window.canvas.on('selection:created', updateEditMainBtn);
window.canvas.on('selection:updated', updateEditMainBtn);
window.canvas.on('selection:cleared', updateEditMainBtn);

// Hàm xử lý khi bấm nút
function editMain() {
    const active = window.canvas.getActiveObject();
    if (!active) return;
    if (active.type === 'textbox' || active.type === 'text') {
        editText();
    } else if (active.customType === 'staticQR') {
        changeQR();
    } else if (active.type === 'image' && !active.customType) {
        changeImage();
    }
}


window.editMain = editMain;
window.showToolbar = showToolbar;
window.groupSelected = groupSelected;
window.ungroupSelected = ungroupSelected;
window.lockSelected = lockSelected;
window.unlockAll = unlockAll;
window.toggleToolbarMenu = toggleToolbarMenu;