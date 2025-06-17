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
    @foreach ($rows as $data)
        <div class="template-container">
            @foreach ($template->elements as $el)
                @php
                    $obj = is_array($el->data) ? $el->data : json_decode($el->data, true);
                    $type = $el->type;
                @endphp

                @if (in_array($type, ['text', 'dynamic', 'textbox']))
                    @php
                        $text = $obj['text'] ?? '';
                        $text = preg_replace_callback('/#\{(.*?)\}/', fn($m) => $data[$m[1]] ?? $m[0], $text);
                    @endphp
                    <div class="element"
                        style="
                            left: {{ $obj['left'] ?? 0 }}px;
                            top: {{ $obj['top'] ?? 0 }}px;
                            font-size: {{ $obj['fontSize'] ?? 16 }}px;
                            color: {{ $obj['fill'] ?? '#000' }};
                            font-weight: {{ isset($obj['fontWeight']) && $obj['fontWeight'] === 'bold' ? 'bold' : 'normal' }};
                        ">
                        {{ $text }}
                    </div>

                @elseif ($type === 'qr')
                    @php
                        $qrField = isset($obj['variable']) ? preg_replace('/[#{\}]/', '', $obj['variable']) : null;
                        $qrImg = $qrField ? ($data['qr_image_base64_' . $qrField] ?? null) : null;
                        $scaleX = $obj['scaleX'] ?? 1;
                        $scaleY = $obj['scaleY'] ?? 1;
                        $qrWidth = ($obj['width'] ?? 100) * $scaleX;
                        $qrHeight = ($obj['height'] ?? 100) * $scaleY;
                    @endphp
                    @if ($qrImg)
                        <div class="element"
                            style="left: {{ $obj['left'] ?? 0 }}px; top: {{ $obj['top'] ?? 0 }}px;">
                            <img src="{{ $qrImg }}"
                                width="{{ $qrWidth }}"
                                height="{{ $qrHeight }}"
                                alt="QR Code">
                        </div>
                    @endif

                @elseif ($type === 'image' && !empty($obj['src']))
                    @php
                        $scaleX = $obj['scaleX'] ?? 1;
                        $scaleY = $obj['scaleY'] ?? 1;
                        $imgWidth = ($obj['width'] ?? 100) * $scaleX;
                        $imgHeight = ($obj['height'] ?? 100) * $scaleY;
                    @endphp
                    <div class="element"
                        style="left: {{ $obj['left'] ?? 0 }}px; top: {{ $obj['top'] ?? 0 }}px;">
                        <img src="{{ $obj['src'] }}"
                            style="width: {{ $imgWidth }}px; height: {{ $imgHeight }}px;" alt="Image">
                    </div>

                @elseif ($type === 'rect')
                    <div class="element"
                        style="
                            left: {{ $obj['left'] ?? 0 }}px;
                            top: {{ $obj['top'] ?? 0 }}px;
                            width: {{ ($obj['width'] ?? 100) * ($obj['scaleX'] ?? 1) }}px;
                            height: {{ ($obj['height'] ?? 100) * ($obj['scaleY'] ?? 1) }}px;
                            background: {{ $obj['fill'] ?? '#000' }};
                        ">
                    </div>

                @elseif ($type === 'circle')
                    @php
                        $radius = $obj['radius'] ?? 50;
                        $diameter = $radius * 2;
                    @endphp
                    <div class="element"
                        style="
                            left: {{ $obj['left'] ?? 0 }}px;
                            top: {{ $obj['top'] ?? 0 }}px;
                            width: {{ $diameter * ($obj['scaleX'] ?? 1) }}px;
                            height: {{ $diameter * ($obj['scaleY'] ?? 1) }}px;
                            border-radius: 50%;
                            background: {{ $obj['fill'] ?? '#000' }};
                        ">
                    </div>

                @elseif ($type === 'triangle')
                    <div class="element"
                        style="
                            left: {{ $obj['left'] ?? 0 }}px;
                            top: {{ $obj['top'] ?? 0 }}px;
                            width: 0;
                            height: 0;
                            border-left: {{ ($obj['width'] ?? 100) / 2 }}px solid transparent;
                            border-right: {{ ($obj['width'] ?? 100) / 2 }}px solid transparent;
                            border-bottom: {{ $obj['height'] ?? 100 }}px solid {{ $obj['fill'] ?? '#000' }};
                        ">
                    </div>

                @elseif ($type === 'line')
                    <div class="element"
                        style="
                            left: {{ $obj['left'] ?? 0 }}px;
                            top: {{ $obj['top'] ?? 0 }}px;
                            width: {{ $obj['width'] ?? 100 }}px;
                            height: 0;
                            border-top: {{ $obj['strokeWidth'] ?? 2 }}px solid {{ $obj['stroke'] ?? '#000' }};
                        ">
                    </div>
                @endif
            @endforeach
        </div>
    @endforeach
</body>

</html>
