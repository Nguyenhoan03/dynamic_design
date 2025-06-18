<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $template->name }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            margin: 0;
            padding: 0;
        }

        .template-container {
            position: relative;
            width: {{ $template->width }}px;
            height: {{ $template->height }}px;
            page-break-after: always;
            background: #fff;
            overflow: hidden;
        }

        .element {
            position: absolute;
        }

        img {
            display: block;
        }
    </style>
</head>

<body>
    @php
        $zoom = $zoom ?? 1;
        $viewport = $viewport ?? [1, 0, 0, 1, 0, 0];
        $offsetX = $viewport[4] ?? 0;
        $offsetY = $viewport[5] ?? 0;

        function applyTransform($val, $zoom, $offset) {
            return $val * $zoom + $offset;
        }

        function scaleSize($val, $scale, $zoom) {
            return $val * $scale * $zoom;
        }
    @endphp
@foreach ($rows as $data)
    <div class="template-container" style="position: relative;">
        @foreach ($template->elements as $el)
            @php
                $obj = is_array($el->data) ? $el->data : json_decode($el->data, true);
                $type = $el->type;
                $left = applyTransform($obj['left'] ?? 0, $zoom, $offsetX);
                $top = applyTransform($obj['top'] ?? 0, $zoom, $offsetY);
                $width = scaleSize(($obj['width'] ?? 100), ($obj['scaleX'] ?? 1), $zoom);
                $height = scaleSize(($obj['height'] ?? 100), ($obj['scaleY'] ?? 1), $zoom);
            @endphp

            @if ($type === 'image' && !empty($obj['src']))
                <img src="{{ $obj['src'] }}"
                     style="position: absolute; left: {{ $left }}px; top: {{ $top }}px; width: {{ $width }}px; height: {{ $height }}px;"
                     alt="Image">
            @elseif (in_array($type, ['text', 'dynamic', 'textbox']))
                @php
                    $text = $obj['text'] ?? '';
                    $text = preg_replace_callback('/#\{(.*?)\}/', fn($m) => $data[$m[1]] ?? $m[0], $text);
                    $fontSize = ($obj['fontSize'] ?? 16) * $zoom;
                @endphp
                <div style="position: absolute; left: {{ $left }}px; top: {{ $top }}px; font-size: {{ $fontSize }}px; color: {{ $obj['fill'] ?? '#000' }}; font-weight: {{ isset($obj['fontWeight']) && $obj['fontWeight'] === 'bold' ? 'bold' : 'normal' }};">
                    {{ $text }}
                </div>
            @elseif ($type === 'qr')
                @php
                    $qrField = isset($obj['variable']) ? preg_replace('/[#{\}]/', '', $obj['variable']) : null;
                    $qrImg = $qrField ? ($data['qr_image_base64_' . $qrField] ?? null) : null;
                @endphp
                @if ($qrImg)
                    <img src="{{ $qrImg }}"
                         style="position: absolute; left: {{ $left }}px; top: {{ $top }}px; width: {{ $width }}px; height: {{ $height }}px;"
                         alt="QR">
                @endif
            @endif
        @endforeach
    </div>
@endforeach
</body>

</html>
