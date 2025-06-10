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
    let w = prompt('Nhập chiều rộng (px):', window.canvas.getWidth());
    let h = prompt('Nhập chiều cao (px):', window.canvas.getHeight());
    if (w && h) {
        w = Number(w);
        h = Number(h);

        const oldW = window.canvas.getWidth();
        const oldH = window.canvas.getHeight();

        const scaleX = w / oldW;
        const scaleY = h / oldH;
        window.canvas.getObjects().forEach(obj => {
            obj.left = (obj.left || 0) * scaleX;
            obj.top = (obj.top || 0) * scaleY;
            // Không scale scaleX/scaleY ở đây!
            obj.setCoords();
        });

        // Đổi kích thước box, thẻ canvas, fabric canvas
        const canvasBox = document.querySelector('.canvas-box');
        if (canvasBox) {
            canvasBox.style.width = w + 'px';
            canvasBox.style.height = h + 'px';
        }
        const canvasEl = document.getElementById('templateCanvas');
        if (canvasEl) {
            canvasEl.width = w;
            canvasEl.height = h;
        }
        window.canvas.setWidth(w);
        window.canvas.setHeight(h);

        window.canvas.discardActiveObject();
        window.canvas.getObjects().forEach(obj => obj.setCoords());
        window.canvas.renderAll();

        localStorage.setItem('canvas_design_width', w);
        localStorage.setItem('canvas_design_height', h);
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
