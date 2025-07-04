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

    const config = canvas.toJSON(['customType', 'variable']);
    document.getElementById('template_config').value = JSON.stringify(config);

    const cloneCanvas = new fabric.StaticCanvas(null, {
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        backgroundColor: canvas.backgroundColor
    });
    canvas.getObjects().forEach(original => {
        if (typeof original.clone === 'function') {
            original.clone(clone => {
                cloneCanvas.add(clone);
                cloneCanvas.renderAll();
            });
        }
    });
    cloneCanvas.setViewportTransform([...canvas.viewportTransform]);
    setTimeout(() => {
        const dataUrl = cloneCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2
        });
        document.getElementById('template_image').value = dataUrl;
        const preview = document.getElementById('canvasPreview');
        if (preview) {
            preview.src = dataUrl;
            preview.style.display = 'block';
        }
        updateDynamicFieldsLabel();

        const labelWidthInch = parseFloat(document.getElementById('labelWidthPrint')?.value) || 4;
        const labelHeightInch = parseFloat(document.getElementById('labelHeightPrint')?.value) || 6;
        const dpi = parseInt(document.getElementById('dpiSelectPrint')?.value) || 8;
        const zpl = convertCanvasToZPL(window.canvas, labelWidthInch, labelHeightInch, dpi);
        document.getElementById('zplPrintOutput').value = zpl;
        document.getElementById('labelaryPreviewPrint').src = '';
        const printModal = new bootstrap.Modal(document.getElementById('printModal'));
        printModal.show();
        previewZPL();
    }, 200);
}


async function downloadPDF() {
    const img = document.getElementById('labelaryPreviewPrint');
    if (!img || !img.src) {
        alert('Chưa có preview ZPL!');
        return;
    }

    const labelWidthInch = parseFloat(document.getElementById('labelWidthPrint')?.value) || 4;
    const labelHeightInch = parseFloat(document.getElementById('labelHeightPrint')?.value) || 6;
    const dpi = parseInt(document.getElementById('dpiSelectPrint')?.value) || 8;
    const dotsPerInch = dpi * 25.4;

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


function downloadMultiLabelPDF() {
    const img = document.getElementById('labelaryPreviewPrint');
    const count = parseInt(document.getElementById('labelCount').value) || 1;
    if (!img || !img.src) {
        alert('Chưa có preview ZPL!');
        return;
    }
    fetch(img.src)
        .then(res => res.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onload = async function (e) {
                const { PDFDocument } = window['pdf-lib'];
                const pdfDoc = await PDFDocument.create();
                const pngImage = await pdfDoc.embedPng(e.target.result);
                for (let i = 0; i < count; i++) {
                    const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
                    page.drawImage(pngImage, { x: 0, y: 0, width: pngImage.width, height: pngImage.height });
                }
                const pdfBytes = await pdfDoc.save();
                const blobPDF = new Blob([pdfBytes], { type: 'application/pdf' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blobPDF);
                link.download = 'labels-multi.pdf';
                link.click();
            };
            reader.readAsArrayBuffer(blob);
        });
}

function downloadEPL() {
    const wInch = parseFloat(document.getElementById('labelWidthPrint')?.value) || 4;
    const hInch = parseFloat(document.getElementById('labelHeightPrint')?.value) || 6;
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
    checkZPLTextareaWarning(); // Gọi ngay sau khi cập nhật textarea
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
    if (img) {
        img.style.transform = `rotate(${previewRotation}deg)`;
    }
}

function previewZPL() {
    const zpl = document.getElementById('zplPrintOutput').value;
    const dpi = parseInt(document.getElementById('dpiSelectPrint')?.value) || 8;

    // Lấy label size từ input (inch)
    const wInch = parseFloat(document.getElementById('labelWidthPrint').value) || 4;
    const hInch = parseFloat(document.getElementById('labelHeightPrint').value) || 6;
    fetch(`https://api.labelary.com/v1/printers/${dpi}dpmm/labels/${wInch}x${hInch}/0/`, {
        method: "POST",
        headers: {
            "Accept": "image/png",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: zpl
    })
        .then(response => {
            if (!response.ok) throw new Error("Không thể render ZPL!");
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const img = document.getElementById('labelaryPreviewPrint');
            img.src = url;
            img.style.transform = `rotate(${previewRotation}deg)`;
        })
        .catch(err => {
            alert("Không thể xem trước ZPL: " + err.message);
            document.getElementById('labelaryPreviewPrint').src = "";
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
        // Lấy thông số label size từ input
        const wInch = parseFloat(document.getElementById('labelWidthPrint')?.value) || 4;
        const hInch = parseFloat(document.getElementById('labelHeightPrint')?.value) || 6;
        const dpi = parseInt(document.getElementById('dpiSelectPrint')?.value) || 8;
        const wPx = Math.round(wInch * dpi * 25.4);
        const hPx = Math.round(hInch * dpi * 25.4);
        // Lấy lựa chọn printQuality
        const printQuality = document.getElementById('printQuality')?.value || 'mono';

        // Lấy ZPL hiện tại
        const textarea = document.getElementById('zplPrintOutput');
        let zpl = textarea ? textarea.value.trim() : '';
        // Nếu chưa có ^XA thì thêm mới, nếu có thì chèn vào trước ^XZ
        const imageZPL = imageToZPL(img, 0, 0, wPx, hPx, printQuality);
        if (!zpl.startsWith('^XA')) {
            zpl = `^XA\n${imageZPL}^XZ`;
        } else {
            // Chèn imageZPL trước ^XZ
            zpl = zpl.replace(/\^XZ\s*$/, `${imageZPL}^XZ`);
        }
        if (textarea) {
            textarea.value = zpl;
            previewZPL();
        }
    };
    img.src = base64Image;
}

// Sử dụng cho convertCanvasToZPL
function convertCanvasToZPL(canvas, labelWidthInch = 4, labelHeightInch = 6, dpi = 8) {
    if (!canvas) return '^XA\n^XZ';

    let zpl = '^XA\n';
    const labelW = labelWidthInch * dpi * 25.4;
    const labelH = labelHeightInch * dpi * 25.4;

    // Lấy viewportTransform
    const vt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    const zoom = vt[0] || 1;
    const panX = vt[4] || 0;
    const panY = vt[5] || 0;

    // Vùng nhìn thấy trên canvas (theo px gốc)
    const viewLeft = -panX / zoom;
    const viewTop = -panY / zoom;
    const viewWidth = canvas.getWidth() / zoom;
    const viewHeight = canvas.getHeight() / zoom;

    // Tỉ lệ chuyển đổi px viewport -> dot label
    const pxToDotX = labelW / viewWidth;
    const pxToDotY = labelH / viewHeight;

    canvas.getObjects().forEach(obj => {
        // Vị trí object so với viewport
        const left = ((obj.left || 0) - viewLeft);
        const top = ((obj.top || 0) - viewTop);

        // --- Sửa width/height cho từng loại ---
        let width = 0, height = 0;
        if (typeof obj.getScaledWidth === 'function') {
            width = obj.getScaledWidth();
            height = obj.getScaledHeight();
        } else {
            width = (obj.width || 0) * (obj.scaleX || 1);
            height = (obj.height || 0) * (obj.scaleY || 1);
        }

        const x = Math.round(left * pxToDotX);
        const y = Math.round(top * pxToDotY);
        const w = Math.round(width * pxToDotX);
        const h = Math.round(height * pxToDotY);

        // Text
        if (obj.type === 'text' || obj.type === 'textbox') {
            let size = Math.round((obj.fontSize) * (obj.scaleY || 1) * pxToDotY * 0.85);
            if (size < 10) size = 10;
            zpl += `^FO${x},${y}^A0N,${size},${size}^FD${obj.text}^FS\n`;
        }
        // Rect
        else if (obj.type === 'rect') {
            const sw = obj.strokeWidth || 1;
            const isFill = obj.fill && obj.fill !== 'transparent' && obj.fill !== 'rgba(0,0,0,0)';
            if (isFill) {
                zpl += `^FO${x},${y}^GB${w},${h},${sw},F^FS\n`;
            } else {
                zpl += `^FO${x},${y}^GB${w},${h},${sw},B^FS\n`;
            }
        }
        // Circle
        else if (obj.type === 'circle') {
            // Đường kính thực tế = getScaledWidth(), bán kính = /2
            const r = Math.round((obj.getScaledWidth ? obj.getScaledWidth() : (obj.radius * 2 * (obj.scaleX || 1))) * ((pxToDotX + pxToDotY) / 4));
            zpl += `^FO${x},${y}^GC${r},B^FS\n`;
        }
        // Line
        else if (obj.type === 'line') {
            // Tính lại điểm đầu/cuối theo scale, rồi quy đổi sang dot
            const x1 = ((obj.x1 || 0) * (obj.scaleX || 1) + left) * pxToDotX;
            const y1 = ((obj.y1 || 0) * (obj.scaleY || 1) + top) * pxToDotY;
            const x2 = ((obj.x2 || 0) * (obj.scaleX || 1) + left) * pxToDotX;
            const y2 = ((obj.y2 || 0) * (obj.scaleY || 1) + top) * pxToDotY;
            const lw = Math.max(1, Math.round(Math.abs(x2 - x1)));
            const lh = Math.max(1, Math.round(Math.abs(y2 - y1)));
            zpl += `^FO${Math.round(x1)},${Math.round(y1)}^GB${lw},${lh},${obj.strokeWidth || 1},B^FS\n`;
        }
        // QR động (group)
        else if (obj.type === 'group' && obj.customType === 'dynamicQR') {
            const qrValue = obj.variable?.replace(/[#{}]/g, '') || 'QR';
            zpl += `^FO${x},${y}^BQN,2,6^FDLA,${qrValue}^FS\n`;
        }
        // QR tĩnh (xuất bằng ^BQN, không dùng ảnh)
        else if (obj.type === 'image' && obj.customType === 'staticQR' && obj._element) {
            // Xuất QR tĩnh thành ảnh bitmap đúng kích thước
            const printQuality = document.getElementById('printQuality')?.value || 'mono';
            zpl += imageToZPL(obj._element, x, y, w, h, printQuality);
        }
        // Ảnh thường
        else if (obj.type === 'image' && !obj.customType && obj._element) {
            const printQuality = document.getElementById('printQuality')?.value || 'mono';
            zpl += imageToZPL(obj._element, x, y, w, h, printQuality);
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