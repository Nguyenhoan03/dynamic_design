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
    const btn = e.currentTarget;
    const wrapper = btn.closest('.toolbar-menu-wrapper');
    const menu = wrapper.querySelector('.toolbar-menu');
    // Ẩn tất cả menu khác
    document.querySelectorAll('.toolbar-menu').forEach(m => {
        if (m !== menu) m.style.display = 'none';
    });

    // Toggle menu
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        menu.classList.remove('show-above', 'show-left');
    } else {
        menu.style.display = 'block';
        menu.classList.remove('show-above', 'show-left');

        // Tính toán vị trí menu chính
        setTimeout(() => {
            const rect = menu.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();
            const winWidth = window.innerWidth;
            const winHeight = window.innerHeight;

            // Nếu menu bị tràn phải, hiển thị sang trái
            if (rect.right > winWidth && btnRect.left > menu.offsetWidth) {
                menu.classList.add('show-left');
                menu.style.left = 'auto';
                menu.style.right = '0';
            } else {
                menu.classList.remove('show-left');
                menu.style.left = '';
                menu.style.right = '';
            }
            // Nếu menu bị tràn trái
            if (rect.left < 0) {
                menu.style.left = '0';
                menu.style.right = 'auto';
            }
            // Nếu menu bị tràn dưới, hiển thị lên trên
            if (rect.bottom > winHeight && btnRect.top > menu.offsetHeight) {
                menu.classList.add('show-above');
                menu.style.top = 'auto';
                menu.style.bottom = '100%';
            } else {
                menu.classList.remove('show-above');
                menu.style.top = '';
                menu.style.bottom = '';
            }
        }, 10);

        // Xử lý submenu khi hover
        menu.querySelectorAll('.submenu').forEach(sub => {
            sub.classList.remove('show-left', 'show-above');
            sub.parentElement.onmouseenter = function() {
                sub.style.display = 'block';
                const subRect = sub.getBoundingClientRect();
                const winWidth = window.innerWidth;
                const winHeight = window.innerHeight;
                // Nếu submenu tràn phải, hiển thị sang trái
                if (subRect.right > winWidth && subRect.left > sub.offsetWidth) {
                    sub.classList.add('show-left');
                } else {
                    sub.classList.remove('show-left');
                }
                // Nếu submenu tràn dưới, hiển thị lên trên
                if (subRect.bottom > winHeight && subRect.top > sub.offsetHeight) {
                    sub.classList.add('show-above');
                } else {
                    sub.classList.remove('show-above');
                }
                sub.style.display = '';
            };
        });
    }
}

// Đóng menu khi click ra ngoài
document.addEventListener('click', function() {
    document.querySelectorAll('.toolbar-menu').forEach(m => m.style.display = 'none');
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