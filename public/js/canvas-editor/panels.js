function showPanel(panel) {
    document.querySelectorAll('.sidebar-canvas .sidebar-item').forEach((el) => {
        el.classList.remove('active');
    });
    document.querySelector('.sidebar-canvas .sidebar-item[onclick="showPanel(\'' + panel + '\')"]').classList.add('active');
    document.querySelectorAll('.sidebar-panel').forEach(el => el.classList.remove('active'));
    const panelEl = document.getElementById('panel-' + panel);
    if(panelEl) panelEl.classList.add('active');
}

function closePanel(panel) {
    document.getElementById('panel-' + panel).style.display = 'none';
}

let isPanning = false;
let lastPosX = 0, lastPosY = 0;

window.canvas.on('mouse:down', function(opt) {
    if (opt.e && opt.e.button === 0 && window.isCtrlPressed) {
        isPanning = true;
        window.canvas.selection = false;
        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
    }
});
window.canvas.on('mouse:move', function(opt) {
    if (isPanning && opt.e) {
        const e = opt.e;
        const vpt = window.canvas.viewportTransform;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        window.canvas.requestRenderAll();
        lastPosX = e.clientX;
        lastPosY = e.clientY;
    }
});
window.canvas.on('mouse:up', function(opt) {
    isPanning = false;
    window.canvas.selection = true;
});

window.isCtrlPressed = false;
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) window.isCtrlPressed = true;
});
document.addEventListener('keyup', function(e) {
    if (!e.ctrlKey) window.isCtrlPressed = false;
});


window.showPanel = showPanel;
window.closePanel = closePanel;