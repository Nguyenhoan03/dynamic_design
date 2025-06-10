function showPanel(panel) {
    document.querySelectorAll('.sidebar-canvas .sidebar-item').forEach((el) => {
        el.classList.remove('active');
    });
    document.querySelector('.sidebar-canvas .sidebar-item[onclick="showPanel(\'' + panel + '\')"]').classList.add('active');
    document.querySelectorAll('.sidebar-panel').forEach(el => el.classList.remove('active'));
    const panelEl = document.getElementById('panel-' + panel);
    if (panelEl) panelEl.classList.add('active');
}

function closePanel(panel) {
    document.getElementById('panel-' + panel).style.display = 'none';
}

let isDragging = false;
let lastPosX = 0, lastPosY = 0;

window.canvas.on('mouse:down', function (opt) {
    // Chỉ pan khi không chọn object nào
    if (!window.canvas.getActiveObject() && opt.e && opt.e.button === 0) {
        isDragging = true;
        window.canvas.selection = false;
        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
        window.canvas.defaultCursor = 'grabbing';
    }
});
window.canvas.on('mouse:move', function (opt) {
    if (isDragging && opt.e) {
        const dx = opt.e.clientX - lastPosX;
        const dy = opt.e.clientY - lastPosY;
        window.canvas.getObjects().forEach(obj => {
            obj.left += dx;
            obj.top += dy;
            obj.setCoords();
        });
        window.canvas.requestRenderAll();
        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
    }
});
window.canvas.on('mouse:up', function (opt) {
    isDragging = false;
    window.canvas.selection = true;
    window.canvas.defaultCursor = 'default';
});

window.isCtrlPressed = false;
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey) window.isCtrlPressed = true;
});
document.addEventListener('keyup', function (e) {
    if (!e.ctrlKey) window.isCtrlPressed = false;
});


window.showPanel = showPanel;
window.closePanel = closePanel;