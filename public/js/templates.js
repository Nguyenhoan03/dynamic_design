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

function openPrintModal() {
    var modal = new bootstrap.Modal(document.getElementById('printModal'));
    modal.show();
}
function selectTool(tool) {
    // Xử lý chọn công cụ, ví dụ: vẽ, chọn, text...
    // Đổi trạng thái active cho nút
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    // Nếu là submenu thì không có onclick
    const btn = document.querySelector(`.tool-btn[onclick*="${tool}"]`);
    if (btn) btn.classList.add('active');
    // Tùy tool mà bật/tắt chế độ fabric
    if (tool === 'draw') {
        canvas.isDrawingMode = true;
    } else {
        canvas.isDrawingMode = false;
    }
}
function addLine() {
    const line = new fabric.Line([50, 100, 200, 100], {
        left: 170,
        top: 100,
        stroke: '#222',
        strokeWidth: 3
    });
    canvas.add(line).setActiveObject(line);
}



// Khởi tạo canvas
const canvas = new fabric.Canvas('templateCanvas', {
    backgroundColor: '#fff',
    preserveObjectStacking: true
});

// Undo/Redo stack
let state = [],
    mods = 0,
    undoing = false,
    redoing = false;

function saveState() {
    if (!undoing && !redoing) {
        state.push(JSON.stringify(canvas));
        mods = 0;
    }
}
canvas.on('object:added', saveState);
canvas.on('object:modified', saveState);
canvas.on('object:removed', saveState);

function undo() {
    if (state.length > 1) {
        undoing = true;
        state.pop();
        canvas.loadFromJSON(state[state.length - 1], () => {
            canvas.renderAll();
            undoing = false;
        });
    }
}



function redo() {
    alert('Chức năng redo cần bổ sung stack riêng!');
}


// Thêm QR code mẫu (chỉ là placeholder)
function addQRCode() {
    const rect = new fabric.Rect({
        width: 70,
        height: 70,
        fill: '#eee',
        stroke: '#333',
        strokeWidth: 1
    });
    const label = new fabric.Text('QR: #{code}', {
        fontSize: 12,
        left: 10,
        top: 25,
        fill: '#333'
    });
    const group = new fabric.Group([rect, label], {
        left: 300,
        top: 120
    });
    canvas.add(group).setActiveObject(group);
}

function addText() {
    const text = new fabric.Textbox('Nhập nội dung', {
        left: 120,
        top: 60,
        fontSize: 22,
        fill: '#222',
        width: 200,
        fontFamily: 'Arial'
    });
    canvas.add(text).setActiveObject(text);
}

// Upload ảnh từ máy
document.getElementById('uploadImg').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (f) {
        fabric.Image.fromURL(f.target.result, function (img) {
            img.set({
                left: 50,
                top: 50,
                scaleX: 0.5,
                scaleY: 0.5
            });
            canvas.add(img).setActiveObject(img);
        });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
});

// Xóa đối tượng đang chọn
function deleteSelected() {
    const active = canvas.getActiveObject();
    if (active) canvas.remove(active);
}

// Lật đối tượng đang chọn
function flipSelected() {
    const active = canvas.getActiveObject();
    if (active && active.type === 'image') {
        active.toggle('flipX');
        canvas.requestRenderAll();
    }
}

// Đổi màu đối tượng text
function changeColor() {
    let colorInput = document.getElementById('colorPicker');
    if (!colorInput) {
        colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.id = 'colorPicker';
        colorInput.style.position = 'fixed';
        colorInput.style.left = '50%';
        colorInput.style.top = '50%';
        colorInput.style.transform = 'translate(-50%, -50%)';
        colorInput.style.zIndex = 9999;
        colorInput.style.display = 'block';
        colorInput.addEventListener('input', function () {
            const active = canvas.getActiveObject();
            if (active && active.type === 'textbox') {
                active.set('fill', this.value);
                canvas.requestRenderAll();
            }
            colorInput.style.display = 'none';
        });
        document.body.appendChild(colorInput);
    }
    colorInput.style.display = 'block';
    colorInput.focus();
    colorInput.click();
}

// Tải xuống thiết kế
function downloadCanvas() {
    const dataURL = canvas.toDataURL({
        format: 'png'
    });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'thietke.png';
    link.click();
}

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

// Đổi kích thước canvas
function changeCanvasSize() {
    let w = prompt('Nhập chiều rộng (px):', canvas.width);
    let h = prompt('Nhập chiều cao (px):', canvas.height);
    if (w && h) {
        canvas.setWidth(Number(w));
        canvas.setHeight(Number(h));
        document.querySelector('.canvas-box').style.width = w + 'px';
        document.querySelector('.canvas-box').style.height = h + 'px';
    }
}

// Thêm hình chữ nhật
function addRect() {
    const rect = new fabric.Rect({
        left: 150,
        top: 100,
        fill: '#00bcd4',
        width: 100,
        height: 60
    });
    canvas.add(rect).setActiveObject(rect);
}

// Thêm hình tròn
function addCircle() {
    const circle = new fabric.Circle({
        left: 250,
        top: 120,
        fill: '#673ab7',
        radius: 40
    });
    canvas.add(circle).setActiveObject(circle);
}

// Copy/Paste đối tượng
let clipboard = null;
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'c') {
        const active = canvas.getActiveObject();
        if (active) active.clone(function (cloned) {
            clipboard = cloned;
        });
    }
    if (e.ctrlKey && e.key === 'v' && clipboard) {
        clipboard.clone(function (clonedObj) {
            canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + 20,
                top: clonedObj.top + 20,
                evented: true
            });
            if (clonedObj.type === 'activeSelection') {
                clonedObj.canvas = canvas;
                clonedObj.forEachObject(function (obj) {
                    canvas.add(obj);
                });
                clonedObj.setCoords();
            } else {
                canvas.add(clonedObj);
            }
            canvas.setActiveObject(clonedObj);
            canvas.requestRenderAll();
        });
    }
    // Undo
    if (e.ctrlKey && e.key === 'z') undo();
});

// Group/Ungroup
function groupSelected() {
    if (!canvas.getActiveObject()) return;
    if (canvas.getActiveObject().type !== 'activeSelection') return;
    canvas.getActiveObject().toGroup();
    canvas.requestRenderAll();
}

function ungroupSelected() {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'group') {
        obj.toActiveSelection();
        canvas.requestRenderAll();
    }
}

// Khóa/Mở khóa đối tượng
function lockSelected() {
    const obj = canvas.getActiveObject();
    if (obj) {
        obj.set({
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true
        });
        canvas.discardActiveObject();
        canvas.requestRenderAll();
    }
}

function unlockAll() {
    canvas.getObjects().forEach(obj => {
        obj.set({
            selectable: true,
            evented: true,
            lockMovementX: false,
            lockMovementY: false
        });
    });
    canvas.requestRenderAll();
}

// Đổi font, cỡ, căn lề cho text
function setFont(font) {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
        obj.set('fontFamily', font);
        canvas.requestRenderAll();
    }
}

function setFontSize(size) {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
        obj.set('fontSize', size);
        canvas.requestRenderAll();
    }
}

function setAlign(align) {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
        obj.set('textAlign', align);
        canvas.requestRenderAll();
    }
}

// Đổi thứ tự lớp
function bringToFront() {
    const obj = canvas.getActiveObject();
    if (obj) {
        canvas.bringToFront(obj);
    }
}

function sendToBack() {
    const obj = canvas.getActiveObject();
    if (obj) {
        canvas.sendToBack(obj);
    }
}

// Xóa tất cả
function clearCanvas() {
    canvas.clear();
    canvas.setBackgroundColor('#fff', canvas.renderAll.bind(canvas));
}

// Zoom canvas
function zoomIn() {
    canvas.setZoom(canvas.getZoom() * 1.1);
}

function zoomOut() {
    canvas.setZoom(canvas.getZoom() / 1.1);
}


//Chèn trường động vào canvas
function addDynamicText(content) {
    const text = new fabric.Textbox(content, {
        left: 120, top: 60, fontSize: 22, fill: '#222', width: 200, fontFamily: 'Arial',
        customType: 'dynamic', // Đánh dấu là trường động
        variable: content
    });
    canvas.add(text).setActiveObject(text);
}

function addDynamicQR() {
    const rect = new fabric.Rect({
        width: 70, height: 70, fill: '#eee', stroke: '#333', strokeWidth: 1
    });
    const label = new fabric.Text('QR: #{code}', {
        fontSize: 12, left: 10, top: 25, fill: '#333'
    });
    const group = new fabric.Group([rect, label], { left: 300, top: 120, customType: 'dynamicQR', variable: '#{code}' });
    canvas.add(group).setActiveObject(group);
}

