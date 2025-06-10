const canvasWidth = window.defaultCanvasWidth;
const canvasHeight = window.defaultCanvasHeight;

window.canvas = new fabric.Canvas('templateCanvas', {
    backgroundColor: '#fff',
    preserveObjectStacking: true,
    width: canvasWidth,
    height: canvasHeight
});
console.log(canvasWidth, canvasHeight);

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
        });
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

async function downloadCanvas() {
    const name_design = document.querySelector('.name_design').value;
    if (!name_design || name_design.trim() === "") {
        alert("Vui lòng nhập tên bản thiết kế trước khi tải xuống!");
        return;
    }
    const dataURL = window.canvas.toDataURL({
        format: 'png',
        multiplier: 1
    });
    const config = JSON.stringify(window.canvas.toJSON());
    const width = window.canvas.getWidth();
    const height = window.canvas.getHeight();

    try {
        const resp = await fetch('/templates', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            },
            body: (() => {
                const fd = new FormData();
                fd.append('name', name_design);
                fd.append('width', width);
                fd.append('height', height);
                fd.append('config', config);
              
                return fd;
            })()
        });
        if (!resp.ok) throw new Error('Lưu thiết kế thất bại!');
    } catch (e) {
        alert(e.message);
        return;
    }
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = name_design + '.png';
    link.click();
}


window.clearCanvas = clearCanvas;
window.downloadCanvas = downloadCanvas;
window.deleteSelected = deleteSelected;
window.addCircle = addCircle;
window.addRect = addRect;
window.addLine = addLine;


