function addLine() {
    const line = new fabric.Line([50, 100, 200, 100], {
        left: 170,
        top: 100,
        stroke: '#222',
        strokeWidth: 3
    });
    window.canvas.add(line).setActiveObject(line);
}

function addRect() {
    const rect = new fabric.Rect({
        left: 150,
        top: 100,
        fill: '#00bcd4',
        width: 100,
        height: 60
    });
    window.canvas.add(rect).setActiveObject(rect);
}

function addCircle() {
    const circle = new fabric.Circle({
        left: 250,
        top: 120,
        fill: '#673ab7',
        radius: 40
    });
    window.canvas.add(circle).setActiveObject(circle);
}

function addText() {
    const text = new fabric.Textbox('Nhập nội dung', {
        left: 120,
        top: 60,
        fontSize: 22,
        fill: '#222',
        width: 200,
        fontFamily: 'Arial',
        textAlign: 'center'
    });
    window.canvas.add(text).setActiveObject(text);
}

function increaseSize() {
    const obj = window.canvas.getActiveObject();
    if (obj) {
        obj.scaleX *= 1.1;
        obj.scaleY *= 1.1;
        window.canvas.requestRenderAll();
    }
}
function decreaseSize() {
    const obj = window.canvas.getActiveObject();
    if (obj) {
        obj.scaleX /= 1.1;
        obj.scaleY /= 1.1;
        window.canvas.requestRenderAll();
    }
}
function rotateLeft() {
    const obj = window.canvas.getActiveObject();
    if (obj) {
        obj.angle = (obj.angle || 0) - 15;
        window.canvas.requestRenderAll();
    }
}
function rotateRight() {
    const obj = window.canvas.getActiveObject();
    if (obj) {
        obj.angle = (obj.angle || 0) + 15;
        window.canvas.requestRenderAll();
    }
}
function lockSelected() {
    const obj = window.canvas.getActiveObject();
    if (obj) {
        obj.selectable = false;
        obj.evented = false;
        window.canvas.discardActiveObject();
        window.canvas.requestRenderAll();
    }
}


function alignLeftSelected() {
    const obj = window.canvas.getActiveObject();
    if (!obj) return;
    // Căn trái theo canvas (không tính viewportTransform)
    obj.left = 0;
    obj.setCoords();
    window.canvas.requestRenderAll();
}

function alignCenterSelected() {
    const obj = window.canvas.getActiveObject();
    if (!obj) return;
    const canvasWidth = window.canvas.getWidth();
    const objWidth = obj.getScaledWidth ? obj.getScaledWidth() : (obj.width * obj.scaleX);
    obj.left = (canvasWidth - objWidth) / 2;
    obj.setCoords();
    window.canvas.requestRenderAll();
}

function alignRightSelected() {
    const obj = window.canvas.getActiveObject();
    if (!obj) return;
    const canvasWidth = window.canvas.getWidth();
    const objWidth = obj.getScaledWidth ? obj.getScaledWidth() : (obj.width * obj.scaleX);
    obj.left = canvasWidth - objWidth;
    obj.setCoords();
    window.canvas.requestRenderAll();
}



function unlockSelected() {
    window.canvas.getObjects().forEach(obj => {
        if (!obj.selectable) {
            obj.selectable = true;
            obj.evented = true;
        }
    });
    window.canvas.requestRenderAll();
}

function addStaticQR(qrText = 'https://example.com') {
    // Tạo thẻ tạm để render QR bằng thư viện
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px'; // ẩn khỏi màn hình
    document.body.appendChild(tempDiv);

    const qr = new QRCode(tempDiv, {
        text: qrText,
        width: 300,
        height: 300,
        correctLevel: QRCode.CorrectLevel.H
    });

    // Đợi render xong rồi lấy base64
    setTimeout(() => {
        const qrImg = tempDiv.querySelector('img');
        if (!qrImg || !qrImg.src) {
            alert("Không thể tạo QR code.");
            return;
        }

        const dataUrl = qrImg.src;
        document.body.removeChild(tempDiv);

        fabric.Image.fromURL(dataUrl, function (img) {

            const targetSize = 80;
            img.scaleToWidth(targetSize);
            img.scaleToHeight(targetSize);
            img.set({
                left: 200,
                top: 150,
                customType: 'staticQR',
                qrValue: qrText
            });
            window.canvas.add(img).setActiveObject(img);
        }, { crossOrigin: 'Anonymous' });
    }, 100);
}


// Sự kiện click vào QR tĩnh để hiện input đổi nội dung
function handleStaticQRInput() {
    const obj = window.canvas.getActiveObject();
    const qrInput = document.getElementById('staticQRInput');
    if (obj && obj.customType === 'staticQR') {
        qrInput.style.display = 'block';
        qrInput.value = obj.qrValue || '';
        qrInput.onchange = function () {
            obj.qrValue = qrInput.value;
            QRCode.toDataURL(qrInput.value, { width: 80, margin: 1 }, function (err, url) {
                if (err) {
                    alert('Lỗi tạo QR code');
                    return;
                }
                fabric.Image.fromURL(url, function (newImg) {
                    newImg.set({
                        left: obj.left,
                        top: obj.top,
                        scaleX: obj.scaleX,
                        scaleY: obj.scaleY,
                        customType: 'staticQR',
                        qrValue: qrInput.value
                    });
                    window.canvas.remove(obj);
                    window.canvas.add(newImg).setActiveObject(newImg);
                }, { crossOrigin: 'Anonymous' });
            });
        };
    } else if (qrInput) {
        qrInput.style.display = 'none';
    }
}

// Đăng ký sự kiện khi chọn object
window.canvas.on('selection:created', handleStaticQRInput);
window.canvas.on('selection:updated', handleStaticQRInput);
window.canvas.on('selection:cleared', () => {
    const qrInput = document.getElementById('staticQRInput');
    if (qrInput) qrInput.style.display = 'none';
});

// Đăng ký hàm ra window để gọi từ HTML

function addDynamicText(content) {
    // Thêm hậu tố _text nếu chưa có
    let field = content.replace(/[#\{\}]/g, '');
    if (!field.endsWith('_text')) field += '_text';
    const text = new fabric.Textbox(`#{${field}}`, {
        left: 120, top: 60, fontSize: 22, fill: '#222', width: 200, fontFamily: 'DejaVu Sans',
        customType: 'dynamic',
        textAlign: 'center',
        variable: `#{${field}}`
    });
    window.canvas.add(text).setActiveObject(text);
    updateDynamicFieldsLabel();
}

function promptDynamicField() {
    const field = prompt('Nhập tên biến (không dấu, không khoảng trắng):');
    if (field && /^[a-zA-Z0-9_]+$/.test(field)) {
        addDynamicText(`#{${field}}`);
    } else if (field) {
        alert('Tên biến không hợp lệ!');
    }
}

function addDynamicQR() {
    let field = prompt('Nhập tên biến QR (không dấu, không khoảng trắng):');
    if (field && /^[a-zA-Z0-9_]+$/.test(field)) {
        // Thêm hậu tố _qr nếu chưa có
        if (!field.endsWith('_qr')) field += '_qr';
        const rect = new fabric.Rect({
            width: 70, height: 70, fill: '#eee', stroke: '#333', strokeWidth: 1
        });
        const label = new fabric.Text(`#{${field}}`, {
            fontSize: 12, left: 10, top: 25, fill: '#333'
        });
        const group = new fabric.Group([rect, label], { left: 300, top: 120, customType: 'dynamicQR', variable: `#{${field}}` });
        window.canvas.add(group).setActiveObject(group);
        updateDynamicFieldsLabel();
    } else if (field) {
        alert('Tên biến không hợp lệ!');
    }
}

function getDynamicFieldsFromCanvas() {
    const config = window.canvas.toJSON(['customType', 'variable', 'qrValue']);
    const fields = [];
    const exists = new Set();
    function scan(obj) {
        ['text', 'variable'].forEach(key => {
            if (typeof obj[key] === 'string') {
                (obj[key].match(/#\{(.*?)\}/g) || []).forEach(m => {
                    const field = m.replace(/[#\{\}]/g, '');
                    if (!exists.has(field)) {
                        exists.add(field);
                        fields.push(field);
                    }
                });
            }
        });
        // Nếu là group QR động thì lấy đúng tên biến QR động từ obj.variable
        if (obj.type === 'group' && obj.customType === 'dynamicQR') {
            const qrField = (obj.variable || '').replace(/[#\{\}]/g, '');
            if (qrField && !exists.has(qrField)) {
                exists.add(qrField);
                fields.push(qrField);
            }
        }
        if (Array.isArray(obj.objects)) obj.objects.forEach(scan);
    }
    if (config.objects && Array.isArray(config.objects)) {
        config.objects.forEach(scan);
    }
    return fields;
}

function updateDynamicFieldsLabel() {
    const fields = getDynamicFieldsFromCanvas();
    const labelSpan = document.getElementById('dynamic-fields-label');
    if (labelSpan) {
        labelSpan.textContent = fields.length ? fields.join(', ') : '';
    }
    // Nếu cần truyền fields lên server:
    const fieldsInput = document.getElementById('fields');
    if (fieldsInput) {
        fieldsInput.value = fields.join(',');
    }
}

function changeImage() {
    const active = window.canvas.getActiveObject();
    if (active && active.type === 'image') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function (e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (ev) {
                fabric.Image.fromURL(ev.target.result, function (img) {
                    img.set({
                        left: active.left,
                        top: active.top,
                        scaleX: active.scaleX,
                        scaleY: active.scaleY,
                        angle: active.angle
                    });
                    window.canvas.remove(active);
                    window.canvas.add(img).setActiveObject(img);
                });
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }
}

// Hàm sao chép object
function duplicateSelected() {
    const active = window.canvas.getActiveObject();
    if (active && typeof active.clone === 'function') {
        active.clone(function (clone) {
            clone.set({ left: active.left + 20, top: active.top + 20 });
            window.canvas.add(clone).setActiveObject(clone);
        });
    }
}
window.duplicateSelected = duplicateSelected;

// Hàm sửa text (ví dụ: mở prompt, bạn có thể thay bằng modal đẹp hơn)
function editText() {
    const active = window.canvas.getActiveObject();
    if (!active) return;
    // Nếu là text
    if (active.type === 'textbox' || active.type === 'text') {
        const newText = prompt('Nhập nội dung mới:', active.text || '');
        if (newText !== null) {
            active.text = newText;
            window.canvas.requestRenderAll();
        }
    }
    // Nếu là QR tĩnh
    else if (active.customType === 'staticQR') {
        const newValue = prompt('Nhập nội dung mới cho QR:', active.qrValue || '');
        if (newValue !== null && newValue !== '') {
            active.qrValue = newValue;
            QRCode.toDataURL(newValue, { width: 80, margin: 1 }, function (err, url) {
                if (err) {
                    alert('Lỗi tạo QR code');
                    return;
                }
                fabric.Image.fromURL(url, function (newImg) {
                    newImg.set({
                        left: active.left,
                        top: active.top,
                        scaleX: active.scaleX,
                        scaleY: active.scaleY,
                        customType: 'staticQR',
                        qrValue: newValue
                    });
                    window.canvas.remove(active);
                    window.canvas.add(newImg).setActiveObject(newImg);
                }, { crossOrigin: 'Anonymous' });
            });
        }
    }
    // Nếu là ảnh
    else if (active.type === 'image' && !active.customType) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function (e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (ev) {
                fabric.Image.fromURL(ev.target.result, function (img) {
                    img.set({
                        left: active.left,
                        top: active.top,
                        scaleX: active.scaleX,
                        scaleY: active.scaleY,
                        angle: active.angle
                    });
                    window.canvas.remove(active);
                    window.canvas.add(img).setActiveObject(img);
                });
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }
}


// Hàm sửa QR
function changeQR() {
    const active = window.canvas.getActiveObject();
    if (active && active.customType === 'staticQR') {
        const newValue = prompt('Nhập nội dung mới cho QR:', active.qrValue || '');
        if (newValue !== null && newValue.trim() !== '') {
            const cleanedValue = newValue.trim();
            active.qrValue = cleanedValue;

            // Lưu lại kích thước thực tế trước khi thay QR
            const prevWidth = active.getScaledWidth ? active.getScaledWidth() : (active.width * (active.scaleX || 1));
            const prevHeight = active.getScaledHeight ? active.getScaledHeight() : (active.height * (active.scaleY || 1));
            const prevLeft = active.left;
            const prevTop = active.top;

            // Tạo QR mới bằng QRCode.js
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);

            new QRCode(tempDiv, {
                text: cleanedValue,
                width: 300,
                height: 300,
                correctLevel: QRCode.CorrectLevel.H
            });

            setTimeout(() => {
                const newImg = tempDiv.querySelector('img');
                if (!newImg || !newImg.src) {
                    alert("Không thể tạo mã QR mới.");
                    return;
                }

                const dataUrl = newImg.src;
                document.body.removeChild(tempDiv);

                fabric.Image.fromURL(dataUrl, function (img) {
                    // Scale lại đúng kích thước cũ
                    img.scaleToWidth(prevWidth);
                    img.scaleToHeight(prevHeight);
                    img.set({
                        left: prevLeft,
                        top: prevTop,
                        customType: 'staticQR',
                        qrValue: cleanedValue
                    });

                    window.canvas.remove(active);
                    window.canvas.add(img).setActiveObject(img);
                }, { crossOrigin: 'Anonymous' });
            }, 100);
        }
    }
}


function showToolbarForActiveObject() {
    const active = window.canvas.getActiveObject();
    const toolbar = document.getElementById('objectToolbar');
    // Các nút/textbox
    const changeColorBtn = document.getElementById('changeColorMenu');
    const changeImageBtn = document.getElementById('changeImageMenu');
    const editQRBtn = document.getElementById('editQRMenu');
    const editTextBtn = document.getElementById('editTextBtn');
    const fontFamilySelect = document.getElementById('fontFamilySelect');
    const fontSizeInput = document.getElementById('fontSizeInput');
    const alignLeftBtn = document.getElementById('alignLeftBtn');
    const alignCenterBtn = document.getElementById('alignCenterBtn');
    const alignRightBtn = document.getElementById('alignRightBtn');

    console.log(active, 'active');
    if (active && toolbar) {
        toolbar.style.display = 'flex';

        // Ẩn tất cả các nút đặc biệt trước
        [changeImageBtn, editQRBtn, changeColorBtn, editTextBtn, fontFamilySelect, fontSizeInput, alignLeftBtn, alignCenterBtn, alignRightBtn].forEach(btn => {
            if (btn) btn.style.display = 'none';
        });

        // Ảnh: chỉ hiện nút đổi ảnh
        if (active.type === 'image' && !active.customType) {
            if (changeImageBtn) changeImageBtn.style.display = 'inline-block';
        }
        // QR tĩnh: chỉ hiện nút sửa QR
        else if (active.customType === 'staticQR') {
            if (editQRBtn) editQRBtn.style.display = 'inline-block';
        }
        // Text: hiện đủ các nút text
        else if (active.type === 'textbox' || active.type === 'text') {
            if (editTextBtn) editTextBtn.style.display = 'inline-block';
            if (changeColorBtn) changeColorBtn.style.display = 'inline-block';
            if (fontFamilySelect) {
                fontFamilySelect.style.display = 'inline-block';
                fontFamilySelect.value = active.fontFamily || 'Arial';
            }
            if (fontSizeInput) {
                fontSizeInput.style.display = 'inline-block';
                fontSizeInput.value = active.fontSize || 22;
            }
            if (alignLeftBtn) alignLeftBtn.style.display = 'inline-block';
            if (alignCenterBtn) alignCenterBtn.style.display = 'inline-block';
            if (alignRightBtn) alignRightBtn.style.display = 'inline-block';
        }
        // Hình khối: chỉ hiện nút đổi màu
        else if (active.type === 'rect' || active.type === 'circle' || active.type === 'line') {
            if (changeColorBtn) changeColorBtn.style.display = 'inline-block';
        }
    } else {
        toolbar.style.display = 'none';
    }
}
window.canvas.on('selection:created', showToolbarForActiveObject);
window.canvas.on('selection:updated', showToolbarForActiveObject);
window.canvas.on('selection:cleared', () => {
    document.getElementById('objectToolbar').style.display = 'none';
});

// Gọi lại khi mở modal in
function openPrintModal() {
    const nameInput = document.querySelector('.name_design');
    if (!nameInput || !nameInput.value.trim()) {
        alert("Vui lòng nhập tên bản thiết kế trước khi in!");
        return;
    }
    const name = nameInput.value.trim();
    const canvas = window.canvas;
    if (!canvas) {
        alert("Canvas chưa được khởi tạo!");
        return;
    }
    document.getElementById('template_name').value = name;
    document.getElementById('template_width').value = canvas.getWidth();
    document.getElementById('template_height').value = canvas.getHeight();
    document.getElementById('template_zoom').value = canvas.getZoom();
    document.getElementById('template_viewport').value = JSON.stringify(canvas.viewportTransform);

    // Lưu thêm kích thước canvas vào config
    const config = canvas.toJSON(['customType', 'variable']);
    config.canvasWidth = canvas.width;
    config.canvasHeight = canvas.height;
    document.getElementById('template_config').value = JSON.stringify(config);

    // --- WYSIWYG PREVIEW LOGIC ---
    // Directly export the current canvas as PNG, no resizing or label-based scaling
    setTimeout(() => {
        const dataUrl = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 1 // Export at current canvas size
        });
        const preview = document.getElementById('canvasPreview');
        if (preview) {
            preview.src = dataUrl;
            preview.style.display = 'block';
            preview.style.width = '';
            preview.style.height = '';
            preview.style.maxWidth = '100%';
            preview.style.maxHeight = '80vh';
            preview.style.objectFit = 'contain';
            preview.style.background = '#fff';
            preview.style.margin = '0 auto';
        }
        updateDynamicFieldsLabel();

        // ZPL logic (unchanged)
        const labelWidthInch = parseFloat(document.getElementById('labelWidthPrint')?.value) || 4;
        const labelHeightInch = parseFloat(document.getElementById('labelHeightPrint')?.value) || 6;
        const dpi = parseInt(document.getElementById('dpiSelectPrint')?.value) || 8;
        const zpl = convertCanvasToZPL(window.canvas, labelWidthInch, labelHeightInch, dpi);
        document.getElementById('zplPrintOutput').value = zpl;
        document.getElementById('labelaryPreviewPrint').src = '';

        // Mở modal
        const printModal = new bootstrap.Modal(document.getElementById('printModal'));
        printModal.show();

        updatePreviewSize();
        previewZPL();
    }, 200);
}

// Hàm chuyển đổi kích thước sang inch
function convertToInch(value, unit) {
    switch (unit) {
        case 'mm':
            return value / 25.4;
        case 'cm':
            return value / 2.54;
        case 'inch':
        default:
            return value;
    }
}

// Cập nhật hàm downloadPDF để xử lý đơn vị
async function downloadPDF() {
    const img = document.getElementById('labelaryPreviewPrint');
    if (!img || !img.src) {
        alert('Chưa có preview ZPL!');
        return;
    }

    const labelUnit = document.getElementById('labelUnit')?.value || 'inch';
    const labelWidth = parseFloat(document.getElementById('labelWidthPrint')?.value) || 4;
    const labelHeight = parseFloat(document.getElementById('labelHeightPrint')?.value) || 6;
    const labelWidthInch = convertToInch(labelWidth, labelUnit);
    const labelHeightInch = convertToInch(labelHeight, labelUnit);
    const dpi = parseInt(document.getElementById('dpiSelectPrint')?.value) || 8;

    // Tạo ảnh vẽ ra canvas để đảm bảo đúng PNG
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const pngDataUrl = canvas.toDataURL('image/png');

    const { PDFDocument } = window['pdf-lib'];
    const pdfDoc = await PDFDocument.create();
    const pngImage = await pdfDoc.embedPng(pngDataUrl);

    // Chuyển inch sang point (1 inch = 72 point trong PDF)
    const pageWidth = labelWidthInch * 72;
    const pageHeight = labelHeightInch * 72;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
    });

    const pdfBytes = await pdfDoc.save();
    const blobPDF = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blobPDF);
    link.download = 'label.pdf';
    link.click();
}

// Cập nhật hàm downloadMultiLabelPDF để xử lý đơn vị
async function downloadMultiLabelPDF() {
    const img = document.getElementById('labelaryPreviewPrint');
    const count = parseInt(document.getElementById('labelCount').value) || 1;
    if (!img || !img.src) {
        alert('Chưa có preview ZPL!');
        return;
    }

    const labelUnit = document.getElementById('labelUnit')?.value || 'inch';
    const labelWidth = parseFloat(document.getElementById('labelWidthPrint')?.value) || 4;
    const labelHeight = parseFloat(document.getElementById('labelHeightPrint')?.value) || 6;
    const labelWidthInch = convertToInch(labelWidth, labelUnit);
    const labelHeightInch = convertToInch(labelHeight, labelUnit);

    // Đúng chuẩn PDF: 1 inch = 72 point
    const pageWidth = labelWidthInch * 72;
    const pageHeight = labelHeightInch * 72;

    // Đảm bảo lấy đúng PNG base64 từ canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const pngDataUrl = canvas.toDataURL('image/png');

    const { PDFDocument } = window['pdf-lib'];
    const pdfDoc = await PDFDocument.create();
    const pngImage = await pdfDoc.embedPng(pngDataUrl);

    for (let i = 0; i < count; i++) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
        });
    }

    const pdfBytes = await pdfDoc.save();
    const blobPDF = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blobPDF);
    link.download = 'labels-multi.pdf';
    link.click();
}

// Cập nhật hàm downloadEPL để xử lý đơn vị
function downloadEPL() {
    const labelUnit = document.getElementById('labelUnit')?.value || 'inch';
    const labelWidth = parseFloat(document.getElementById('labelWidthPrint')?.value) || 4;
    const labelHeight = parseFloat(document.getElementById('labelHeightPrint')?.value) || 6
    const wInch = convertToInch(labelWidth, labelUnit);
    const hInch = convertToInch(labelHeight, labelUnit);
    const dpi = parseInt(document.getElementById('dpiSelectPrint')?.value) || 8;
    const widthDot = Math.round(wInch * dpi * 25.4);
    const heightDot = Math.round(hInch * dpi * 25.4);

    const epl = convertCanvasToEPL(window.canvas, widthDot, heightDot);
    const blob = new Blob([epl], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'label.epl';
    link.click();
}

function convertCanvasToEPL(canvas, widthDot, heightDot) {
    let epl = `! 0 200 200 ${heightDot} 1\nN\n`;
    canvas.getObjects().forEach(obj => {
        if (obj.type === 'text' || obj.type === 'textbox') {
            // EPL chỉ hỗ trợ font đơn giản, ví dụ font 4
            epl += `A${Math.round(obj.left)},${Math.round(obj.top)},0,4,1,1,N,"${obj.text}"\n`;
        } else if (obj.type === 'rect') {
            // EPL: BOX x, y, width, height, thickness
            const x = Math.round(obj.left);
            const y = Math.round(obj.top);
            const w = Math.round(obj.width * (obj.scaleX || 1));
            const h = Math.round(obj.height * (obj.scaleY || 1));
            const thickness = obj.strokeWidth || 1;
            epl += `BOX ${x},${y},${w},${h},${thickness}\n`;
        } else if (obj.type === 'line') {
            // EPL: L x1, y1, x2, y2, thickness
            const x1 = Math.round(obj.x1 * (obj.scaleX || 1) + (obj.left || 0));
            const y1 = Math.round(obj.y1 * (obj.scaleY || 1) + (obj.top || 0));
            const x2 = Math.round(obj.x2 * (obj.scaleX || 1) + (obj.left || 0));
            const y2 = Math.round(obj.y2 * (obj.scaleY || 1) + (obj.top || 0));
            const thickness = obj.strokeWidth || 1;
            epl += `L ${x1},${y1},${x2},${y2},${thickness}\n`;
        } else if (obj.type === 'image' || obj.type === 'circle' || obj.customType === 'staticQR' || obj.customType === 'dynamicQR') {
            // EPL không hỗ trợ image, circle, QR code
            // Bạn có thể thêm dòng chú thích hoặc bỏ qua
            // epl += `; [${obj.type}] không hỗ trợ trong EPL\n`;
        }
    });
    epl += 'P1\n';
    return epl;
}
function downloadZPL() {
    // Lấy nội dung ZPL hiện tại từ textarea (bao gồm cả ảnh đã thêm)
    const textarea = document.getElementById('zplPrintOutput');
    const zpl = textarea ? textarea.value : '';
    const blob = new Blob([zpl], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'label.zpl';
    link.click();
}

function downloadPNG() {
    const img = document.getElementById('labelaryPreviewPrint');
    if (!img || !img.src) {
        alert('Chưa có preview ZPL!');
        return;
    }
    const link = document.createElement('a');
    link.href = img.src;
    link.download = 'label.png';
    link.click();
}


function redrawZPL() {
    const zplWarning = document.getElementById('zplWarning');
    if (zplWarning && zplWarning.style.display !== 'none') {
        previewZPL();
        checkZPLTextareaWarning(); // Đảm bảo gọi ở đây nếu chỉ preview từ textarea
        return;
    }
    const labelWidthInch = parseFloat(document.getElementById('labelWidthPrint')?.value) || 4;
    const labelHeightInch = parseFloat(document.getElementById('labelHeightPrint')?.value) || 6;
    const zpl = convertCanvasToZPL(window.canvas, labelWidthInch, labelHeightInch, 8, true);
    document.getElementById('zplPrintOutput').value = zpl;
    checkZPLTextareaWarning();
    updateLabelCountFromTextarea();
    previewZPL();
}

function restoreZPLFromCanvas() {
    // Lấy lại ZPL từ canvas và cập nhật textarea
    if (window.canvas) {
        // Lấy thông số label size từ input
        const labelWidthInch = parseFloat(document.getElementById('labelWidthPrint')?.value) || 4;
        const labelHeightInch = parseFloat(document.getElementById('labelHeightPrint')?.value) || 6;
        const dpi = parseInt(document.getElementById('dpiSelectPrint')?.value) || 8;
        const zpl = convertCanvasToZPL(window.canvas, labelWidthInch, labelHeightInch, dpi);
        document.getElementById('zplPrintOutput').value = zpl;
        // Ẩn cảnh báo sửa thủ công nếu có
        const zplWarning = document.getElementById('zplWarning');
        if (zplWarning) zplWarning.style.display = 'none';
        previewZPL();
    }
}

let previewRotation = 0;

function rotatePreview() {
    previewRotation = (previewRotation + 90) % 360;
    const img = document.getElementById('labelaryPreviewPrint');
    const box = document.getElementById('zplPreviewBox');
    if (img && box) {
        // Thêm hiệu ứng transition nếu chưa có
        if (!img.style.transition) {
            img.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1), max-width 0.4s, max-height 0.4s';
        }
        img.style.transform = `rotate(${previewRotation}deg)`;

        // Lấy kích thước gốc của box
        const boxW = box.offsetWidth;
        const boxH = box.offsetHeight;

        // Nếu xoay 90 hoặc 270, hoán đổi max-width/max-height
        if (previewRotation % 180 !== 0) {
            img.style.maxWidth = boxH + 'px';
            img.style.maxHeight = boxW + 'px';
        } else {
            img.style.maxWidth = boxW + 'px';
            img.style.maxHeight = boxH + 'px';
        }

        // Đảm bảo ảnh luôn căn giữa
        img.style.display = 'block';
        img.style.margin = 'auto';
    }
}

function updatePreviewSize() {
    const canvas = window.canvas;
    if (!canvas) return;

    const previewContainer = document.querySelector('.preview-container');
    const previewBox = document.getElementById('zplPreviewBox');
    const previewImg = document.getElementById('labelaryPreviewPrint');

    if (!previewContainer || !previewBox || !previewImg) return;

    // Lấy kích thước thực của canvas
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    // Cập nhật kích thước cho các phần tử
    previewContainer.style.width = canvasWidth + 'px';
    previewContainer.style.height = canvasHeight + 'px';
    // previewBox.style.width = canvasWidth + 'px';
    previewBox.style.height = canvasHeight + 'px';
    previewImg.style.width = canvasWidth + 'px';
    previewImg.style.height = canvasHeight + 'px';
}

// Gọi hàm khi canvas thay đổi kích thước
window.canvas.on('resize', updatePreviewSize);

// Sửa lại hàm previewZPL để gọi updatePreviewSize
function previewZPL() {
    const textarea = document.getElementById('zplPrintOutput');
    const zpl = textarea ? textarea.value.trim() : '';

    if (!zpl) {
        console.error('Không có nội dung ZPL');
        return;
    }
    if (!zpl.startsWith('^XA') || !zpl.endsWith('^XZ')) {
        console.error('ZPL không hợp lệ - phải bắt đầu bằng ^XA và kết thúc bằng ^XZ');
        return;
    }

    // Lấy canvas hiện tại
    const canvas = window.canvas;
    if (!canvas) {
        console.error('Không tìm thấy canvas');
        return;
    }

    // Lấy và kiểm tra preview elements
    const previewBox = document.getElementById('zplPreviewBox');
    const previewImg = document.getElementById('labelaryPreviewPrint');

    if (!previewBox || !previewImg) {
        console.error('Không tìm thấy phần tử preview');
        return;
    }

    // Lấy thông số label size từ input
    const dpi = parseInt(document.getElementById('dpiSelectPrint')?.value) || 8;
    const labelUnit = document.getElementById('labelUnit')?.value || 'inch';
    const labelWidth = parseFloat(document.getElementById('labelWidthPrint').value);
    const labelHeight = parseFloat(document.getElementById('labelHeightPrint').value);

    if (!labelWidth || !labelHeight || labelWidth <= 0 || labelHeight <= 0) {
        console.error('Kích thước nhãn không hợp lệ:', { labelWidth, labelHeight });
        return;
    }

    const wInch = convertToInch(labelWidth, labelUnit);
    const hInch = convertToInch(labelHeight, labelUnit);

    if (wInch <= 0 || hInch <= 0) {
        console.error('Kích thước inch không hợp lệ:', { wInch, hInch });
        return;
    }

    // Gọi API Labelary
    const apiUrl = `https://api.labelary.com/v1/printers/${dpi}dpmm/labels/${wInch}x${hInch}/0/`;

    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Accept": "image/png",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: zpl
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status} ${response.statusText}`);
            }
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);

            previewImg.onload = function () {
                const imgWidth = this.naturalWidth;
                const imgHeight = this.naturalHeight;

                const dpmm = dpi;
                const dpiReal = dpmm * 25.4; // Convert về dots/inch

                const labelPixelWidth = Math.round(wInch * dpiReal);
                const labelPixelHeight = Math.round(hInch * dpiReal);

                previewImg.style.width = `${labelPixelWidth}px`;
                previewImg.style.height = `${labelPixelHeight}px`;
                previewImg.style.maxWidth = '100%';
                previewImg.style.objectFit = 'contain';
                previewImg.style.display = 'block';
                previewImg.style.margin = '0 auto';
                previewImg.style.padding = '0';
                previewImg.style.transform = previewRotation ? `rotate(${previewRotation}deg)` : 'none';

                console.log('Preview loaded:', {
                    previewSize: `${imgWidth}x${imgHeight}px`,
                    labelSize: `${labelPixelWidth}x${labelPixelHeight}px`,
                    dpiReal
                });
            };



            previewImg.onerror = function (err) {
                console.error('Lỗi load ảnh:', err);
            };

            previewImg.src = url;
        })
        .catch(err => {
            console.error('Lỗi xử lý ZPL:', err);
            alert("Không thể xem trước ZPL: " + err.message);
            if (previewImg) previewImg.src = "";
        });
}

function AddImageZPL() {
    document.getElementById('zplImageInput').click();
}

// Xử lý khi chọn file
document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('zplImageInput');
    if (input) {
        input.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (evt) {
                const base64 = evt.target.result;
                ConvertImgToZPL(base64);
                console.log(base64, 'base64');
            };
            reader.readAsDataURL(file);
        });
    }
});

// Hàm chuyển ảnh (HTMLImageElement) sang ZPL ^GFA
function imageToZPL(img, left = 0, top = 0, w, h, printQuality = 'mono') {
    // Nếu không truyền w, h thì lấy kích thước gốc
    w = w || img.width;
    h = h || img.height;

    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    const pixels = ctx.getImageData(0, 0, w, h).data;
    const bytesPerRow = Math.ceil(w / 8);
    let hexData = '';

    for (let y = 0; y < h; y++) {
        let rowBinary = '';
        for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
            const grayscale = 0.299 * r + 0.587 * g + 0.114 * b;
            let bit = '0';
            if (printQuality === 'grayscale') {
                // Ngưỡng mềm hơn, ví dụ 160
                bit = grayscale > 160 ? '0' : '1';
            } else {
                // Mono: ngưỡng cứng 128
                bit = grayscale > 128 ? '0' : '1';
            }
            rowBinary += bit;
        }
        for (let i = 0; i < rowBinary.length; i += 8) {
            const byte = rowBinary.substring(i, i + 8).padEnd(8, '0');
            hexData += parseInt(byte, 2).toString(16).padStart(2, '0').toUpperCase();
        }
    }
    const totalBytes = hexData.length / 2;
    return `^FO${left},${top}\n^GFA,${totalBytes},${totalBytes},${bytesPerRow},${hexData}\n`;
}

// Sử dụng cho import ảnh ngoài vào textarea ZPL
function ConvertImgToZPL(base64Image) {
    const img = new Image();
    img.onload = function () {
        // Lấy canvas hiện tại và viewport transform
        const canvas = window.canvas;
        const vt = canvas?.viewportTransform;

        // Lấy thông số label size từ input
        const wInch = parseFloat(document.getElementById('labelWidthPrint')?.value) || 4;
        const hInch = parseFloat(document.getElementById('labelHeightPrint')?.value) || 6;
        const dpi = parseInt(document.getElementById('dpiSelectPrint')?.value) || 8;

        // Tính kích thước thực tế của label theo dots
        const labelW = Math.round(wInch * dpi * 25.4);
        const labelH = Math.round(hInch * dpi * 25.4);

        if (canvas && vt) {
            const zoom = vt[0];
            const translateX = vt[4];
            const translateY = vt[5];

            // Tính viewport bounds trong tọa độ canvas gốc
            const viewportLeft = -translateX / zoom;
            const viewportTop = -translateY / zoom;
            const viewportWidth = canvas.width / zoom;
            const viewportHeight = canvas.height / zoom;

            // Tính tỷ lệ chuyển đổi từ canvas sang ZPL dots (giống như trong convertCanvasToZPL)
            const scaleToZPL = Math.min(
                labelW / viewportWidth,
                labelH / viewportHeight
            );

            // Tính kích thước ảnh theo tỷ lệ viewport
            const imgWidth = Math.round(img.width * scaleToZPL);
            const imgHeight = Math.round(img.height * scaleToZPL);

            // Tính vị trí để căn giữa ảnh trong viewport
            const imgLeft = Math.round((labelW - imgWidth) / 2);
            const imgTop = Math.round((labelH - imgHeight) / 2);

            // Lấy lựa chọn printQuality
            const printQuality = document.getElementById('printQuality')?.value || 'mono';

            // Tạo ZPL cho ảnh với vị trí và kích thước đã tính
            const imageZPL = imageToZPL(img, imgLeft, imgTop, imgWidth, imgHeight, printQuality);

            // Cập nhật textarea
            const textarea = document.getElementById('zplPrintOutput');
            let zpl = textarea ? textarea.value.trim() : '';

            if (!zpl.startsWith('^XA')) {
                zpl = `^XA\n${imageZPL}^XZ`;
            } else {
                zpl = zpl.replace(/\^XZ\s*$/, `${imageZPL}^XZ`);
            }

            if (textarea) {
                textarea.value = zpl;
                previewZPL();
            }
        }
    };
    img.src = base64Image;
}

// Sử dụng cho convertCanvasToZPL
function convertCanvasToZPL(canvas, labelWidthInch = 4, labelHeightInch = 6, dpi = 8, preview = false, dynamicData = {}) {
    if (!canvas) return '^XA\n^XZ';

    let zpl = '^XA\n';

    // 1. Lấy kích thước label theo dots
    const labelW = Math.round(labelWidthInch * dpi * 25.4);
    const labelH = Math.round(labelHeightInch * dpi * 25.4);

    // 2. Lấy viewport transform hiện tại
    const vt = canvas.viewportTransform;
    if (!vt) return '^XA\n^XZ';

    // Ma trận transform: [scaleX, skewX, skewY, scaleY, translateX, translateY]
    const zoom = vt[0];
    const translateX = vt[4];
    const translateY = vt[5];

    // 3. Tính toán viewport bounds (vùng nhìn thấy trên canvas)
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Tính điểm góc trái trên của viewport trong tọa độ canvas gốc
    const viewportLeft = -translateX / zoom;
    const viewportTop = -translateY / zoom;

    // Tính kích thước thực của viewport trong tọa độ canvas gốc
    const viewportWidth = canvasWidth / zoom;
    const viewportHeight = canvasHeight / zoom;

    // 4. Tính tỷ lệ chuyển đổi từ canvas sang ZPL dots
    const scaleToZPL = Math.min(
        labelW / viewportWidth,
        labelH / viewportHeight
    );

    // 5. Luôn căn giữa nội dung canvas vào label (không dùng preview flag)
    const offsetX = (labelW - (viewportWidth * scaleToZPL)) / 2;
    const offsetY = (labelH - (viewportHeight * scaleToZPL)) / 2;

    // 6. Xử lý từng object
    canvas.getObjects().forEach(obj => {
        // Chỉ xử lý các object nằm trong viewport
        const objLeft = obj.left || 0;
        const objTop = obj.top || 0;
        const objWidth = obj.getScaledWidth ? obj.getScaledWidth() : (obj.width || 0) * (obj.scaleX || 1);
        const objHeight = obj.getScaledHeight ? obj.getScaledHeight() : (obj.height || 0) * (obj.scaleY || 1);

        // Kiểm tra object có nằm trong viewport không
        if (objLeft + objWidth < viewportLeft ||
            objLeft > viewportLeft + viewportWidth ||
            objTop + objHeight < viewportTop ||
            objTop > viewportTop + viewportHeight) {
            return;
        }

        // Tính vị trí tương đối so với viewport
        const relX = objLeft - viewportLeft;
        const relY = objTop - viewportTop;

        // Chuyển đổi sang tọa độ ZPL (dots)
        const zplX = Math.round(relX * scaleToZPL + offsetX);
        const zplY = Math.round(relY * scaleToZPL + offsetY);
        const zplW = Math.round(objWidth * scaleToZPL);
        const zplH = Math.round(objHeight * scaleToZPL);

        // Xử lý từng loại object
        if (obj.type === 'text' || obj.type === 'textbox') {
            let text = obj.text || '';
            if (dynamicData && typeof text === 'string') {
                text = text.replace(/#\{(.*?)\}/g, (m, f) => dynamicData[f] || m);
            }

            // Loại bỏ dấu
            const textNoAccent = text.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/Đ/g, "D");

            // Tính font size theo tỷ lệ thực tế và zoom
            const fontSize = Math.round(obj.fontSize * (obj.scaleY || 1) * scaleToZPL);
            const charWidth = Math.round(fontSize * 0.6);

            // Xử lý text alignment
            let textX = zplX;
            const textWidth = text.length * charWidth;

            if (obj.textAlign === 'center') {
                textX += Math.round((zplW - textWidth) / 2);
            } else if (obj.textAlign === 'right') {
                textX += zplW - textWidth;
            }

            // Thêm baseline offset
            const baselineOffset = Math.round(fontSize * 0.2);
            const textY = zplY + Math.round((zplH - fontSize) / 2) + baselineOffset;

            zpl += `^FO${textX},${textY}^A0N,${fontSize},${charWidth}^FD${textNoAccent}^FS\n`;
        }
        // QR Code
        else if (obj.type === 'group' && obj.customType === 'dynamicQR') {
    const qrField = (obj.variable || '').replace(/[#\{\}]/g, '');
    const qrValue = dynamicData[qrField];

    // Tính QR size theo tỷ lệ thực tế
    const moduleCount = 21;
    const minModuleSize = 2;
    let qrScale = Math.floor(Math.min(zplW, zplH) / moduleCount);
    if (qrScale < minModuleSize) qrScale = minModuleSize;

    const qrSize = qrScale * moduleCount;

    let qrX = zplX;
    let qrY = zplY;

    if (qrSize <= zplW && qrSize <= zplH) {
        qrX = zplX + Math.floor((zplW - qrSize) / 2);
        qrY = zplY + Math.floor((zplH - qrSize) / 2);
    }

    if (qrValue) {
        // Có giá trị thật => in QR
        zpl += `^FO${qrX},${qrY}^BQN,2,${qrScale}^FDLA,${qrValue}^FS\n`;
    } else {
        // Không có giá trị nhưng vẫn cần in (QR placeholder)
        const placeholder = obj.variable || 'QR';
        zpl += `^FO${qrX},${qrY}^BQN,2,${qrScale}^FDLA,${placeholder}^FS\n`;

        // Nếu là preview thì vẽ thêm viền + text
        // if (preview) {
        //     zpl += `^FX_QR_FIELD:${obj.variable},${qrX},${qrY},${qrScale}\n`;
        //     zpl += `^FO${zplX},${zplY}^GB${zplW},${zplH},2^FS\n`;

        //     const fontSize = Math.min(Math.floor(zplH / 3), Math.floor(zplW / (placeholder.length * 0.7)));
        //     const textWidth = placeholder.length * fontSize * 0.6;
        //     const textX = zplX + Math.floor((zplW - textWidth) / 2);
        //     const textY = zplY + Math.floor((zplH - fontSize) / 2) + Math.floor(fontSize * 0.2);
        //     zpl += `^FO${textX},${textY}^A0N,${fontSize},${Math.floor(fontSize * 0.6)}^FD${placeholder}^FS\n`;
        // }
    }
}

        // Shapes
        else if (obj.type === 'rect' || obj.type === 'line') {
            const strokeWidth = Math.max(1, Math.round((obj.strokeWidth || 1) * scaleToZPL));
            const isFill = obj.fill && obj.fill !== 'transparent' && obj.fill !== 'rgba(0,0,0,0)';

            if (obj.type === 'line') {
                // Xử lý đường thẳng theo hướng
                if (Math.abs(obj.x1 - obj.x2) > Math.abs(obj.y1 - obj.y2)) {
                    // Đường ngang
                    zpl += `^FO${zplX},${zplY}^GB${zplW},${strokeWidth},${strokeWidth}^FS\n`;
                } else {
                    // Đường dọc
                    zpl += `^FO${zplX},${zplY}^GB${strokeWidth},${zplH},${strokeWidth}^FS\n`;
                }
            } else {
                // Hình chữ nhật
                zpl += `^FO${zplX},${zplY}^GB${zplW},${zplH},${strokeWidth}${isFill ? ',B' : ''}^FS\n`;
            }
        }
        // Circle
        else if (obj.type === 'circle') {
            const radius = obj.radius * Math.min(obj.scaleX || 1, obj.scaleY || 1);
            const diameter = Math.round(radius * 2 * scaleToZPL);
            const strokeWidth = Math.max(1, Math.round((obj.strokeWidth || 1) * scaleToZPL));
            zpl += `^FO${zplX},${zplY}^GC${diameter},${strokeWidth}^FS\n`;
        }
        // Images
        else if (obj.type === 'image' && obj._element) {
            const printQuality = document.getElementById('printQuality')?.value || 'mono';
            if (obj.customType === 'staticQR') {
                // QR tĩnh
                const qrScale = Math.max(2, Math.floor(Math.min(zplW, zplH) / 21));
                zpl += `^FO${zplX},${zplY}^BQN,2,${qrScale}^FDLA,${obj.qrValue || ''}^FS\n`;
            } else {
                // Ảnh thường
                zpl += imageToZPL(obj._element, zplX, zplY, zplW, zplH, printQuality);
            }
        }
    });

    zpl += '^XZ';
    return zpl;
}


function openZPLFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zpl,.txt';
    input.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            document.getElementById('zplPrintOutput').value = evt.target.result;
            // Nếu có cảnh báo sửa tay thì ẩn đi để preview lại từ file mới
            const zplWarning = document.getElementById('zplWarning');
            if (zplWarning) zplWarning.style.display = 'none';
            updateLabelCountFromTextarea();
            previewZPL(); // Luôn cập nhật preview
        };
        reader.readAsText(file);
    };
    input.click();
}

function copyPermalink() {
    const zpl = encodeURIComponent(document.getElementById('zplPrintOutput').value);
    const dpi = document.getElementById('dpiSelectPrint').value;
    const w = document.getElementById('labelWidthPrint').value;
    const h = document.getElementById('labelHeightPrint').value;
    const url = `https://labelary.com/viewer.html?zpl=${zpl}&dpi=${dpi}&width=${w}&height=${h}`;
    navigator.clipboard.writeText(url).then(() => {
        alert('Đã sao chép permalink ZPL!');
    });
}

// Luôn cập nhật label khi canvas thay đổi
window.canvas.on('object:added', updateDynamicFieldsLabel);
window.canvas.on('object:removed', updateDynamicFieldsLabel);
window.canvas.on('object:modified', updateDynamicFieldsLabel);

// Đảm bảo customType và variable luôn được lưu/khôi phục với mọi object và group
if (fabric.Object.prototype.toObject) {
    const origToObject = fabric.Object.prototype.toObject;
    fabric.Object.prototype.toObject = function (propertiesToInclude) {
        propertiesToInclude = (propertiesToInclude || []).concat(['customType', 'variable', 'qrValue']);
        return origToObject.call(this, propertiesToInclude);
    };
}
if (fabric.Group && fabric.Group.prototype.toObject) {
    const origGroupToObject = fabric.Group.prototype.toObject;
    fabric.Group.prototype.toObject = function (propertiesToInclude) {
        propertiesToInclude = (propertiesToInclude || []).concat(['customType', 'variable', 'qrValue']);
        return origGroupToObject.call(this, propertiesToInclude);
    };
}



window.addLine = addLine;
window.promptDynamicField = promptDynamicField;
window.addRect = addRect;
window.addCircle = addCircle;
window.addText = addText;
window.changeQR = changeQR;
window.addDynamicText = addDynamicText;
window.addDynamicQR = addDynamicQR;
window.openPrintModal = openPrintModal;
window.downloadPDF = downloadPDF;
window.downloadZPL = downloadZPL;
window.previewZPL = previewZPL;
window.changeImage = changeImage;
window.showToolbarForActiveObject = showToolbarForActiveObject;
window.addStaticQR = addStaticQR;
window.increaseSize = increaseSize;
window.decreaseSize = decreaseSize;
window.rotateLeft = rotateLeft;
window.rotateRight = rotateRight;
window.lockSelected = lockSelected;
window.unlockSelected = unlockSelected;
window.alignLeftSelected = alignLeftSelected;
window.alignCenterSelected = alignCenterSelected;
window.alignRightSelected = alignRightSelected;
window.getDynamicFieldsFromCanvas = getDynamicFieldsFromCanvas;
window.convertCanvasToZPL = convertCanvasToZPL;
window.redrawZPL = redrawZPL;
window.AddImageZPL = AddImageZPL;
window.restoreZPLFromCanvas = restoreZPLFromCanvas;
window.rotatePreview = rotatePreview;
window.downloadPNG = downloadPNG;
window.downloadEPL = downloadEPL;
window.downloadMultiLabelPDF = downloadMultiLabelPDF;
window.editText = editText;
window.copyPermalink = copyPermalink;
window.openZPLFile = openZPLFile;



