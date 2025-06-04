<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Tạo thiết kế</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Bootstrap 5 CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            min-height: 100vh;
            display: flex;
        }
        .sidebar {
            width: 250px;
            background-color: #fff;
            border-right: 1px solid #dee2e6;
            padding: 20px;
        }
        .sidebar .nav-link.active {
            background-color: #eae6ff;
            font-weight: 500;
        }
        .content {
            flex: 1;
            padding: 40px;
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <div class="sidebar">
        <h4 class="fw-bold mb-4">Tạo thiết kế</h4>
        <ul class="nav flex-column">
            <li class="nav-item"><a class="nav-link" href="#">✨ Cho bạn</a></li>
            <li class="nav-item"><a class="nav-link" href="#">📄 Sheets</a></li>
            <li class="nav-item"><a class="nav-link active" href="#">📋 Docs</a></li>
            <li class="nav-item"><a class="nav-link" href="#">🟢 Whiteboard</a></li>
            <li class="nav-item"><a class="nav-link" href="#">📣 Thuyết trình</a></li>
            <li class="nav-item"><a class="nav-link" href="#">❤️ Mạng xã hội</a></li>
            <li class="nav-item"><a class="nav-link" href="#">📷 Ảnh</a></li>
            <li class="nav-item"><a class="nav-link" href="#">🎥 Video</a></li>
            <li class="nav-item"><a class="nav-link" href="#">🖨️ In ấn</a></li>
            <li class="nav-item"><a class="nav-link" href="#">🌐 Trang web</a></li>
            <li class="nav-item"><a class="nav-link active" href="#">🖼️ Cỡ tùy chỉnh</a></li>
            <li class="nav-item"><a class="nav-link" href="#">⬆️ Tải lên</a></li>
            <li class="nav-item"><a class="nav-link" href="#">⋯ Xem thêm</a></li>
        </ul>
    </div>

    <!-- Main content -->
    <div class="content">
        <h5 class="fw-semibold mb-4">Cỡ tùy chỉnh</h5>
        <form id="customSizeForm" class="row g-3 align-items-end">
            <div class="col-auto">
                <label for="width" class="form-label">Rộng</label>
                <input type="number" class="form-control" id="width" value="123">
            </div>
            <div class="col-auto">
                <label for="height" class="form-label">Cao</label>
                <input type="number" class="form-control" id="height" value="123">
            </div>
            <div class="col-auto">
                <label for="unit" class="form-label">Đơn vị</label>
                <select class="form-select" id="unit">
                    <option value="px" selected>px</option>
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                </select>
            </div>
            <div class="col-auto">
                <button type="submit" class="btn btn-primary">Tạo thiết kế mới</button>
            </div>
        </form>
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
            alert(`Đã tạo thiết kế mới với kích thước: ${width}x${height} ${unit}`);
        });
    </script>
</body>
</html>
