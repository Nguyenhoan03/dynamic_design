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
     window.canvas.requestRenderAll();
    if (typeof updateCanvasInfo === 'function') updateCanvasInfo();
}

function zoomOut() {
    window.canvas.setZoom(window.canvas.getZoom() / 1.1);
     window.canvas.requestRenderAll();
    if (typeof updateCanvasInfo === 'function') updateCanvasInfo();
}

function changeCanvasSize() {
    // Các đơn vị hợp lệ
    const allowedUnits = ['px', 'mm', 'cm', 'inch'];
    // Lấy đơn vị hiện tại
    let currentUnit = window.defaultCanvasUnit || localStorage.getItem('canvas_design_unit') || 'px';

    // Lấy kích thước hiện tại (ưu tiên localStorage, fallback về canvas)
    let w = Number(localStorage.getItem('canvas_design_width')) || window.canvas.getWidth();
    let h = Number(localStorage.getItem('canvas_design_height')) || window.canvas.getHeight();

    // Bước 1: Hỏi đơn vị
    let u = prompt('Chọn đơn vị (px, mm, cm, inch):', currentUnit);
    if (!u) return;
    u = u.trim().toLowerCase();
    if (!allowedUnits.includes(u)) {
        alert('Đơn vị không hợp lệ! Chỉ chấp nhận: px, mm, cm, inch');
        return;
    }

    // Bước 2: Gợi ý width/height theo đơn vị đã chọn
    let displayW = w, displayH = h;
    if (u !== 'px') {
        if (u === 'mm') {
            displayW = +(w / 3.7795275591).toFixed(2);
            displayH = +(h / 3.7795275591).toFixed(2);
        } else if (u === 'cm') {
            displayW = +(w / 37.795275591).toFixed(2);
            displayH = +(h / 37.795275591).toFixed(2);
        } else if (u === 'inch') {
            displayW = +(w / 96).toFixed(2);
            displayH = +(h / 96).toFixed(2);
        }
    }

    // Bước 3: Nhập width/height mới
    w = prompt(`Nhập chiều rộng (${u}):`, displayW);
    h = prompt(`Nhập chiều cao (${u}):`, displayH);
    if (!w || !h) return;
    w = Number(w);
    h = Number(h);

    // Bước 4: Kiểm tra min cho từng đơn vị
    const minSize = { px: 100, mm: 20, cm: 2, inch: 1 };
    if (w < minSize[u] || h < minSize[u]) {
        alert(`Kích thước tối thiểu: ${minSize[u]} ${u}`);
        return;
    }

    // Bước 5: Đổi ra px để set cho canvas
    let pxW = w, pxH = h;
    if (u === 'mm') {
        pxW = w * 3.7795275591;
        pxH = h * 3.7795275591;
    } else if (u === 'cm') {
        pxW = w * 37.795275591;
        pxH = h * 37.795275591;
    } else if (u === 'inch') {
        pxW = w * 96;
        pxH = h * 96;
    }

    // Bước 6: Scale lại các object
    const oldW = window.canvas.getWidth();
    const oldH = window.canvas.getHeight();
    const scaleX = pxW / oldW;
    const scaleY = pxH / oldH;
    window.canvas.getObjects().forEach(obj => {
        obj.left = (obj.left || 0) * scaleX;
        obj.top = (obj.top || 0) * scaleY;
        obj.setCoords();
    });

    // Bước 7: Đổi kích thước box, thẻ canvas, fabric canvas
    const canvasBox = document.querySelector('.canvas-box');
    if (canvasBox) {
        canvasBox.style.width = pxW + 'px';
        canvasBox.style.height = pxH + 'px';
    }
    const canvasEl = document.getElementById('templateCanvas');
    if (canvasEl) {
        canvasEl.width = pxW;
        canvasEl.height = pxH;
    }
    window.canvas.setWidth(pxW);
    window.canvas.setHeight(pxH);

    window.canvas.discardActiveObject();
    window.canvas.getObjects().forEach(obj => obj.setCoords());
    window.canvas.renderAll();

    // Bước 8: Lưu lại giá trị mới (theo đơn vị người dùng nhập)
    localStorage.setItem('canvas_design_width', w);
    localStorage.setItem('canvas_design_height', h);
    localStorage.setItem('canvas_design_unit', u);

    // Nếu đang ở trang edit (có window.originWidth...), cập nhật lại info gốc
    if (window.originWidth !== undefined) {
        window.originWidth = w;
        window.originHeight = h;
        window.originUnit = u;
        window.defaultCanvasUnit = u;
    }

    updateCanvasInfo();
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
function pauseVideo() {
    if (window.lastVideoObject && window.lastVideoObject._element) {
        window.lastVideoObject._element.pause();
    }
}
function playVideo() {
    if (window.lastVideoObject && window.lastVideoObject._element) {
        window.lastVideoObject._element.play();
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
            const active = window.canvas.getActiveObject();
            if (!active) return;
            // Text, textbox, rect, circle: fill
            if (
                active.type === 'textbox' ||
                active.type === 'text' ||
                active.type === 'rect' ||
                active.type === 'circle'
            ) {
                active.set('fill', this.value);
            }
            // Line: stroke
            else if (active.type === 'line') {
                active.set('stroke', this.value);
            }
            // Group: đổi fill/stroke cho từng object con
            else if (active.type === 'group') {
                active.getObjects().forEach(obj => {
                    if (obj.type === 'line') obj.set('stroke', this.value);
                    else if (obj.set && obj.fill !== undefined) obj.set('fill', this.value);
                });
            }
            window.canvas.requestRenderAll();
            colorInput.style.display = 'none';
        });
        document.body.appendChild(colorInput);
    }
    colorInput.style.display = 'block';
    colorInput.focus();
    colorInput.click();
}


document.getElementById('downloadExcelTemplate').addEventListener('click', function() {
    // Lấy danh sách trường động từ canvas
    const fields = getDynamicFieldsFromCanvas();
    if (!fields.length) {
        alert('Chưa có trường động nào trên thiết kế!');
        return;
    }
    const ws = XLSX.utils.aoa_to_sheet([fields]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MauNhap");
    XLSX.writeFile(wb, "mau_nhap_du_lieu.xlsx");
});

// Xử lý import Excel và validate dữ liệu excel
document.getElementById('excelInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, {header: 1});
        // Bỏ dòng đầu tiên (header)
        const dataRows = rows.slice(1);
        // Convert rows to CSV string
        const csv = dataRows.map(r => r.join(',')).join('\n');
        document.querySelector('textarea[name="csv_rows"]').value = csv;
    };
    reader.readAsArrayBuffer(file);
});

// Validate CSV data before submit
document.getElementById('printForm').addEventListener('submit', function(e) {
    const csv = document.querySelector('textarea[name="csv_rows"]').value.trim();
    if (!csv) {
        alert('Vui lòng nhập dữ liệu hoặc import file Excel!');
        e.preventDefault();
        return false;
    }
    // Simple validation: check each row has enough columns (ví dụ: 2 cột trở lên)
    // const rows = csv.split('\n');
    // for (let i = 0; i < rows.length; i++) {
    //     const cols = rows[i].split(',');
    //     if (cols.length < 2) {
    //         alert('Dòng ' + (i+1) + ' thiếu dữ liệu. Mỗi dòng cần ít nhất 2 cột.');
    //         e.preventDefault();
    //         return false;
    //     }
    // }    
});



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
window.pauseVideo = pauseVideo;
window.playVideo = playVideo;