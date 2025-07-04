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
    if (e.ctrlKey && e.key === 'y') window.redo();
});

function updateCanvasInfo() {
    const zoom = (window.canvas.getZoom() * 100).toFixed(0) + '%';

    // Nếu có window.originWidth/Height/Unit (tức là vào edit), ưu tiên dùng giá trị gốc từ DB
    if (window.originWidth && window.originHeight && window.originUnit) {
        document.getElementById('canvasInfo').innerText =
            `Zoom: ${zoom} | Kích thước: ${window.originWidth} x ${window.originHeight} ${window.originUnit}`;
        return;
    }

    // Nếu không phải edit, lấy theo px và convert như cũ
    const pxWidth = window.canvas.getWidth();
    const pxHeight = window.canvas.getHeight();
    const unit = localStorage.getItem('canvas_design_unit') || window.defaultCanvasUnit || 'px';

    function formatNumber(val) {
        return Number.isInteger(val) ? val : parseFloat(val.toFixed(2)).toString();
    }

    let width = pxWidth, height = pxHeight;
    if (unit === 'mm') {
        width = formatNumber(pxWidth / 3.7795275591);
        height = formatNumber(pxHeight / 3.7795275591);
    } else if (unit === 'cm') {
        width = formatNumber(pxWidth / 37.795275591);
        height = formatNumber(pxHeight / 37.795275591);
    } else if (unit === 'inch') {
        width = formatNumber(pxWidth / 96);
        height = formatNumber(pxHeight / 96);
    } else {
        width = formatNumber(pxWidth);
        height = formatNumber(pxHeight);
    }


    document.getElementById('canvasInfo').innerText =
        `Zoom: ${zoom} | Kích thước: ${width} x ${height} ${unit}`;
}

window.updateCanvasInfo = updateCanvasInfo;
// Gọi khi zoom hoặc đổi kích thước
window.canvas.on('zoom:changed', updateCanvasInfo);
window.canvas.on('resize', updateCanvasInfo);

// Gọi sau khi setZoom hoặc đổi size
document.querySelector('.canvas-box').addEventListener('wheel', function (e) {
    e.preventDefault();
    const pointer = window.canvas.getPointer(e);
    let zoom = window.canvas.getZoom();
    const minZoom = 0.2, maxZoom = 3;
    if (e.deltaY < 0) zoom = Math.min(zoom * 1.1, maxZoom);
    else zoom = Math.max(zoom / 1.1, minZoom);
    // Zoom tại vị trí chuột
    window.canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom);
    if (typeof updateCanvasInfo === 'function')
        window.canvas.requestRenderAll(); updateCanvasInfo();
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
    objectToolbar.style.left = (bound.left + bound.width / 2 - 50) + 'px';
    objectToolbar.style.top = (bound.top - 50) + 'px';
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

let isPanning = false;
let lastPosX = 0, lastPosY = 0;

document.querySelector('.canvas-box').addEventListener('mousedown', function (e) {
    // Chỉ pan khi không chọn object nào
    if (!window.canvas.getActiveObject()) {
        isPanning = true;
        lastPosX = e.clientX;
        lastPosY = e.clientY;
        window.canvas.setCursor('grab');
    }
});
document.addEventListener('mousemove', function (e) {
    if (isPanning) {
        const vpt = window.canvas.viewportTransform;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        window.canvas.requestRenderAll();
        lastPosX = e.clientX;
        lastPosY = e.clientY;
    }
});
document.addEventListener('mouseup', function () {
    if (isPanning) {
        isPanning = false;
        window.canvas.setCursor('default');
    }
});