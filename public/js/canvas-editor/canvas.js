const canvasWidth = window.defaultCanvasWidth;
const canvasHeight = window.defaultCanvasHeight;

window.canvas = new fabric.Canvas('templateCanvas', {
    backgroundColor: '#fff',
    preserveObjectStacking: true,
    width: canvasWidth,
    height: canvasHeight
});
window.canvas.getObjects().forEach(obj => {
    if (obj.customType === 'staticQR') {
        console.log(obj.qrValue); 
    }
});


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

document.getElementById('uploadImg')?.addEventListener('change', function (e) {
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
            window.canvas.add(img).setActiveObject(img);
        }, { crossOrigin: 'Anonymous' }); 
    };
    reader.readAsDataURL(file);
    e.target.value = '';
});

function deleteSelected() {
    const active = window.canvas.getActiveObject();
    if (active) window.canvas.remove(active);
}

function clearCanvas() {
    window.canvas.clear();
    window.canvas.setBackgroundColor('#fff', window.canvas.renderAll.bind(window.canvas));
}



async function SaveCanvas(isSilent = false) {
    const name_design = document.querySelector('.name_design').value;
    const template_id = document.getElementById('template_id')?.value || '';

    if (!name_design || name_design.trim() === "") {
        if (!isSilent) alert("Vui lòng nhập tên bản thiết kế trước khi lưu!");
        return;
    }

    const config = JSON.stringify(window.canvas.toJSON(['customType', 'variable', 'qrValue']));
    const width = window.canvas.getWidth();  // px
    const height = window.canvas.getHeight(); // px

    // Lấy thông tin gốc người dùng đã nhập
    const unit = localStorage.getItem('canvas_design_unit');
    const user_width = localStorage.getItem('canvas_design_width') || width;
    const user_height = localStorage.getItem('canvas_design_height') || height;

    try {
        const fd = new FormData();
        fd.append('name', name_design);
        fd.append('width', user_width); // px
        fd.append('height', user_height); // px
        fd.append('config', config);
        fd.append('unit', unit);
        // fd.append('user_width', user_width);
        // fd.append('user_height', user_height);
        if (template_id) fd.append('template_id', template_id);

        const resp = await fetch('/templates', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            },
            body: fd
        });

        if (!resp.ok) {
            const data = await resp.json().catch(() => ({}));
            if (!isSilent) throw new Error(data.message || 'Lưu thiết kế thất bại!');
            return;
        }

        if (!isSilent) alert('Lưu thiết kế thành công!');
        const data = await resp.json().catch(() => ({}));
        if (data.template && data.template.id) {
            document.getElementById('template_id').value = data.template.id;
        }
    } catch (e) {
        if (!isSilent) alert(e.message);
    }
}


function downloadCanvas() {
    const name_design = document.querySelector('.name_design').value;
    if (!name_design || name_design.trim() === "") {
        alert("Vui lòng nhập tên bản thiết kế trước khi tải xuống!");
        return;
    }
    const dataURL = window.canvas.toDataURL({
        format: 'png',
        multiplier: 1
    });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = name_design + '.png';
    link.click();
}

function createNewDesign() {
    localStorage.removeItem('canvas_design');
    localStorage.removeItem('canvas_design_name');
    localStorage.removeItem('canvas_design_width');
    localStorage.removeItem('canvas_design_height');
    window.location.href = `/templates?width=500&height=500&unit=px`;
    updateCanvasInfo();
}


window.clearCanvas = clearCanvas;
window.downloadCanvas = downloadCanvas;
window.SaveCanvas = SaveCanvas;
window.deleteSelected = deleteSelected;
window.addCircle = addCircle;
window.addRect = addRect;
window.addLine = addLine;
window.createNewDesign = createNewDesign;

