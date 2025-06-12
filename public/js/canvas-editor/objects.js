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
        fontFamily: 'Arial'
    });
    window.canvas.add(text).setActiveObject(text);
}

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
    window.canvas.add(group).setActiveObject(group);
}

function addDynamicText(content) {
    const text = new fabric.Textbox(content, {
        left: 120, top: 60, fontSize: 22, fill: '#222', width: 200, fontFamily: 'Arial',
        customType: 'dynamic',
        variable: content
    });
    window.canvas.add(text).setActiveObject(text);
}

function addDynamicQR() {
    const rect = new fabric.Rect({
        width: 70, height: 70, fill: '#eee', stroke: '#333', strokeWidth: 1
    });
    const label = new fabric.Text('QR: #{code}', {
        fontSize: 12, left: 10, top: 25, fill: '#333'
    });
    const group = new fabric.Group([rect, label], { left: 300, top: 120, customType: 'dynamicQR', variable: '#{code}' });
    window.canvas.add(group).setActiveObject(group);
}
function openPrintModal() {
    const name = document.querySelector('.name_design').value;
    if (!name || name.trim() === "") {
        alert("Vui lòng nhập tên bản thiết kế trước khi in hàng loạt!");
        return;
    }
    document.getElementById('template_name').value = name;
    document.getElementById('template_width').value = window.canvas.getWidth();
    document.getElementById('template_height').value = window.canvas.getHeight();
    const config = window.canvas.toJSON(['customType', 'variable']);
    document.getElementById('template_config').value = JSON.stringify(config);

    // Tìm các trường động từ config
    const dynamicFields = new Set();
    function findDynamic(obj) {
        if (obj.text && typeof obj.text === 'string') {
            const matches = obj.text.match(/#\{(.*?)\}/g);
            if (matches) {
                matches.forEach(m => dynamicFields.add(m.replace(/[#\{\}]/g, '')));
            }
        }
        if (obj.variable && typeof obj.variable === 'string') {
            const matches = obj.variable.match(/#\{(.*?)\}/g);
            if (matches) {
                matches.forEach(m => dynamicFields.add(m.replace(/[#\{\}]/g, '')));
            }
        }
       
        if (obj.type === 'group' && obj.customType === 'dynamicQR') {
            dynamicFields.add('qrcode');
        }
      
        if (obj.objects && Array.isArray(obj.objects)) {
            obj.objects.forEach(findDynamic);
        }
    }
    if (config.objects && Array.isArray(config.objects)) {
        config.objects.forEach(findDynamic);
    }

    if (dynamicFields.size === 0) {
        dynamicFields.add('name');
        dynamicFields.add('code');
        dynamicFields.add('qrcode');
    }

    // Hiển thị danh sách trường động lên label
    const labelSpan = document.getElementById('dynamic-fields-label');
    if (labelSpan) {
        labelSpan.textContent = Array.from(dynamicFields).join(', ');
    }

    const printModal = new bootstrap.Modal(document.getElementById('printModal'));
    printModal.show();
}

window.addLine = addLine;
window.addRect = addRect;
window.addCircle = addCircle;
window.addText = addText;
window.addQRCode = addQRCode;
window.addDynamicText = addDynamicText;
window.addDynamicQR = addDynamicQR;
window.openPrintModal = openPrintModal;