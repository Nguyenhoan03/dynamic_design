function convertToPx(value, unit) {
    const factors = {
        mm: 3.7795275591,
        cm: 37.795275591,
        inch: 96,
        px: 1
    };
    return value * (factors[unit] || 1);
}

// Lấy width, height, unit từ URL hoặc server
const urlParams = new URLSearchParams(window.location.search);
const width = parseFloat(urlParams.get('width')) || 500;
const height = parseFloat(urlParams.get('height')) || 500;
const unit = urlParams.get('unit') || 'px';

const canvasWidth = convertToPx(width, unit);
const canvasHeight = convertToPx(height, unit);

window.defaultCanvasUnit = unit; // để updateCanvasInfo dùng đúng đơn vị

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

// document.getElementById('uploadImg')?.addEventListener('change', function (e) {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = function (f) {
//         fabric.Image.fromURL(f.target.result, function (img) {
//             img.set({
//                 left: 50,
//                 top: 50,
//                 scaleX: 0.5,
//                 scaleY: 0.5
//             });
//             window.canvas.add(img).setActiveObject(img);
//         }, { crossOrigin: 'Anonymous' }); 
//     };
//     reader.readAsDataURL(file);
//     e.target.value = '';
// });

document.getElementById('uploadFile')?.addEventListener('change', async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const canvas = window.canvas;

    // Ảnh
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (f) {
            fabric.Image.fromURL(f.target.result, function (img) {
                const scale = 0.5;
                img.set({
                    left: canvas.getWidth() / 2 - (img.width * scale) / 2,
                    top: canvas.getHeight() / 2 - (img.height * scale) / 2,
                    scaleX: scale,
                    scaleY: scale
                });
                canvas.add(img).setActiveObject(img);
                canvas.requestRenderAll();
            }, { crossOrigin: 'Anonymous' });
        };
        reader.readAsDataURL(file);
    }

    // PDF
    else if (file.type === 'application/pdf') {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async function (ev) {
            const typedarray = new Uint8Array(ev.target.result);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 2 });

            // KHÔNG set lại kích thước canvas, giữ nguyên canvas gốc
            // canvas.setWidth(viewport.width);
            // canvas.setHeight(viewport.height);

            // Tính tỉ lệ scale giữa PDF và canvas hiện tại
            const scaleX = canvas.getWidth() / viewport.width;
            const scaleY = canvas.getHeight() / viewport.height;

            // Chỉ add text từ PDF, scale lại vị trí và fontSize
            const textContent = await page.getTextContent();
            textContent.items.forEach(item => {
                const text = new fabric.Text(item.str, {
                    left: item.transform[4] * 2 * scaleX,
                    top: (viewport.height - item.transform[5]) * 2 * scaleY,
                    fontSize: Math.abs(item.transform[0]) * 2 * scaleY,
                    fill: '#000',
                    fontFamily: 'Arial',
                    selectable: true
                });
                canvas.add(text);
            });

            canvas.requestRenderAll();
        };
        reader.readAsArrayBuffer(file);
    }

    // Video
    else if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = url;
        video.autoplay = false;
        video.loop = true;
        video.controls = true;

        video.onloadeddata = function () {
            const maxWidth = canvas.getWidth() * 0.8;
            const maxHeight = canvas.getHeight() * 0.8;
            let scale = 1;
            if (video.videoWidth > maxWidth) scale = maxWidth / video.videoWidth;
            if (video.videoHeight * scale > maxHeight) scale = maxHeight / video.videoHeight;

            video.width = video.videoWidth;
            video.height = video.videoHeight;

            const fabricVideo = new fabric.Image(video, {
                left: (canvas.getWidth() - video.videoWidth * scale) / 2,
                top: (canvas.getHeight() - video.videoHeight * scale) / 2,
                scaleX: scale,
                scaleY: scale,
                selectable: true
            });

            canvas.add(fabricVideo).setActiveObject(fabricVideo);
            canvas.requestRenderAll();

            video.play();

            function renderLoop() {
                canvas.requestRenderAll();
                fabricVideo.set('dirty', true);
                requestAnimationFrame(renderLoop);
            }
            renderLoop();

            fabricVideo._element = video;
            window.lastVideoObject = fabricVideo;

            const btn = document.getElementById('videoControlBtn');
            canvas.on('mouse:over', function (opt) {
                const obj = opt.target;
                if (obj && obj._element && obj._element.tagName === 'VIDEO') {
                    const rect = canvas.getElement().getBoundingClientRect();
                    const vRect = obj.getBoundingRect();
                    btn.style.left = (rect.left + vRect.left + vRect.width / 2 - 28) + 'px';
                    btn.style.top = (rect.top + vRect.top + vRect.height / 2 - 28) + 'px';
                    btn.style.display = 'flex';
                    btn.innerHTML = obj._element.paused
                        ? '<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="none"/><polygon points="12,10 24,16 12,22" fill="#fff"/></svg>'
                        : '<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="none"/><rect x="11" y="10" width="4" height="12" rx="2" fill="#fff"/><rect x="17" y="10" width="4" height="12" rx="2" fill="#fff"/></svg>';
                    btn.onclick = function () {
                        if (obj._element.paused) {
                            obj._element.play();
                            btn.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="none"/><rect x="11" y="10" width="4" height="12" rx="2" fill="#fff"/><rect x="17" y="10" width="4" height="12" rx="2" fill="#fff"/></svg>';
                        } else {
                            obj._element.pause();
                            btn.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="none"/><polygon points="12,10 24,16 12,22" fill="#fff"/></svg>';
                        }
                    };
                }
            });

            let isHoveringBtn = false;
            btn.addEventListener('mouseenter', function () {
                isHoveringBtn = true;
                btn.style.display = 'flex';
            });
            btn.addEventListener('mouseleave', function () {
                isHoveringBtn = false;
                btn.style.display = 'none';
            });
            canvas.on('mouse:out', function (opt) {
                const obj = opt.target;
                if (obj && obj._element && obj._element.tagName === 'VIDEO') {
                    setTimeout(() => {
                        if (!isHoveringBtn) btn.style.display = 'none';
                    }, 10);
                }
            });
        };
    }

    // Audio
    else if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        fabric.Image.fromURL('https://cdn-icons-png.flaticon.com/512/727/727245.png', function (img) {
            img.set({ left: 100, top: 100, scaleX: 0.15, scaleY: 0.15, selectable: true });
            img.audioUrl = url;
            canvas.add(img).setActiveObject(img);
            canvas.requestRenderAll();
        });

        canvas.off('mouse:down.audio');
        canvas.on('mouse:down.audio', function (opt) {
            const obj = opt.target;
            if (obj && obj.audioUrl) {
                const audio = new Audio(obj.audioUrl);
                audio.play();
            }
        });
    }

    else {
        alert('Định dạng file không được hỗ trợ!');
    }
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

