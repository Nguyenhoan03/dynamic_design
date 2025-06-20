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
<div aria-live="polite" aria-atomic="true" class="position-fixed top-0 end-0 p-3" style="z-index: 9999; min-width: 320px;">
    <div class="toast align-items-center text-bg-danger border-0 show" id="errorToast" role="alert">
        <div class="d-flex">
            <div class="toast-body d-flex align-items-center">
                <span class="me-2" style="font-size: 1.5rem;">
                    <i class="bi bi-x-circle-fill text-white"></i>
                </span>
                {{ session('error') }}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Đóng"></button>
        </div>
        <div class="toast-progress bg-white" style="height: 4px; width: 100%;"></div>
    </div>
</div>
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
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <form id="printForm" method="POST" action="/print-batch" class="w-100">
            @csrf
            <!-- Hidden fields -->
            <input type="hidden" name="template_name" id="template_name">
            <input type="hidden" name="template_width" id="template_width">
            <input type="hidden" name="template_height" id="template_height">
            <input type="hidden" name="template_config" id="template_config">
            <input type="hidden" name="template_id" id="template_id">
            <input type="hidden" name="template_unit" id="template_unit">
            <input type="hidden" name="fields" id="fields">
            <input type="hidden" name="template_zoom" id="template_zoom">
            <input type="hidden" name="template_viewport" id="template_viewport">
            <input type="hidden" name="template_image" id="template_image">

            <!-- Preview Image (optional, can be shown if needed) -->
            <img id="canvasPreview" style="display: none; max-width: 100%; border-radius: 8px; margin-bottom: 10px;">

            <div class="modal-content shadow-sm border-0">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title fw-bold">📄 In hàng loạt</h5>
                    <button type="button" class="btn-close bg-white" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body p-4">
                    <input type="hidden" name="template_id" value="{{ $template->id ?? '' }}">
                    <label class="form-label fw-semibold mb-2">
                        Nhập dữ liệu (CSV): <span id="dynamic-fields-label" class="text-muted small">ten_qr, ten_text</span>
                    </label>

                    <textarea class="form-control border border-1 rounded-3 shadow-sm"
                              name="csv_rows"
                              rows="6"
                              placeholder="Ví dụ:&#10;Nguyễn Văn A,123456,https://example.com&#10;Trần Thị B,654321,Thông tin bất kỳ"></textarea>
                </div>

                <div class="modal-footer d-flex justify-content-end px-4 pb-4">
                    <button type="submit" class="btn btn-success px-4">
                        <i class="bi bi-printer-fill me-1"></i> In
                    </button>
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
                <span>Text, Qr</span>
            </div>
            <div class="sidebar-item" onclick="showPanel('upload')">
                <i class="bi bi-cloud-arrow-up"></i>
                <span>Tải lên</span>
            </div>
            <div class="sidebar-item" onclick="showPanel('shape')">
                <i class="bi bi-square"></i>
                <span>Hình khối</span>
            </div>
            <!-- <div class="sidebar-item" onclick="showPanel('brand')">
                <i class="bi bi-award"></i>
                <span>Thương hiệu</span>
            </div> -->

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
                <button id="addStaticQRBtn" class="btn btn-outline-primary w-100 mb-2">
                    <i class="bi bi-qr-code"></i> Tạo QR tĩnh
                </button>
                <div id="qr-temp" style="display:none"></div>
                 <input id="staticQRInput" type="text" class="form-control mt-2" placeholder="Nhập link hoặc text QR" style="display:none;">
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
        <!-- <div id="panel-brand" class="sidebar-panel">
            <div class="panel-title d-flex justify-content-between align-items-center">
                <span><i class="bi bi-award"></i> Thương hiệu</span>
                <button type="button" class="btn-close btn-sm" onclick="closePanel('brand')"></button>
            </div>
            <div class="panel-group">
                <div class="text-muted">Chức năng này đang phát triển...</div>
            </div>
        </div> -->
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
      <div class="canvas-scroll-wrapper">
        <div class="canvas-container">
            <div class="canvas-box" id="canvasBox">
                <canvas id="templateCanvas"></canvas>
                    <div id="objectToolbar" class="object-toolbar">
    <!-- Nút cơ bản -->
    <button id="editMainBtn" onclick="editMain()" title="Sửa" class="toolbar-btn">
        <i id="editMainIcon" class="bi"></i>
    </button>    <!-- <button onclick="addComment()" title="Bình luận" class="toolbar-btn"><i class="bi bi-chat-left-dots"></i></button> -->
    <button onclick="lockSelected()" title="Khóa" class="toolbar-btn"><i class="bi bi-lock"></i></button>
    <button onclick="duplicateSelected()" title="Paste" class="toolbar-btn"><i class="bi bi-files"></i></button>
    <button onclick="deleteSelected()" title="Xóa" class="toolbar-btn"><i class="bi bi-trash"></i></button>
    <!-- Nút ba chấm -->
    <div class="toolbar-menu-wrapper" style="display:inline-block;position:relative;">
        <button onclick="toggleToolbarMenu(event)" title="Thêm" class="toolbar-btn"><i class="bi bi-three-dots"></i></button>
        <ul id="toolbarMenu" class="toolbar-menu" style="display:none;">
            <li onclick="flipSelected()"><i class="bi bi-arrow-left-right"></i> Lật</li>
            <li onclick="bringToFront()"><i class="bi bi-layers"></i> Lên trên</li>
            <li onclick="sendToBack()"><i class="bi bi-layers-fill"></i> Xuống dưới</li>
            <li onclick="increaseSize()"><i class="bi bi-plus-square"></i> Tăng kích thước</li>
            <li onclick="decreaseSize()"><i class="bi bi-dash-square"></i> Giảm kích thước</li>
            <li onclick="rotateLeft()"><i class="bi bi-arrow-counterclockwise"></i> Xoay trái</li>
            <li onclick="rotateRight()"><i class="bi bi-arrow-clockwise"></i> Xoay phải</li>
            <li onclick="changeColor()" id="changeColorMenu" style="display:none;"><i class="bi bi-palette"></i> Đổi màu</li>
            <li onclick="changeImage()" id="changeImageMenu" style="display:none;"><i class="bi bi-image"></i> Đổi ảnh</li>
            <li onclick="changeQR()" id="editQRMenu" style="display:none;"><i class="bi bi-qr-code"></i> Sửa QR</li>
        </ul>
    </div>
</div>
                </div>
                <div id="canvasInfo" class="canvas-info canvas-info-bottom-center"></div>
            </div>
        </div>
 


   <div class="zoom-control">
    <label for="zoomRange">Zoom:</label>
    <input type="range" id="zoomRange" min="0.2" max="2" step="0.01" value="1">
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.2.4/fabric.min.js"></script>
    <script type="module" src="{{ asset('./js/canvas-editor/index.js') }}"></script>
    <script>
        document.querySelector('#printForm').addEventListener('submit', function(e) {
            const name_design = document.querySelector('.name_design').value;
            // const json = canvas.toJSON(['customType', 'variable']);
            const json = canvas.toJSON(['customType', 'variable', 'qrValue']);
            console.log(JSON.stringify(json),"hoanpppp");
            document.getElementById('template_name').value = name_design;
            document.getElementById('template_width').value = canvas.getWidth();
            document.getElementById('template_height').value = canvas.getHeight();
            document.getElementById('template_unit').value = window.defaultCanvasUnit || 'px';
            document.getElementById('template_config').value = JSON.stringify(json);
        });
    </script>
    <script>
    window.defaultCanvasWidth = {{ $width ?? 750 }};
    window.defaultCanvasHeight = {{ $height ?? 350 }};
    window.defaultCanvasUnit = "{{ $unit ?? 'px' }}" !== "" ? "{{ $unit ?? 'px' }}" : (localStorage.getItem('canvas_design_unit') || 'px');

</script>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
    // Hàm chuyển đổi đơn vị sang px
    function convertToPx(value, unit) {
        const factors = {
            mm: 3.7795275591,
            cm: 37.795275591,
            inch: 96,
            px: 1
        };
        return value * (factors[unit] || 1);
    }

    @if(isset($config) && $config)
        // Nếu vào edit, luôn lấy dữ liệu từ DB và xóa localStorage
        localStorage.removeItem('canvas_design');
        localStorage.removeItem('canvas_design_name');
        localStorage.removeItem('canvas_design_width');
        localStorage.removeItem('canvas_design_height');
        localStorage.removeItem('canvas_design_unit');

        // Lưu giá trị gốc để hiển thị info
        window.originWidth = {{ $width }};
        window.originHeight = {{ $height }};
        window.originUnit = "{{ $unit ?? 'px' }}";

        setTimeout(function() {
            let json = @json($config);
            if (typeof json === 'string') json = JSON.parse(json);
            if (window.canvas && json) {
                // Chuyển width/height sang px
                const pxW = convertToPx({{ $width }}, "{{ $unit ?? 'px' }}");
                const pxH = convertToPx({{ $height }}, "{{ $unit ?? 'px' }}");
                window.canvas.setWidth(pxW);
                window.canvas.setHeight(pxH);
                window.canvas.loadFromJSON(json, function() {
                    window.canvas.renderAll();
                });
                // Cập nhật box
                const box = document.getElementById('canvasBox');
                if (box) {
                    box.style.width = pxW + 'px';
                    box.style.height = pxH + 'px';
                }
            }
        }, 300);
    @else
        // Nếu không phải edit, ưu tiên lấy từ localStorage
        let width, height, unit;
        if (localStorage.getItem('canvas_design_width') && localStorage.getItem('canvas_design_unit')) {
            width = Number(localStorage.getItem('canvas_design_width'));
            height = Number(localStorage.getItem('canvas_design_height'));
            unit = localStorage.getItem('canvas_design_unit');
        } else {
            width = window.defaultCanvasWidth || 750;
            height = window.defaultCanvasHeight || 350;
            unit = window.defaultCanvasUnit || 'px';
        }
        window.originWidth = width;
        window.originHeight = height;
        window.originUnit = unit;

        const pxW = convertToPx(width, unit);
        const pxH = convertToPx(height, unit);

        const box = document.getElementById('canvasBox');
        if (box) {
            box.style.width = pxW + 'px';
            box.style.height = pxH + 'px';
        }
        const canvasEl = document.getElementById('templateCanvas');
        if (canvasEl) {
            canvasEl.width = pxW;
            canvasEl.height = pxH;
        }
        if (window.canvas) {
            window.canvas.setWidth(pxW);
            window.canvas.setHeight(pxH);
            // Load từ localStorage nếu có
            const saved = localStorage.getItem('canvas_design');
            if (saved) {
                window.canvas.loadFromJSON(saved, function() {
                    window.canvas.renderAll();
                });
            } else {
                window.canvas.renderAll();
            }
        }
    @endif
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
    
    <script>
document.addEventListener('DOMContentLoaded', function() {
    const zoomRange = document.getElementById('zoomRange');
    const canvasBox = document.getElementById('canvasBox');
    const wrapper = document.querySelector('.canvas-scroll-wrapper');

    function centerCanvasBox() {
        if (wrapper && canvasBox) {
            setTimeout(() => {
                const boxRect = canvasBox.getBoundingClientRect();
                const wrapperRect = wrapper.getBoundingClientRect();
                wrapper.scrollLeft = (canvasBox.offsetLeft + boxRect.width / 2) - wrapperRect.width / 2;
                wrapper.scrollTop = (canvasBox.offsetTop + boxRect.height / 2) - wrapperRect.height / 2;
            }, 100);
        }
    }

    // Căn giữa khi vào trang
    centerCanvasBox();

    // Zoom và căn giữa lại khi thay đổi zoom
    if (zoomRange && canvasBox) {
        zoomRange.addEventListener('input', function() {
            const scale = parseFloat(this.value);
            canvasBox.style.transform = `scale(${scale})`;
            canvasBox.style.transformOrigin = 'center center';
            centerCanvasBox();
        });
    }
});
</script>

    @if(session('error'))
<script>
    document.addEventListener('DOMContentLoaded', function () {
        var toastEl = document.getElementById('errorToast');
        var progress = toastEl.querySelector('.toast-progress');
        setTimeout(() => {
            progress.style.width = '0%';
        }, 10);
        setTimeout(() => {
            var toast = bootstrap.Toast.getOrCreateInstance(toastEl);
            toast.hide();
        }, 5000);
    });
</script>
@endif
 </script>

</body>
</html>