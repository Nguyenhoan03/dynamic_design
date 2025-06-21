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
        width: 80,
        height: 80,
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
            img.set({
                left: 200,
                top: 150,
                scaleX: 1,
                scaleY: 1,
                customType: 'staticQR',
                qrValue: qrText
            });
            window.canvas.add(img).setActiveObject(img);
        },{ crossOrigin: 'Anonymous' });
    }, 100);
}



// Sự kiện click vào QR tĩnh để hiện input đổi nội dung
function handleStaticQRInput() {
    const obj = window.canvas.getActiveObject();
    const qrInput = document.getElementById('staticQRInput');
    if (obj && obj.customType === 'staticQR') {
        qrInput.style.display = 'block';
        qrInput.value = obj.qrValue || '';
        qrInput.onchange = function() {
            obj.qrValue = qrInput.value;
            QRCode.toDataURL(qrInput.value, { width: 80, margin: 1 }, function (err, url) {
                if (err) {
                    alert('Lỗi tạo QR code');
                    return;
                }
                fabric.Image.fromURL(url, function(newImg) {
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
        left: 120, top: 60, fontSize: 22, fill: '#222', width: 200, fontFamily: 'Arial',
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
                },{ crossOrigin: 'Anonymous'});
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
window.editText = editText;

// Hàm sửa QR
function changeQR() {
    const active = window.canvas.getActiveObject();
    if (active && active.customType === 'staticQR') {
        const newValue = prompt('Nhập nội dung mới cho QR:', active.qrValue || '');
        if (newValue !== null && newValue.trim() !== '') {
            const cleanedValue = newValue.trim();
            active.qrValue = cleanedValue;

            // Tạo QR mới bằng QRCode.js
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);

            new QRCode(tempDiv, {
                text: cleanedValue,
                width: 80,
                height: 80,
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
                    img.set({
                        left: active.left,
                        top: active.top,
                        scaleX: active.scaleX,
                        scaleY: active.scaleY,
                        customType: 'staticQR',
                        qrValue: cleanedValue
                    });

                    window.canvas.remove(active);
                    window.canvas.add(img).setActiveObject(img);
                },{ crossOrigin: 'Anonymous' });
            }, 100);
        }
    }
}


function showToolbarForActiveObject() {
    const active = window.canvas.getActiveObject();
    const toolbar = document.getElementById('objectToolbar');
    // Các nút/textbox
    const changeImageBtn = document.getElementById('changeImageBtn');
    const editQRBtn = document.getElementById('editQRBtn');
    const changeColorBtn = document.getElementById('changeColorBtn');
    const editTextBtn = document.getElementById('editTextBtn');
    const fontFamilySelect = document.getElementById('fontFamilySelect');
    const fontSizeInput = document.getElementById('fontSizeInput');
    const alignLeftBtn = document.getElementById('alignLeftBtn');
    const alignCenterBtn = document.getElementById('alignCenterBtn');
    const alignRightBtn = document.getElementById('alignRightBtn');

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
        alert("Vui lòng nhập tên bản thiết kế trước khi in hàng loạt!");
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
        
        const printModal = new bootstrap.Modal(document.getElementById('printModal'));
        printModal.show();
    }, 200);
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
