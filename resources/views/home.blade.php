<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Tạo thiết kế</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{asset('./css/home.css')}}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <!-- Bootstrap 5 CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>
    <!-- Sidebar -->
    <div class="sidebar">
        <h4 class="fw-bold mb-4">Tạo thiết kế</h4>
        <ul class="nav flex-column" id="sidebarMenu">
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <span class="sidebar-icon"><i class="fa-solid fa-wand-magic-sparkles text-warning"></i></span>Cho bạn
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <span class="sidebar-icon"><i class="fa-regular fa-file-excel" style="color:#7cb342"></i></span>Sheets
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <span class="sidebar-icon"><i class="fa-regular fa-file-lines text-primary"></i></span>Docs
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <span class="sidebar-icon"><i class="fa-solid fa-chalkboard" style="color:#22c55e"></i></span>Whiteboard
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <span class="sidebar-icon"><i class="fa-solid fa-bullhorn text-warning"></i></span>Thuyết trình
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <span class="sidebar-icon"><i class="fa-solid fa-heart" style="color:#ef4444"></i></span>Mạng xã hội
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <span class="sidebar-icon"><i class="fa-regular fa-image text-purple" style="color:#8b5cf6"></i></span>Ảnh
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <span class="sidebar-icon"><i class="fa-solid fa-video" style="color:#7c3aed"></i></span>Video
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <span class="sidebar-icon"><i class="fa-solid fa-print" style="color:#6d28d9"></i></span>In ấn
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <span class="sidebar-icon"><i class="fa-solid fa-globe" style="color:#0ea5e9"></i></span>Trang web
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link active" href="#">
                    <span class="sidebar-icon"><i class="fa-regular fa-image" style="color:#22d3ee"></i></span>Cỡ tùy chỉnh
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <span class="sidebar-icon"><i class="fa-solid fa-upload" style="color:#0ea5e9"></i></span>Tải lên
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <span class="sidebar-icon"><i class="fa-solid fa-ellipsis" style="color:#64748b"></i></span>Xem thêm
                </a>
            </li>
        </ul>
    </div>

    <!-- Main content -->
    <div class="content">
        <h5 class="fw-semibold mb-4 p-3">Cỡ tùy chỉnh</h5>
        <div class="custom-form-outer">
            <div class="custom-form-wrapper">
                <form id="customSizeForm" class="row g-4 align-items-end justify-content-center">
                    <div class="col-md-3">
                        <label for="width" class="form-label">Rộng</label>
                        <input type="number" class="form-control" id="width" value="500" min="1">
                    </div>
                    <div class="col-md-3">
                        <label for="height" class="form-label">Cao</label>
                        <input type="number" class="form-control" id="height" value="500" min="1">
                    </div>
                    <div class="col-md-3">
                        <label for="unit" class="form-label">Đơn vị</label>
                        <select class="form-select" id="unit">
                            <option value="px" selected>px</option>
                            <option value="cm">cm</option>
                            <option value="inch">inch</option>
                            <option value="mm">mm</option>
                        </select>
                    </div>
                    <div class="col-md-3 d-flex align-items-end ">
                        <button type="submit" class="btn btn-primary w-100">Tạo thiết kế mới</button>
                    </div>
                </form>
            </div>
        </div>

        <h5 class="fw-semibold mb-3 p-3">Các thiết kế đã lưu</h5>

        <form id="bulkDeleteForm" method="POST" action="{{ route('templates.bulkDelete') }}">
            @csrf
            @method('DELETE')
            <button type="submit" class="btn btn-danger mb-3" id="bulkDeleteBtn" disabled>
                <i class="bi bi-trash"></i> Xóa các bản đã chọn
            </button>
            <input type="hidden" name="ids" id="bulkDeleteIds">
        </form>

        <div class="row row-cols-1 row-cols-md-3 g-4 p-2">
            @foreach ($templates as $template)
            <div class="col">
                <div class="card h-100 shadow-sm border-0 position-relative">
                    <input type="checkbox" class="form-check-input position-absolute top-0 start-0 m-2 template-checkbox"
                        value="{{ $template->id }}" style="z-index:2; width: 20px; height: 20px;">
                    <div class="card-canvas-preview w-100"
                        style="height: 180px; background-size: cover; background-position: center;"
                        data-template-config='@json($template->config)'>
                        <!-- Có thể thêm ảnh preview nếu có -->
                    </div>
                    <button class="btn btn-light btn-sm position-absolute top-0 end-0 m-2" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                            <a href="{{ route('templates.edit', $template->id) }}" class="dropdown-item">
                                <i class="bi bi-eye me-1"></i> Xem chi tiết
                            </a>
                        </li>
                        <li>
                            <a href="{{ route('templates.copy', $template->id) }}" class="dropdown-item">
                                <i class="bi bi-files me-1"></i> Tạo bản sao
                            </a>
                        </li>
                        <li>
                            <a href="{{ route('templates.download', $template->id) }}" class="dropdown-item">
                                <i class="bi bi-download me-1"></i> Tải xuống
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="shareTemplate({{ $template->id }})" class="dropdown-item">
                                <i class="bi bi-share me-1"></i> Chia sẻ
                            </a>
                        </li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li>
                            <form action="{{ route('templates.destroy', $template->id) }}" method="POST" onsubmit="return confirm('Bạn chắc chắn muốn xóa?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="dropdown-item text-danger">
                                    <i class="bi bi-trash me-1"></i> Đưa vào thùng rác
                                </button>
                            </form>
                        </li>
                    </ul>
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0 text-primary fw-semibold">
                                {{ $template->name }}
                            </h5>
                            <span class="badge bg-secondary ms-2">
                                {{ $template->width }} x {{ $template->height }} {{$template->unit }}
                            </span>
                        </div>
                        <p class="card-text text-muted small mb-3">
                            Đã sửa: {{ $template->updated_at->timezone('Asia/Ho_Chi_Minh')->diffForHumans() }}
                        </p>
                        <a href="{{ route('templates.edit', $template->id) }}" class="btn btn-sm btn-primary w-100">
                            <i class="bi bi-eye me-1"></i> Xem chi tiết
                        </a>
                    </div>
                </div>
            </div>
            @endforeach
        </div>

    </div>
    </div>

    <!-- Bootstrap JS -->
        <script type="module" src="{{ asset('./js/canvas-editor/events.js') }}"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- JS -->

    <script>
        document.getElementById('customSizeForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const width = document.getElementById('width').value;
            const height = document.getElementById('height').value;
            const unit = document.getElementById('unit').value;
            const config = localStorage.getItem('canvas_design');
            const name = localStorage.getItem('canvas_design_name') || ('Mẫu_' + Math.random().toString(36).substr(2, 6));;
            if (config) {
                try {
                    await fetch('/templates/check-or-create', {
                        method: 'POST',
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            name: name,
                            width: width,
                            height: height,
                            config: config
                        })
                    });
                } catch (e) {
                    alert('Có lỗi khi lưu thiết kế cũ!');
                }
                // Xóa dữ liệu localStorage để tạo mới hoàn toàn
                localStorage.removeItem('canvas_design');
                localStorage.removeItem('canvas_design_name');
            }

            // Lưu thông số mới cho canvas trắng
            localStorage.setItem('canvas_design_width', width);
            localStorage.setItem('canvas_design_height', height);
            localStorage.setItem('canvas_design_unit', unit);

            console.log(width, height, unit);
            window.location.href = `/templates?width=${width}&height=${height}&unit=${unit}`;
        });
    </script>

    <script>
        // Xử lý active menu sidebar
        document.querySelectorAll('#sidebarMenu .nav-link').forEach(function(link) {
            link.addEventListener('click', function(e) {
                document.querySelectorAll('#sidebarMenu .nav-link').forEach(function(l) {
                    l.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
    </script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.2.4/fabric.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.card-canvas-preview').forEach(preview => {
                const config = JSON.parse(preview.getAttribute('data-template-config'));

                // Lấy kích thước thiết kế gốc từ config (nếu có)
                let designWidth = 500, designHeight = 300;
                if (config && config.width && config.height) {
                    designWidth = config.width;
                    designHeight = config.height;
                } else if (config && config.objects && config.objects.length) {
                    // fallback: lấy max right/bottom của các object
                    config.objects.forEach(obj => {
                        if (obj.left + (obj.width || 0) > designWidth) designWidth = obj.left + (obj.width || 0);
                        if (obj.top + (obj.height || 0) > designHeight) designHeight = obj.top + (obj.height || 0);
                    });
                }

                // Kích thước khung preview
                const previewW = preview.offsetWidth || 300;
                const previewH = 180; // hoặc lấy từ style

                // Tính tỉ lệ scale nhỏ nhất để fit cả chiều rộng và chiều cao
                const scale = Math.min(previewW / designWidth, previewH / designHeight);

                // Tạo canvas preview với kích thước khung preview
                const canvas = new fabric.StaticCanvas(null, {
                    width: previewW,
                    height: previewH,
                    backgroundColor: '#fff'
                });

                canvas.loadFromJSON(config, () => {
                    // Scale tất cả object cho vừa preview
                    canvas.getObjects().forEach(obj => {
                        obj.scaleX = (obj.scaleX || 1) * scale;
                        obj.scaleY = (obj.scaleY || 1) * scale;
                        obj.left = (obj.left || 0) * scale;
                        obj.top = (obj.top || 0) * scale;
                        obj.setCoords();
                    });
                    canvas.renderAll();

                    // Xuất ra ảnh preview
                    const dataURL = canvas.toDataURL({
                        format: 'jpeg',
                        quality: 0.8,
                        left: 0,
                        top: 0,
                        width: previewW,
                        height: previewH
                    });
                    preview.style.backgroundImage = `url('${dataURL}')`;
                });
            });
        });
    </script>

    <script>
        function shareTemplate(id) {
            fetch(`/templates/${id}/share`)
                .then(res => res.json())
                .then data => {
                    navigator.clipboard.writeText(data.url);
                    alert('Đã copy link chia sẻ: ' + data.url);
                });
        }
    </script>


    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const checkboxes = document.querySelectorAll('.template-checkbox');
            const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
            const bulkDeleteIds = document.getElementById('bulkDeleteIds');
            const bulkDeleteForm = document.getElementById('bulkDeleteForm');
            checkboxes.forEach(cb => cb.addEventListener('change', updateBulkDelete));

            function updateBulkDelete() {
                const checked = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
                bulkDeleteBtn.disabled = checked.length === 0;
                bulkDeleteIds.value = checked.join(',');
                bulkDeleteForm.style.display = checked.length > 0 ? 'flex' : 'none';
            }
        });
    </script>


</body>

</html>