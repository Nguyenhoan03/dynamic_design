<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Tạo thiết kế</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <!-- Bootstrap 5 CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            min-height: 100vh;
            display: flex;
            font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
            background: #f8f9fb;
        }

        .sidebar {
            width: 250px;
            background: #fff;
            border-right: 1px solid #e4e6ef;
            padding: 28px 18px 18px 18px;
            min-height: 100vh;
            box-shadow: 2px 0 8px rgba(60, 60, 60, 0.03);
        }


        .sidebar h4 {
            font-weight: 700;
            font-size: 1.5rem;
            margin-bottom: 2.5rem;
            letter-spacing: -1px;
        }

        .sidebar .nav-link {
            color: #2563eb;
            font-weight: 500;
            border-radius: 8px;

            margin-bottom: 4px;
            transition: background 0.15s, color 0.15s;
            font-size: 1.08rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .sidebar .nav-link.active {
            background: #e0e7ff;
            color: #1d4ed8;
            font-weight: 700;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.07);
        }

        .sidebar .nav-link:hover:not(.active) {
            background: #f1f5f9;
            color: #1e293b;
        }

        /* .sidebar .nav-item {
            margin-bottom: 2px;
        } */
        .sidebar .nav-link svg {
            margin-right: 8px;
        }

        @media (max-width: 768px) {
            .sidebar {
                width: 100vw;
                min-height: unset;
                border-right: none;
                border-bottom: 1px solid #e4e6ef;
                box-shadow: none;
                padding: 18px 8px;
            }
        }

        .custom-form-outer {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 40px;
        }

        .custom-form-wrapper {
            /* background: #fff; */
            border-radius: 24px;
            /* box-shadow: 0 6px 32px rgba(37, 99, 235, 0.10); */
            padding: 25px;
            width: 100%;
            max-width: 950px;
            margin: 0 auto;
        }

        .custom-form-wrapper .form-label {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
        }

        .custom-form-wrapper .form-control,
        .custom-form-wrapper .form-select {
            min-width: 180px;
            font-size: 1.12rem;
            border-radius: 12px;
            /* padding: 12px 16px; */
            border: 1.5px solid #e4e6ef;
            background: #f8fafc;
            transition: border-color 0.2s;
        }

        .custom-form-wrapper .form-control:focus,
        .custom-form-wrapper .form-select:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 2px #e0e7ff;
            background: #fff;
        }

        .custom-form-wrapper .btn-primary {
            font-weight: 700;
            font-size: 1rem;
            border-radius: 12px;
            height: 40px;
            background: linear-gradient(90deg, #2563eb 60%, #1d4ed8 100%);
            border: none;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.10);
            transition: background 0.2s, box-shadow 0.2s;
        }

        .custom-form-wrapper .btn-primary:hover {
            background: linear-gradient(90deg, #1d4ed8 60%, #2563eb 100%);
            box-shadow: 0 4px 16px rgba(37, 99, 235, 0.13);
        }

        @media (max-width: 900px) {
            .custom-form-wrapper {
                padding: 18px 8px;
            }

            .custom-form-wrapper .form-control,
            .custom-form-wrapper .form-select {
                min-width: 120px;
            }
        }
    </style>
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
                        <input type="number" class="form-control" id="width" value="123" min="1">
                    </div>
                    <div class="col-md-3">
                        <label for="height" class="form-label">Cao</label>
                        <input type="number" class="form-control" id="height" value="123" min="1">
                    </div>
                    <div class="col-md-3">
                        <label for="unit" class="form-label">Đơn vị</label>
                        <select class="form-select" id="unit">
                            <option value="px" selected>px</option>
                            <option value="cm">cm</option>
                            <option value="in">in</option>
                        </select>
                    </div>
                    <div class="col-md-3 d-flex align-items-end ">
                        <button type="submit" class="btn btn-primary w-100">Tạo thiết kế mới</button>
                    </div>
                </form>
            </div>
        </div>

        <h5 class="fw-semibold mb-3 p-3">Các thiết kế đã lưu</h5>
        <div class="row row-cols-1 row-cols-md-3 g-4 p-2">
            @foreach ($templates as $template)
            <div class="col">
                <div class="card h-100 shadow-sm">

                    <div class="card-canvas-preview w-100" style="height: 180px; background-size: cover; background-position: center;" data-template-config='@json($template->config)'></div>


                    <div class="card-body">
                        <h6 class="card-title">{{$template->name}}</h6>
                        <p class="card-text mb-1">
                            <span class="badge bg-secondary">{{$template->width}}x{{$template->height}} px</span>
                        </p>
                        <p class="card-text text-muted small">
                            Tạo lúc: {{$template->updated_at->format("d/m/Y")}}
                        </p>
                        <a href="/templates/edit/{{$template->name}}" class="btn btn-outline-primary btn-sm">Xem</a>
                    </div>
                </div>
            </div>
            @endforeach
        </div>

    </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- JS thuần -->
    <script>
        document.getElementById('customSizeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const width = document.getElementById('width').value;
            const height = document.getElementById('height').value;
            const unit = document.getElementById('unit').value;
            // alert(`Đã tạo thiết kế mới với kích thước: ${width}x${height} ${unit}`);
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
                // Nếu muốn chuyển trang thì bỏ comment dòng dưới
                // e.preventDefault();
            });
        });
    </script>



    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.2.4/fabric.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.card-canvas-preview').forEach(preview => {
                const config = JSON.parse(preview.getAttribute('data-template-config'));
                const canvas = new fabric.StaticCanvas(null, {
                    width: 500,
                    height: 300
                });

                canvas.loadFromJSON(config, () => {
                    canvas.renderAll();
                    const dataURL = canvas.toDataURL({
                        format: 'jpeg',
                        quality: 0.8
                    });
                    preview.style.backgroundImage = `url('${dataURL}')`;
                });
            });
        });
    </script>




</body>

</html>