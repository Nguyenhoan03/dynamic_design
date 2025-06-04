<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Thiết kế</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="{{asset('./css/template.css')}}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
   
</head>

<body>
    <!-- Topbar -->
    <div class="topbar">
        <div class="d-flex align-items-center gap-3">
            <strong>Thiết kế không tên - 750px x 350px</strong>
            <button class="btn btn-sm btn-outline-light" onclick="changeCanvasSize()">Đổi cỡ</button>
        </div>
        <div class="tools">
            <button class="btn btn-sm btn-light" onclick="deleteSelected()">Xóa</button>
            <button class="btn btn-sm btn-light" onclick="flipSelected()">Lật</button>
            <button class="btn btn-sm btn-light" onclick="changeColor()">Màu</button>
            <button class="btn btn-sm btn-success" onclick="downloadCanvas()">Tải xuống</button>
        </div>
    </div>

    <div class="d-flex">
        <!-- Left sidebar -->
        <div class="left-sidebar">
            <a href="#" class="nav-link" onclick="addText()">Thêm Text</a>
            <a href="#" class="nav-link" onclick="addQRCode()">Thêm QR</a>
            <a href="#" class="nav-link" onclick="document.getElementById('uploadImg').click()">Tải ảnh lên</a>
            <input type="file" id="uploadImg" accept="image/*" style="display:none">
            <hr>
            <a href="#" class="nav-link">Thành phần</a>
            <a href="#" class="nav-link">Văn bản</a>
            <a href="#" class="nav-link">Thương hiệu</a>
            <a href="#" class="nav-link">Công cụ</a>
            <a href="#" class="nav-link">Dự án</a>
            <a href="#" class="nav-link">Ứng dụng</a>
        </div>

        <!-- Canvas area -->
        <div class="canvas-container">
            <div class="canvas-box" style="width:750px;height:350px;">

                <canvas id="templateCanvas" width="750" height="350" style="border:1px solid #ccc;"></canvas>
                <div id="objectToolbar" class="object-toolbar">
                    <button onclick="deleteSelected()" title="Xóa">&#128465;</button>
                    <button onclick="flipSelected()" title="Lật">&#8646;</button>
                    <button onclick="changeColor()" title="Đổi màu">&#127912;</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.2.4/fabric.min.js"></script>
    <script>
        // Khởi tạo canvas
        const canvas = new fabric.Canvas('templateCanvas', { backgroundColor: '#fff', preserveObjectStacking: true });

        // Undo/Redo stack
        let state = [], mods = 0, undoing = false, redoing = false;
        function saveState() {
            if (!undoing && !redoing) {
                state.push(JSON.stringify(canvas));
                mods = 0;
            }
        }
        canvas.on('object:added', saveState);
        canvas.on('object:modified', saveState);
        canvas.on('object:removed', saveState);

        function undo() {
            if (state.length > 1) {
                undoing = true;
                state.pop();
                canvas.loadFromJSON(state[state.length - 1], () => {
                    canvas.renderAll();
                    undoing = false;
                });
            }
        }
        function redo() {
            // Đơn giản: chỉ undo, không redo stack
            alert('Chức năng redo cần bổ sung stack riêng!');
        }

        // Thêm ảnh mẫu
        fabric.Image.fromURL('https://imagedelivery.net/ZeGtsGSjuQe1P3UP_zk3fQ/ede24b65-497e-4940-ea90-06cc2757a200/storedata', function(img) {
            img.set({ left: 10, top: 10, scaleX: 0.5, scaleY: 0.5 });
            canvas.add(img);
        });

        // Thêm text động
        function addText() {
            const text = new fabric.Textbox('Nhập nội dung', {
                left: 120, top: 60, fontSize: 22, fill: '#222', width: 200, fontFamily: 'Arial'
            });
            canvas.add(text).setActiveObject(text);
        }

        // Thêm QR code mẫu (chỉ là placeholder)
        function addQRCode() {
            const rect = new fabric.Rect({
                width: 70, height: 70, fill: '#eee', stroke: '#333', strokeWidth: 1
            });
            const label = new fabric.Text('QR: #{code}', {
                fontSize: 12, left: 10, top: 25, fill: '#333'
            });
            const group = new fabric.Group([rect, label], { left: 300, top: 120 });
            canvas.add(group).setActiveObject(group);
        }

        // Upload ảnh từ máy
        document.getElementById('uploadImg').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(f) {
                fabric.Image.fromURL(f.target.result, function(img) {
                    img.set({ left: 50, top: 50, scaleX: 0.5, scaleY: 0.5 });
                    canvas.add(img).setActiveObject(img);
                });
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        });

        // Xóa đối tượng đang chọn
        function deleteSelected() {
            const active = canvas.getActiveObject();
            if (active) canvas.remove(active);
        }

        // Lật đối tượng đang chọn
        function flipSelected() {
            const active = canvas.getActiveObject();
            if (active && active.type === 'image') {
                active.toggle('flipX');
                canvas.requestRenderAll();
            }
        }

        // Đổi màu đối tượng text
        function changeColor() {
            const active = canvas.getActiveObject();
            if (active && active.type === 'textbox') {
                active.set('fill', active.fill === 'red' ? '#222' : 'red');
                canvas.requestRenderAll();
            }
        }

        // Tải xuống thiết kế
        function downloadCanvas() {
            const dataURL = canvas.toDataURL({ format: 'png' });
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'thietke.png';
            link.click();
        }

        // Toolbar nổi khi chọn đối tượng
        const objectToolbar = document.getElementById('objectToolbar');
        canvas.on('selection:created', showToolbar);
        canvas.on('selection:updated', showToolbar);
        canvas.on('selection:cleared', () => objectToolbar.style.display = 'none');
        function showToolbar(e) {
            const obj = canvas.getActiveObject();
            if (!obj) return;
            const bound = obj.getBoundingRect();
            objectToolbar.style.display = 'flex';
            objectToolbar.style.left = (bound.left + bound.width / 2 - 40) + 'px';
            objectToolbar.style.top = (bound.top - 30) + 'px';
        }
        canvas.on('object:moving', showToolbar);
        canvas.on('object:scaling', showToolbar);

        // Đổi kích thước canvas
        function changeCanvasSize() {
            let w = prompt('Nhập chiều rộng (px):', canvas.width);
            let h = prompt('Nhập chiều cao (px):', canvas.height);
            if (w && h) {
                canvas.setWidth(Number(w));
                canvas.setHeight(Number(h));
                document.querySelector('.canvas-box').style.width = w + 'px';
                document.querySelector('.canvas-box').style.height = h + 'px';
            }
        }

        // Thêm hình chữ nhật
        function addRect() {
            const rect = new fabric.Rect({
                left: 150, top: 100, fill: '#00bcd4', width: 100, height: 60
            });
            canvas.add(rect).setActiveObject(rect);
        }

        // Thêm hình tròn
        function addCircle() {
            const circle = new fabric.Circle({
                left: 250, top: 120, fill: '#673ab7', radius: 40
            });
            canvas.add(circle).setActiveObject(circle);
        }

        // Copy/Paste đối tượng
        let clipboard = null;
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'c') {
                const active = canvas.getActiveObject();
                if (active) active.clone(function(cloned) { clipboard = cloned; });
            }
            if (e.ctrlKey && e.key === 'v' && clipboard) {
                clipboard.clone(function(clonedObj) {
                    canvas.discardActiveObject();
                    clonedObj.set({ left: clonedObj.left + 20, top: clonedObj.top + 20, evented: true });
                    if (clonedObj.type === 'activeSelection') {
                        clonedObj.canvas = canvas;
                        clonedObj.forEachObject(function(obj) { canvas.add(obj); });
                        clonedObj.setCoords();
                    } else {
                        canvas.add(clonedObj);
                    }
                    canvas.setActiveObject(clonedObj);
                    canvas.requestRenderAll();
                });
            }
            // Undo
            if (e.ctrlKey && e.key === 'z') undo();
        });

        // Group/Ungroup
        function groupSelected() {
            if (!canvas.getActiveObject()) return;
            if (canvas.getActiveObject().type !== 'activeSelection') return;
            canvas.getActiveObject().toGroup();
            canvas.requestRenderAll();
        }
        function ungroupSelected() {
            const obj = canvas.getActiveObject();
            if (obj && obj.type === 'group') {
                obj.toActiveSelection();
                canvas.requestRenderAll();
            }
        }

        // Khóa/Mở khóa đối tượng
        function lockSelected() {
            const obj = canvas.getActiveObject();
            if (obj) {
                obj.set({ selectable: false, evented: false, lockMovementX: true, lockMovementY: true });
                canvas.discardActiveObject();
                canvas.requestRenderAll();
            }
        }
        function unlockAll() {
            canvas.getObjects().forEach(obj => {
                obj.set({ selectable: true, evented: true, lockMovementX: false, lockMovementY: false });
            });
            canvas.requestRenderAll();
        }

        // Đổi font, cỡ, căn lề cho text
        function setFont(font) {
            const obj = canvas.getActiveObject();
            if (obj && obj.type === 'textbox') {
                obj.set('fontFamily', font);
                canvas.requestRenderAll();
            }
        }
        function setFontSize(size) {
            const obj = canvas.getActiveObject();
            if (obj && obj.type === 'textbox') {
                obj.set('fontSize', size);
                canvas.requestRenderAll();
            }
        }
        function setAlign(align) {
            const obj = canvas.getActiveObject();
            if (obj && obj.type === 'textbox') {
                obj.set('textAlign', align);
                canvas.requestRenderAll();
            }
        }

        // Đổi thứ tự lớp
        function bringToFront() {
            const obj = canvas.getActiveObject();
            if (obj) { canvas.bringToFront(obj); }
        }
        function sendToBack() {
            const obj = canvas.getActiveObject();
            if (obj) { canvas.sendToBack(obj); }
        }

        // Xóa tất cả
        function clearCanvas() {
            canvas.clear();
            canvas.setBackgroundColor('#fff', canvas.renderAll.bind(canvas));
        }

        // Zoom canvas
        function zoomIn() {
            canvas.setZoom(canvas.getZoom() * 1.1);
        }
        function zoomOut() {
            canvas.setZoom(canvas.getZoom() / 1.1);
        }
    </script>

    <!-- Thêm các nút chức năng mới vào thanh công cụ hoặc sidebar -->
    <div style="position:fixed;bottom:20px;left:140px;z-index:1000;">
        <button class="btn btn-sm btn-outline-primary" onclick="addRect()">Hình chữ nhật</button>
        <button class="btn btn-sm btn-outline-primary" onclick="addCircle()">Hình tròn</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="groupSelected()">Group</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="ungroupSelected()">Ungroup</button>
        <button class="btn btn-sm btn-outline-warning" onclick="lockSelected()">Khóa</button>
        <button class="btn btn-sm btn-outline-success" onclick="unlockAll()">Mở khóa</button>
        <button class="btn btn-sm btn-outline-info" onclick="bringToFront()">Lên trên</button>
        <button class="btn btn-sm btn-outline-info" onclick="sendToBack()">Xuống dưới</button>
        <button class="btn btn-sm btn-outline-danger" onclick="clearCanvas()">Xóa tất cả</button>
        <button class="btn btn-sm btn-outline-dark" onclick="zoomIn()">Zoom +</button>
        <button class="btn btn-sm btn-outline-dark" onclick="zoomOut()">Zoom -</button>
        <select onchange="setFont(this.value)">
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Courier New">Courier New</option>
        </select>
        <select onchange="setFontSize(this.value)">
            <option value="18">18</option>
            <option value="22" selected>22</option>
            <option value="28">28</option>
            <option value="36">36</option>
        </select>
        <select onchange="setAlign(this.value)">
            <option value="left">Trái</option>
            <option value="center">Giữa</option>
            <option value="right">Phải</option>
        </select>
        <button class="btn btn-sm btn-outline-secondary" onclick="undo()">Undo</button>
    </div>
</body>

</html>