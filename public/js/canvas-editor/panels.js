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
window.showPanel = showPanel;
window.closePanel = closePanel;