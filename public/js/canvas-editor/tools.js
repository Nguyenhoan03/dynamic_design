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


function checkZPLTextareaWarning() {
    const textarea = document.getElementById('zplPrintOutput');
    const warnDiv = document.getElementById('zplLinterWarning');
    const warnText = document.getElementById('zplLinterWarningText');
    if (!textarea || !warnDiv || !warnText) return;

    warnDiv.style.display = 'none';
    warnText.innerHTML = '';

    const zpl = textarea.value;
    const errorMsgs = [];
    const errorLines = [];

    if (!zpl) {
        errorMsgs.push('Vui lòng nhập mã ZPL!');
        errorLines.push(1);
    } else {
        if (!zpl.startsWith('^XA') || !zpl.trim().endsWith('^XZ')) {
            errorMsgs.push('Mã ZPL phải bắt đầu bằng ^XA và kết thúc bằng ^XZ.');
            errorLines.push(1);
        }
        if (zpl.includes('^GB') && /,0,/.test(zpl)) {
            errorMsgs.push('Một số lệnh Line (^GB) có độ dày bằng 0, có thể không in được.');
            errorLines.push(1);
        }

        const validZPLCmds = new Set([
            'XA', 'XZ', 'FO', 'GB', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'FD', 'FS', 'FB', 'BY', 'BC', 'BQ', 'B3', 'B7', 'B8', 'B1', 'B2', 'B4', 'B5', 'B6', 'B9',
            'GFA', 'CI', 'LH', 'LL', 'LS', 'PW', 'PH', 'PM', 'PR', 'PO', 'PA', 'PF', 'FW', 'FR', 'FT', 'FV',
            'CF', 'FR', 'FX'
        ]);

        const lines = zpl.split('\n');
        let inFD = false;
        lines.forEach((line, idx) => {
            let i = 0;
            while (i < line.length) {
                if (inFD) {
                    const fsIdx = line.indexOf('^FS', i);
                    if (fsIdx === -1) break;
                    inFD = false;
                    i = fsIdx + 3;
                    continue;
                }
                const match = /\^([A-Z]{1,3})/.exec(line.slice(i));
                if (match) {
                    const cmd = match[1];
                    if (cmd === 'FD') {
                        inFD = true;
                        i += match.index + match[0].length;
                        continue;
                    }
                    if (!validZPLCmds.has(cmd)) {
                        errorMsgs.push(`Dòng ${idx + 1}: ^${cmd} không phải lệnh ZPL hợp lệ.`);
                        errorLines.push(idx + 1);
                    }
                    i += match.index + match[0].length;
                } else {
                    break;
                }
            }
        });
    }

    if (errorMsgs.length > 0) {
        warnDiv.style.display = 'block';
        warnText.innerHTML = errorMsgs.map((msg, i) =>
            `<div class="zpl-error-msg" data-line="${errorLines[i] || 1}" style="cursor:pointer">${msg}</div>`
        ).join('');
        // Gắn sự kiện click cho từng dòng lỗi
        Array.from(warnText.querySelectorAll('.zpl-error-msg')).forEach(el => {
            el.onclick = function () {
                const line = parseInt(this.getAttribute('data-line'), 10) || 1;
                goToLineInTextarea(textarea, line);
            };
        });
    } else {
        warnDiv.style.display = 'none';
        warnText.innerHTML = '';
    }
}

// Đặt con trỏ đến đầu dòng (chuẩn ZPL, không bị lệch do dòng dài)
function goToLineInTextarea(textarea, lineNumber) {
    const lines = textarea.value.split('\n');
    let position = 0;
    for (let i = 0; i < lineNumber - 1 && i < lines.length; i++) {
        position += lines[i].length + 1; // +1 for the newline character
    }
    textarea.focus();
    textarea.setSelectionRange(position, position);
    // Scroll đến dòng
    const scrollHeightPerLine = textarea.scrollHeight / lines.length;
    textarea.scrollTop = scrollHeightPerLine * (lineNumber - 1);
}



document.getElementById('downloadExcelTemplate').addEventListener('click', function () {
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
document.getElementById('excelInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Bỏ dòng đầu tiên (header)
        const dataRows = rows.slice(1);
        // Convert rows to CSV string
        const csv = dataRows.map(r => r.join(',')).join('\n');
        document.querySelector('textarea[name="csv_rows"]').value = csv;
    };
    reader.readAsArrayBuffer(file);
});

async function onMultiPDFClick() {
    // 1. Lấy dữ liệu động từ CSV/Excel thành mảng object dataRows
    const dataRows = getDataRowsFromCSVOrExcel();
    console.log(dataRows, "dataRows");
    if (!dataRows.length) {
        alert('Vui lòng nhập dữ liệu động (CSV)!');
        return;
    }

    // 2. Lấy template ZPL gốc
    const zplTemplate = document.getElementById('zplPrintOutput').value;

    // 3. Sinh các block ZPL đã thay thế trường động
    const zplBlocks = dataRows.map(row => {
        let zpl = zplTemplate;
        Object.keys(row).forEach(field => {
            // Nếu là trường QR động, chỉ thay giá trị trong ^FDLA,#{field}_qr^FS
            if (field.endsWith('_qr')) {
                // Thay thế ^FD#{field}^FS bằng lệnh QR thực sự
                zpl = zpl.replace(
                    new RegExp(`\\^FD#?\\{${field}\\}\\^FS`, 'g'),
                    `^BQN,2,10^FDLA,${row[field]}^FS`
                );
            } else {
                zpl = zpl.replace(new RegExp(`[#]?\\{${field}\\}`, 'g'), row[field] || '');
            }
        });
        return zpl;
    });

    // 4. Lấy thông số label
    const width = parseFloat(document.getElementById('labelWidthPrint').value) || 4;
    const height = parseFloat(document.getElementById('labelHeightPrint').value) || 6;
    const dpi = parseInt(document.getElementById('dpiSelectPrint').value) || 8;

    // 5. Preview từng trang
    previewMultiLabelPDF(zplBlocks, width, height, dpi);
}

function getDataRowsFromCSVOrExcel() {
    // Lấy dynamic fields từ label (hoặc từ getDynamicFieldsFromCanvas)
    const fieldsLabel = document.getElementById('dynamic-fields-label');
    let headers = [];
    if (fieldsLabel && fieldsLabel.textContent.trim()) {
        headers = fieldsLabel.textContent.split(',').map(h => h.trim());
    } else {
        // fallback nếu không có label
        headers = getDynamicFieldsFromCanvas();
    }

    // Lấy dữ liệu từ textarea
    const csv = document.querySelector('textarea[name="csv_rows"]')?.value || '';
    const lines = csv.split('\n').map(l => l.trim()).filter(l => l);
    if (!headers.length || lines.length < 1) return []; // Phải có header + ít nhất 1 dòng data

    const dataRows = [];
    for (let i = 0; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;
        const row = {};
        headers.forEach((h, idx) => row[h] = values[idx] || '');
        dataRows.push(row);
    }
    return dataRows;
}

async function previewMultiLabelPDF(zplBlocks, width, height, dpi) {
    let current = 0;
    const img = document.getElementById('multiLabelPreviewImg');
    const page = document.getElementById('multiLabelPreviewPage');
    const prevBtn = document.getElementById('multiLabelPrevBtn');
    const nextBtn = document.getElementById('multiLabelNextBtn');
    const downloadBtn = document.getElementById('multiLabelDownloadBtn');
    const downloadAllBtn = document.getElementById('multiLabelDownloadAllBtn');
    const modal = new bootstrap.Modal(document.getElementById('multiLabelPreviewModal'));

    async function showPage(idx) {

        const zplCodeTextarea = document.getElementById('zplCodeTextarea');
        if (zplCodeTextarea) {
            zplCodeTextarea.value = zplBlocks[current];
        }


        img.src = '';
        page.textContent = `Trang ${idx + 1} / ${zplBlocks.length}`;
        img.alt = 'Đang tải...';
        // Đảm bảo ZPL hợp lệ
        let zpl = zplBlocks[idx].trim();
        console.log('ZPL gửi lên Labelary:', JSON.stringify(zpl));

        if (!zpl.startsWith('^XA')) zpl = '^XA\n' + zpl;
        if (!zpl.endsWith('^XZ')) zpl = zpl + '\n^XZ';
        const res = await fetch(`https://api.labelary.com/v1/printers/${dpi}dpmm/labels/${width}x${height}/0/`, {
            method: 'POST',
            headers: { 'Accept': 'image/png', "Content-Type": "application/x-www-form-urlencoded" },
            body: zpl
        });
        if (res.ok) {
            const blob = await res.blob();
            img.src = URL.createObjectURL(blob);
        } else {
            img.alt = 'Không thể xem trước';
        }
    }

    prevBtn.onclick = () => {
        if (current > 0) {
            current--;
            showPage(current);
        }
    };
    nextBtn.onclick = () => {
        if (current < zplBlocks.length - 1) {
            current++;
            showPage(current);
        }
    };
    downloadBtn.onclick = () => {
        downloadPDFForZPL(zplBlocks[current], width, height, dpi);
    };
    downloadAllBtn.onclick = () => {
        alert('Tính năng tải tất cả PDF cần backend hỗ trợ merge PDF!');
    };

    modal.show();
    showPage(current);
}

function downloadPDFForZPL(zpl, width, height, dpi) {
    fetch(`https://api.labelary.com/v1/printers/${dpi}dpmm/labels/${width}x${height}/0/`, {
        method: 'POST',
        headers: { 'Accept': 'application/pdf' },
        body: zpl
    }).then(res => res.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'label.pdf';
            a.click();
            URL.revokeObjectURL(url);
        });
}



window.previewMultiLabelPDF = previewMultiLabelPDF;
window.previewMultiLabelPDF = previewMultiLabelPDF;
window.getDataRowsFromCSVOrExcel = getDataRowsFromCSVOrExcel;
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
window.checkZPLTextareaWarning = checkZPLTextareaWarning;
window.onMultiPDFClick = onMultiPDFClick;