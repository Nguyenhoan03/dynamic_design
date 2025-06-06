document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'c') {
        const active = window.canvas.getActiveObject();
        if (active) active.clone(function (cloned) {
            window.clipboard = cloned;
        });
    }
    if (e.ctrlKey && e.key === 'v' && window.clipboard) {
        window.clipboard.clone(function (clonedObj) {
            window.canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + 20,
                top: clonedObj.top + 20,
                evented: true
            });
            if (clonedObj.type === 'activeSelection') {
                clonedObj.canvas = window.canvas;
                clonedObj.forEachObject(function (obj) {
                    window.canvas.add(obj);
                });
                clonedObj.setCoords();
            } else {
                window.canvas.add(clonedObj);
            }
            window.canvas.setActiveObject(clonedObj);
            window.canvas.requestRenderAll();
        });
    }
    if (e.ctrlKey && e.key === 'z') window.undo();
});

function updateCanvasInfo() {
    const zoom = (window.canvas.getZoom() * 100).toFixed(0) + '%';
    const width = window.canvas.getWidth();
    const height = window.canvas.getHeight();
    document.getElementById('canvasInfo').innerText = `Zoom: ${zoom} | Kích thước: ${width} x ${height}px`;
}
window.updateCanvasInfo = updateCanvasInfo;
// Gọi khi zoom hoặc đổi kích thước
window.canvas.on('zoom:changed', updateCanvasInfo);
window.canvas.on('resize', updateCanvasInfo);

// Gọi sau khi setZoom hoặc đổi size
document.querySelector('.canvas-box').addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
        e.preventDefault();
        const pointer = window.canvas.getPointer(e);
        let zoom = window.canvas.getZoom();
        const minZoom = 0.2, maxZoom = 3;
        if (e.deltaY < 0) zoom = Math.min(zoom * 1.1, maxZoom);
        else zoom = Math.max(zoom / 1.1, minZoom);
        // Zoom tại vị trí chuột
        window.canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom);
        if (typeof updateCanvasInfo === 'function') updateCanvasInfo();
    }
}, { passive: false });

// Gọi khi khởi tạo
updateCanvasInfo();


// Toolbar nổi khi chọn đối tượng
const objectToolbar = document.getElementById('objectToolbar');
canvas.on('selection:created', showToolbar);
canvas.on('selection:updated', showToolbar);
canvas.on('selection:cleared', () => objectToolbar.style.display = 'none');
function showToolbar(e) {
    const obj = canvas.getActiveObject();
    if (!obj) return;
    const bound = obj.getBoundingRect();
    objectToolbar.style.display = 'flex';
    objectToolbar.style.left = (bound.left + bound.width / 2 - 40) + 'px';
    objectToolbar.style.top = (bound.top - 30) + 'px';
}
canvas.on('object:moving', showToolbar);
canvas.on('object:scaling', showToolbar);
function flipSelected() {
    const active = canvas.getActiveObject();
    if (active && active.type === 'image') {
        active.toggle('flipX');
        canvas.requestRenderAll();
    }
}

window.flipSelected = flipSelected;