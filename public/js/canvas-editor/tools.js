function bringToFront() {
    const obj = window.canvas.getActiveObject();
    if (obj) window.canvas.bringToFront(obj);
}
function sendToBack() {
    const obj = window.canvas.getActiveObject();
    if (obj) window.canvas.sendToBack(obj);
}

function zoomIn() {
    window.canvas.setZoom(window.canvas.getZoom() * 1.1);
    if (typeof updateCanvasInfo === 'function') updateCanvasInfo();
}

function zoomOut() {
    window.canvas.setZoom(window.canvas.getZoom() / 1.1);
    if (typeof updateCanvasInfo === 'function') updateCanvasInfo();
}
function changeCanvasSize() {
    let w = prompt('Nhập chiều rộng (px):', window.canvas.width);
    let h = prompt('Nhập chiều cao (px):', window.canvas.height);
    if (w && h) {
        window.canvas.setWidth(Number(w));
        window.canvas.setHeight(Number(h));
        document.querySelector('.canvas-box').style.width = w + 'px';
        document.querySelector('.canvas-box').style.height = h + 'px';
    }
}


function setFont(font) {
    const obj = window.canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
        obj.set('fontFamily', font);
        window.canvas.requestRenderAll();
    }
}



function selectTool(tool) {
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`.tool-btn[onclick*="${tool}"]`);
    if (btn) btn.classList.add('active');
    if (tool === 'draw') {
        window.canvas.isDrawingMode = true;
    } else {
        window.canvas.isDrawingMode = false;
    }
}

function setFontSize(size) {
    const obj = window.canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
        obj.set('fontSize', parseInt(size, 10));
        window.canvas.requestRenderAll();
    }
}
function setAlign(align) {
    const obj = window.canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
        obj.set('textAlign', align);
        window.canvas.requestRenderAll();
    }
}


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



window.setAlign = setAlign;
window.setFontSize = setFontSize;
window.bringToFront = bringToFront;
window.setFont = setFont;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.selectTool = selectTool;
window.sendToBack = sendToBack;
window.changeCanvasSize = changeCanvasSize;
window.changeColor = changeColor;
