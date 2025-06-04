<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Thiết kế</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="{{asset('./css/template.css')}}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

</head>

<body>
    <!-- Topbar -->
    <div class="topbar">
        <div class="d-flex align-items-center gap-3">
            <strong><span class="name_design" ></span> - <span class="size_design"></span></strong>
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

        <div class="sidebar-canvas d-flex flex-column">
            <div class="sidebar-item" onclick="showPanel('dynamic')">
                <i class="bi bi-lightning-charge"></i>
                <span>Trường động</span>
            </div>
            <div class="sidebar-item" onclick="showPanel('text')">
                <i class="bi bi-type"></i>
                <span>Văn bản</span>
            </div>
            <div class="sidebar-item" onclick="showPanel('upload')">
                <i class="bi bi-cloud-arrow-up"></i>
                <span>Tải lên</span>
            </div>
            <div class="sidebar-item" onclick="showPanel('shape')">
                <i class="bi bi-square"></i>
                <span>Hình khối</span>
            </div>
            <div class="sidebar-item" onclick="showPanel('brand')">
                <i class="bi bi-award"></i>
                <span>Thương hiệu</span>
            </div>
            <div class="sidebar-item" onclick="showPanel('project')">
                <i class="bi bi-folder2"></i>
                <span>Dự án</span>
            </div>
        </div>

        <!-- Panel chi tiết -->
        <div id="panel-dynamic" class="sidebar-panel">
            <div class="panel-title"><i class="bi bi-lightning-charge"></i> Trường động</div>
            <div class="panel-group">
                <button class="btn btn-outline-primary w-100 d-flex align-items-center mb-2" onclick="addDynamicText('#{name}')">
                    <i class="bi bi-person me-2"></i> Tên
                </button>
                <button class="btn btn-outline-primary w-100 d-flex align-items-center mb-2" onclick="addDynamicText('#{code}')">
                    <i class="bi bi-upc-scan me-2"></i> Mã
                </button>
                <button class="btn btn-outline-primary w-100 d-flex align-items-center mb-2" onclick="addDynamicText('#{name} - #{code}')">
                    <i class="bi bi-card-text me-2"></i> Tên + Mã
                </button>
                <button class="btn btn-outline-primary w-100 d-flex align-items-center mb-2" onclick="addDynamicQR()">
                    <i class="bi bi-qr-code me-2"></i> QR code mã
                </button>
            </div>
        </div>
        <div id="panel-text" class="sidebar-panel">
            <div class="panel-title"><i class="bi bi-type"></i> Văn bản</div>
            <div class="panel-group">
                <button class="btn btn-outline-secondary w-100 d-flex align-items-center mb-2" onclick="addText()">
                    <i class="bi bi-type me-2"></i> Thêm Text thường
                </button>
            </div>
        </div>
        <div id="panel-upload" class="sidebar-panel">
            <div class="panel-title"><i class="bi bi-cloud-arrow-up"></i> Tải ảnh lên</div>
            <div class="panel-group">
                <button class="btn btn-outline-success w-100 d-flex align-items-center mb-2" onclick="document.getElementById('uploadImg').click()">
                    <i class="bi bi-cloud-arrow-up me-2"></i> Tải ảnh lên
                </button>
                <input type="file" id="uploadImg" accept="image/*" style="display:none">
            </div>
        </div>
        <div id="panel-shape" class="sidebar-panel">
            <div class="panel-title"><i class="bi bi-square"></i> Hình khối</div>
            <div class="panel-group">
                <button class="btn btn-outline-info w-100 d-flex align-items-center mb-2" onclick="addRect()">
                    <i class="bi bi-square me-2"></i> Hình chữ nhật
                </button>
                <button class="btn btn-outline-info w-100 d-flex align-items-center mb-2" onclick="addCircle()">
                    <i class="bi bi-circle me-2"></i> Hình tròn
                </button>
            </div>
        </div>
        <div id="panel-brand" class="sidebar-panel">
            <div class="panel-title"><i class="bi bi-award"></i> Thương hiệu</div>
            <div class="panel-group">
                <div class="text-muted">Chức năng này đang phát triển...</div>
            </div>
        </div>
        <div id="panel-project" class="sidebar-panel">
            <div class="panel-title"><i class="bi bi-folder2"></i> Dự án</div>
            <div class="panel-group">
                <div class="text-muted">Chức năng này đang phát triển...</div>
            </div>
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

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.2.4/fabric.min.js"></script>
    <script src="{{asset('./js/templates.js')}}"></script>

</body>

</html>