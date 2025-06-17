<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Thiết kế</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="{{asset('./css/template.css')}}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>

<body>
    @if(session('error'))
    <script>
        alert(@json(session('error')));
    </script>
    @endif
    <!-- Topbar -->
    <div class="topbar">
        <div class="d-flex align-items-center gap-3">
            <input type="text" placeholder="Nhập tên bản thiết kế" class="name_design"
                value="{{ $template->name ?? '' }}">
            <input type="hidden" id="template_id" value="{{ $template->id ?? '' }}">
            <span class="size_design"></span>

            <button class="d-none d-sm-block btn btn-sm btn-outline-light d-flex align-items-center gap-1" onclick="changeCanvasSize()">
                <i class="bi bi-arrows-angle-expand"></i> Đổi cỡ
            </button>
            <button class="d-none d-sm-block btn btn-sm btn-outline-light d-flex align-items-center gap-1" onclick="createNewDesign()">
                <i class="bi bi-plus-circle"></i> Tạo thiết kế mới
            </button>


        </div>

        <!-- Nút menu mobile -->
        <button id="topbarMenuBtn" class="btn btn-primary d-md-none" style="margin-left:auto;">
            <i class="bi bi-list"></i>
        </button>
        <!-- Các nút thao tác, ẩn trên mobile -->
        <div class="tools d-none d-md-flex">
           


            <button class="btn btn-sm btn-success d-flex align-items-center gap-1" onclick="SaveCanvas()">
                <i class="bi bi-download"></i>Lưu thiết kế
            </button>
            <button class="btn btn-sm btn-success d-flex align-items-center gap-1" onclick="downloadCanvas()">
                <i class="bi bi-download"></i>Tải xuống PNG
            </button>
            <button class="btn btn-sm btn-success d-flex align-items-center gap-1" onclick="openPrintModal()">
                <i class="bi bi-printer"></i> In hàng loạt
            </button>
        </div>
    </div>

    <!-- Offcanvas menu cho mobile -->
    <div id="topbarOffcanvas" class="topbar-offcanvas">
        <button class="btn-close" id="closeTopbarOffcanvas"></button>
        <div class="offcanvas-content">
            <button class="d-none d-sm-flex btn btn-sm btn-primary" onclick="changeCanvasSize()">
                <i class="bi bi-arrows-angle-expand"></i> Đổi cỡ
            </button>
            <button class="d-none d-sm-flex btn btn-sm btn-primary" onclick="createNewDesign()">
                <i class="bi bi-plus-circle"></i> Tạo thiết kế mới
            </button>


           
            <button class="btn btn-sm btn-success d-flex align-items-center gap-1" onclick="SaveCanvas()">
                <i class="bi bi-download"></i>Lưu thiết kế
            </button>
            <button class="btn btn-sm btn-success d-flex align-items-center gap-1" onclick="downloadCanvas()">
                <i class="bi bi-download"></i>Tải xuống PNG
            </button>
            <button class="btn btn-sm btn-success d-flex align-items-center gap-1" onclick="openPrintModal()">
                <i class="bi bi-printer"></i> In hàng loạt
            </button>
        </div>
    </div>


    <div class="modal fade" id="printModal" tabindex="-1">
        <div class="modal-dialog">
            <form id="printForm" method="POST" action="/print-batch">
                @csrf
                <input type="hidden" name="template_name" id="template_name">
                <input type="hidden" name="template_width" id="template_width">
                <input type="hidden" name="template_height" id="template_height">
                <input type="hidden" name="template_config" id="template_config">
                <input type="hidden" name="template_id" id="template_id">
                <input type="hidden" name="fields" id="fields">

                <input type="hidden" name="template_zoom" id="template_zoom">
<input type="hidden" name="template_viewport" id="template_viewport">



                <!-- Thêm input ẩn để chứa ảnh canvas -->
                <input type="hidden" name="template_image" id="template_image">
                <img id="canvasPreview" style="display: none; max-width: 100%;">

                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">In hàng loạt</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" name="template_id" value="{{ $template->id ?? '' }}">
                        <label class="form-label">
                            Dán dữ liệu (CSV: <span id="dynamic-fields-label">...</span>):
                        </label>
                        <textarea class="form-control" name="csv_rows" rows="6" placeholder="Nguyễn Văn A,123456,https://example.com&#10;Trần Thị B,654321,Thông tin bất kỳ"></textarea>
                       
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-success">In</button>
                    </div>
                </div>
            </form>
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

            <div class="sidebar-item" onclick="showPanel('ingredient')">
                <i class="bi bi-award"></i>
                <span>Thành phần</span>
            </div>
            <div class="sidebar-item" onclick="showPanel('tools')">
                <i class="bi bi-tools"></i>
                <span>Công cụ</span>
            </div>
            <div class="sidebar-item" onclick="showPanel('other')">
                <i class="bi bi-grid"></i>
                <span>Khác</span>
            </div>
        </div>


        <!-- Panel chi tiết -->
        <div id="panel-dynamic" class="sidebar-panel">
            <div class="panel-title d-flex justify-content-between align-items-center">
                <span><i class="bi bi-lightning-charge"></i> Trường động</span>
                <button type="button" class="btn-close btn-sm" onclick="closePanel('dynamic')"></button>
            </div>
            <div class="panel-group">

                <button class="btn btn-outline-primary w-100 d-flex align-items-center mb-2" onclick="promptDynamicField()">
                    <i class="bi bi-plus-circle me-2"></i> Thêm trường động
                </button>
                <button class="btn btn-outline-primary w-100 d-flex align-items-center mb-2" onclick="addDynamicQR()">
                    <i class="bi bi-qr-code me-2"></i> Thêm QR động
                </button>
                <button id="addStaticQRBtn" class="btn btn-outline-primary w-100 mb-2">
                    <i class="bi bi-qr-code"></i> Thêm QR tĩnh
                </button>
            </div>
        </div>
        <div id="panel-text" class="sidebar-panel">
            <div class="panel-title d-flex justify-content-between align-items-center">
                <span><i class="bi bi-type"></i> Văn bản</span>
                <button type="button" class="btn-close btn-sm" onclick="closePanel('text')"></button>
            </div>
            <div class="panel-group">
                <button class="btn btn-outline-secondary w-100 d-flex align-items-center mb-2" onclick="addText()">
                    <i class="bi bi-type me-2"></i> Thêm Text thường
                </button>
            </div>
        </div>
        <div id="panel-upload" class="sidebar-panel">
            <div class="panel-title d-flex justify-content-between align-items-center">
                <span><i class="bi bi-cloud-arrow-up"></i> Tải ảnh lên</span>
                <button type="button" class="btn-close btn-sm" onclick="closePanel('upload')"></button>
            </div>
            <div class="panel-group">
                <button class="btn btn-outline-success w-100 d-flex align-items-center mb-2" onclick="document.getElementById('uploadImg').click()">
                    <i class="bi bi-cloud-arrow-up me-2"></i> Tải ảnh lên
                </button>
                <input type="file" id="uploadImg" accept="image/*" style="display:none">
            </div>
        </div>
        <div id="panel-shape" class="sidebar-panel">
            <div class="panel-title d-flex justify-content-between align-items-center">
                <span><i class="bi bi-square"></i> Hình khối</span>
                <button type="button" class="btn-close btn-sm" onclick="closePanel('shape')"></button>
            </div>
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
            <div class="panel-title d-flex justify-content-between align-items-center">
                <span><i class="bi bi-award"></i> Thương hiệu</span>
                <button type="button" class="btn-close btn-sm" onclick="closePanel('brand')"></button>
            </div>
            <div class="panel-group">
                <div class="text-muted">Chức năng này đang phát triển...</div>
            </div>
        </div>
        <div id="panel-ingredient" class="sidebar-panel">
            <div class="panel-title d-flex justify-content-between align-items-center">
                <span><i class="bi bi-award"></i> Thành phần</span>
                <button type="button" class="btn-close btn-sm" onclick="closePanel('ingredient')"></button>
            </div>
            <div class="panel-group">
                <input class="form-control mb-2" placeholder="Tìm kiếm thành phần...">
                <div>
                    <div class="fw-bold mb-1">Hình dạng</div>
                    <button class="btn btn-outline-dark btn-sm mb-1" onclick="addRect()">■ Vuông</button>
                    <button class="btn btn-outline-dark btn-sm mb-1" onclick="addCircle()">● Tròn</button>
                    <button class="btn btn-outline-dark btn-sm mb-1" onclick="addLine()">━ Line</button>
                </div>
                <div class="mt-2">
                    <div class="fw-bold mb-1">Đồ họa</div>
                    <button class="btn btn-outline-dark btn-sm mb-1" onclick="addIcon('trophy')"><i class="bi bi-trophy"></i> Cúp</button>
                    <button class="btn btn-outline-dark btn-sm mb-1" onclick="addIcon('globe')"><i class="bi bi-globe"></i> Địa cầu</button>
                </div>
            </div>
        </div>
        <div id="panel-tools" class="sidebar-panel">
            <div class="panel-title d-flex justify-content-between align-items-center">
                <span><i class="bi bi-tools"></i> Công cụ</span>
                <button type="button" class="btn-close btn-sm" onclick="closePanel('tools')"></button>
            </div>
            <div class="vertical-toolbar">
                <button class="tool-btn" title="Chọn" onclick="selectTool('select')">
                    <i class="bi bi-cursor"></i>
                </button>
                <button class="tool-btn" title="Vẽ tự do" onclick="selectTool('draw')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="tool-btn" title="Vẽ đường thẳng" onclick="addLine()">
                    <i class="bi bi-slash-lg"></i>
                </button>

            </div>
        </div>
        <!-- Canvas area -->

        <div class="canvas-container" style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div class="canvas-box" id="canvasBox">
                <canvas id="templateCanvas"></canvas>
              <div id="objectToolbar" class="object-toolbar">
                <button onclick="deleteSelected()" title="Xóa">&#128465;</button>
                <button onclick="flipSelected()" title="Lật">&#8646;</button>
                <button onclick="changeColor()" title="Đổi màu">&#127912;</button>
                <button id="changeImageBtn" onclick="changeImage()" title="Đổi ảnh" style="display:none;">🖼️</button>
            </div>
            </div>
            <div id="canvasInfo" class="canvas-info canvas-info-bottom-center"></div>
        </div>
    </div>


    <!-- Nút mở sidebar cho mobile/tablet (hiện cả tablet) -->
    <button id="toggleRightSidebar" class="btn btn-primary">
        <i class="bi bi-list"></i> Menu
    </button>

    <!-- Sidebar chức năng bên phải -->
    <div id="rightSidebar" class="right-sidebar">
        <button class="btn-close" id="closeRightSidebar" style="position:absolute;top:10px;right:10px;display:none;"></button>
        <div class="sidebar-content">
            <!-- <button class="btn btn-sm btn-outline-primary" onclick="addRect()">Hình chữ nhật</button>
<button class="btn btn-sm btn-outline-primary" onclick="addCircle()">Hình tròn</button> -->
            <button class="btn btn-sm btn-outline-secondary" onclick="groupSelected()">Group</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="ungroupSelected()">Ungroup</button>
            <button class="btn btn-sm btn-outline-warning" onclick="lockSelected()">Khóa</button>
            <button class="btn btn-sm btn-outline-success" onclick="unlockAll()">Mở khóa</button>
            <button class="btn btn-sm btn-outline-info" onclick="bringToFront()">Nổi lên</button>
            <button class="btn btn-sm btn-outline-info" onclick="sendToBack()">Ẩn dưới</button>
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
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="16">16</option>
                <option value="18">18</option>
                <option value="20">20</option>
                <option value="22" selected>22</option>
                <option value="26">26</option>
                <option value="28">28</option>
                <option value="36">36</option>
            </select>
            <select onchange="setAlign(this.value)">
                <option value="left">Trái</option>
                <option value="center">Giữa</option>
                <option value="right">Phải</option>
            </select>
            <button class="btn btn-sm btn-outline-secondary" onclick="undo()">Undo</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="redo()">Redo</button>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.2.4/fabric.min.js"></script>
    <script type="module" src="{{ asset('./js/canvas-editor/index.js') }}"></script>

    <script>
        document.querySelector('#printForm').addEventListener('submit', function(e) {
            const name_design = document.querySelector('.name_design').value;
            const json = canvas.toJSON(['customType', 'variable']);
            document.getElementById('template_name').value = name_design;
            document.getElementById('template_width').value = canvas.getWidth();
            document.getElementById('template_height').value = canvas.getHeight();
            document.getElementById('template_config').value = JSON.stringify(json);
        });
    </script>
    <script>
    window.defaultCanvasWidth = {{ $width ?? 750 }};
    window.defaultCanvasHeight = {{ $height ?? 350 }};
    window.defaultCanvasUnit = "{{ $unit ?? 'px' }}";
</script>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Nếu vừa vào edit, luôn load từ DB và xóa localStorage
            @if(isset($config) && $config)
            localStorage.removeItem('canvas_design');
            localStorage.removeItem('canvas_design_name');
            localStorage.removeItem('canvas_design_width');
            localStorage.removeItem('canvas_design_height');
            setTimeout(function() {
            try {
                let json = @json($config);
                if (typeof json === 'string') json = JSON.parse(json);
                if (window.canvas && json) {
                    window.canvas.loadFromJSON(json, function() {
                        // Set lại kích thước canvas theo backend
                        window.canvas.setWidth({{ $width }});
                        window.canvas.setHeight({{ $height }});
                        // Set lại kích thước box chứa canvas nếu có
                        const box = document.getElementById('canvasBox');
                        if (box) {
                            box.style.width = '{{ $width }}px';
                            box.style.height = '{{ $height }}px';
                        }
                        window.canvas.renderAll();
                    });
                }
            } catch (e) {
                console.error('Lỗi load config:', e);
            }
        }, 300);
            @else
            // Nếu không phải edit (hoặc sau khi đã thao tác), ưu tiên load từ localStorage
            const saved = localStorage.getItem('canvas_design');
            if (saved) {
                window.canvas.loadFromJSON(saved, function() {
                    window.canvas.renderAll();
                });
            }
            @endif
        });

        // Khi có thao tác trên canvas thì lưu vào localStorage
        if (window.canvas) {
            window.canvas.on('object:added', saveCanvasToLocal);
            window.canvas.on('object:modified', saveCanvasToLocal);
            window.canvas.on('object:removed', saveCanvasToLocal);
        }

        function saveCanvasToLocal() {
            const json = window.canvas.toJSON(['customType', 'variable']);
            const name_design = document.querySelector('.name_design')?.value || '';
            localStorage.setItem('canvas_design', JSON.stringify(json));
            localStorage.setItem('canvas_design_name', name_design);
            localStorage.setItem('canvas_design_width', window.canvas.getWidth());
            localStorage.setItem('canvas_design_height', window.canvas.getHeight());
        }

        // Khi người dùng reload hoặc thoát trang, tự động gọi SaveCanvas để update lên server
        window.addEventListener('beforeunload', function(e) {
            if (typeof SaveCanvas === 'function') {
                SaveCanvas(true);
            }
        });
    </script>


  


    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const sidebar = document.getElementById('rightSidebar');
            const toggleBtn = document.getElementById('toggleRightSidebar');
            const closeBtn = document.getElementById('closeRightSidebar');
            if (toggleBtn && sidebar) {
                toggleBtn.addEventListener('click', function() {
                    sidebar.classList.add('active');
                });
            }
            if (closeBtn && sidebar) {
                closeBtn.addEventListener('click', function() {
                    sidebar.classList.remove('active');
                });
            }
            document.addEventListener('click', function(e) {
                if (window.innerWidth < 1200 && sidebar.classList.contains('active')) {
                    if (!sidebar.contains(e.target) && e.target !== toggleBtn) {
                        sidebar.classList.remove('active');
                    }
                }
            });
        });
    </script>

    <script>
        document.getElementById('topbarMenuBtn').onclick = function() {
            document.getElementById('topbarOffcanvas').classList.add('active');
        };
        document.getElementById('closeTopbarOffcanvas').onclick = function() {
            document.getElementById('topbarOffcanvas').classList.remove('active');
        };
    </script>

    <script>
        document.getElementById('toggleLeftSidebar').onclick = function() {
            document.getElementById('leftSidebar').classList.toggle('active');
        };
    </script>


</body>

</html>