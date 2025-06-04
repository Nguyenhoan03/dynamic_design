


<div class="container">
    <h2>Tạo Template In Thẻ</h2>
    <form id="templateForm" method="POST" action="{{ url('/templates') }}">
        @csrf

        <div class="mb-3">
            <label>Tên template:</label>
            <input type="text" name="name" class="form-control" required>
        </div>

        <div class="row mb-3">
            <div class="col">
                <label>Chiều rộng (mm):</label>
                <input type="number" name="width" class="form-control" required>
            </div>
            <div class="col">
                <label>Chiều cao (mm):</label>
                <input type="number" name="height" class="form-control" required>
            </div>
        </div>

        <div>
            <button type="button" onclick="addText()">Thêm Text</button>
            <button type="button" onclick="addQRCode()">Thêm QR</button>
        </div>

        <canvas id="templateCanvas" width="600" height="400" style="border:1px solid #ccc; margin-top:10px;"></canvas>

        <input type="hidden" name="elements" id="elementsInput">

        <button type="submit" class="btn btn-primary mt-3">Lưu Template</button>
    </form>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.2.4/fabric.min.js"></script>
<script>
    const canvas = new fabric.Canvas('templateCanvas');

    function addText() {
        const text = new fabric.Text('#{name}', {
            left: 50,
            top: 50,
            fontSize: 16,
            fill: 'black'
        });
        canvas.add(text);
    }

    function addQRCode() {
        const rect = new fabric.Rect({
            width: 60,
            height: 60,
            left: 100,
            top: 100,
            fill: '#ccc',
            stroke: 'black',
            strokeWidth: 1
        });
        const label = new fabric.Text('#{code}', {
            left: 105,
            top: 105,
            fontSize: 10,
            fill: 'black'
        });
        const group = new fabric.Group([rect, label], { left: 100, top: 100 });
        group.set('type', 'qrcode');
        canvas.add(group);
    }

    document.getElementById('templateForm').addEventListener('submit', function (e) {
        const elements = [];
        canvas.getObjects().forEach(obj => {
            if (obj.type === 'text') {
                elements.push({
                    type: 'text',
                    content: obj.text,
                    x: obj.left,
                    y: obj.top,
                    font_size: obj.fontSize,
                    style: {}
                });
            } else if (obj.type === 'group') {
                const text = obj._objects.find(o => o.type === 'text');
                elements.push({
                    type: 'qrcode',
                    content: text ? text.text : '#{code}',
                    x: obj.left,
                    y: obj.top,
                    size: 60,
                    style: {}
                });
            }
        });

        document.getElementById('elementsInput').value = JSON.stringify(elements);
    });
</script>
