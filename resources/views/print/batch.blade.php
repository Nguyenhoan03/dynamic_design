<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $template->name }}</title>
    <style>
        body {
            font-family: 'Roboto', sans-serif;
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
            white-space: pre-wrap;
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

    $scaleX = $viewport[0] ?? 1;
    $scaleY = $viewport[3] ?? 1;
    $offsetX = $viewport[4] ?? 0;
    $offsetY = $viewport[5] ?? 0;

     function applyTransform($val, $zoom, $offset) {
            return $val * $zoom + $offset;
        }

        function scaleSize($val, $scale, $zoom) {
            return $val * $scale * $zoom;
        }

        
    function mapFontFamily($font) {
        return match (strtolower($font)) {
            'arial' => 'Helvetica',
            'times new roman' => 'Times-Roman',
            'courier new' => 'Courier',
            'tahoma' => 'DejaVu Sans',
            default => 'DejaVu Sans'
        };
    }
@endphp


    @foreach ($rows as $data)
        <div class="template-container">
            @foreach ($template->elements as $el)
                @php
                    $obj = is_array($el->data) ? $el->data : json_decode($el->data, true);
                    $type = $el->type;
                  $left = ($obj['left'] ?? 0) * $scaleX + $offsetX;
                $top = ($obj['top'] ?? 0) * $scaleY + $offsetY;
                $width  = ($obj['width'] ?? 0) * ($obj['scaleX'] ?? 1) * $scaleX * $zoom;
                $height = ($obj['height'] ?? 0) * ($obj['scaleY'] ?? 1) * $scaleY * $zoom;


                @endphp



                @if (in_array($type, ['text', 'dynamic', 'textbox']))
                    @php
                        $text = $obj['text'] ?? '';
                        $text = preg_replace_callback('/#\{(.*?)\}/', fn($m) => $data[$m[1]] ?? $m[0], $text);
                        $fontSize = ($obj['fontSize'] ?? 16) * $zoom;
                    @endphp
                   <div class="element"
                    style="
                        left: {{ $left }}px;
                        top: {{ $top }}px;
                        font-size: {{ $fontSize }}px;
                        color: {{ $obj['fill'] ?? '#000' }};
                        font-weight: {{ isset($obj['fontWeight']) && $obj['fontWeight'] === 'bold' ? 'bold' : 'normal' }};
                        font-family: '{{ mapFontFamily($obj['fontFamily'] ?? '') }}';
                    ">
                    {{ $text }}
                </div>


                @elseif ($type === 'qr')
                    @php
                        $qrField = isset($obj['variable']) ? preg_replace('/[#{\}]/', '', $obj['variable']) : null;
                        $qrImg = $qrField ? ($data['qr_image_base64_' . $qrField] ?? null) : null;
                        $qrWidth = scaleSize(($obj['width'] ?? 100), ($obj['scaleX'] ?? 1), $zoom);
                        $qrHeight = scaleSize(($obj['height'] ?? 100), ($obj['scaleY'] ?? 1), $zoom);
                    @endphp
                    @if ($qrImg)
                        <div class="element" style="left: {{ $left }}px; top: {{ $top }}px;">
                            <img src="{{ $qrImg }}"
                                 width="{{ $qrWidth }}"
                                 height="{{ $qrHeight }}"
                                 alt="QR Code">
                        </div>
                    @endif

                @elseif ($type === 'image' && !empty($obj['src']))
                    @php
                        $imgWidth = scaleSize(($obj['width'] ?? 100), ($obj['scaleX'] ?? 1), $zoom);
                        $imgHeight = scaleSize(($obj['height'] ?? 100), ($obj['scaleY'] ?? 1), $zoom);
                    @endphp
                    <div class="element" style="left: {{ $left }}px; top: {{ $top }}px;">
                        <img src="{{ $obj['src'] }}"
                             style="width: {{ $imgWidth }}px; height: {{ $imgHeight }}px;" alt="Image">
                    </div>

                
                    @elseif ($type === 'staticQR' && !empty($obj['src']))
                        @php
                            $imgWidth = scaleSize(($obj['width'] ?? 100), ($obj['scaleX'] ?? 1), $zoom);
                            $imgHeight = scaleSize(($obj['height'] ?? 100), ($obj['scaleY'] ?? 1), $zoom);
                        @endphp
                        <div class="element" style="left: {{ $left }}px; top: {{ $top }}px;">
                            <img src="{{ $obj['src'] }}"
                                style="width: {{ $imgWidth }}px; height: {{ $imgHeight }}px;"
                                alt="Static QR Code">
                        </div>




                @elseif ($type === 'rect')
                    @php
                        $width = scaleSize(($obj['width'] ?? 100), ($obj['scaleX'] ?? 1), $zoom);
                        $height = scaleSize(($obj['height'] ?? 100), ($obj['scaleY'] ?? 1), $zoom);
                    @endphp
                    <div class="element"
                         style="
                             left: {{ $left }}px;
                             top: {{ $top }}px;
                             width: {{ $width }}px;
                             height: {{ $height }}px;
                             background: {{ $obj['fill'] ?? '#000' }};
                         ">
                    </div>

                @elseif ($type === 'circle')
                    @php
                        $diameter = ($obj['radius'] ?? 50) * 2;
                        $width = scaleSize($diameter, ($obj['scaleX'] ?? 1), $zoom);
                        $height = scaleSize($diameter, ($obj['scaleY'] ?? 1), $zoom);
                    @endphp
                    <div class="element"
                         style="
                             left: {{ $left }}px;
                             top: {{ $top }}px;
                             width: {{ $width }}px;
                             height: {{ $height }}px;
                             border-radius: 50%;
                             background: {{ $obj['fill'] ?? '#000' }};
                         ">
                    </div>

                @elseif ($type === 'triangle')
                    @php
                        $halfWidth = scaleSize(($obj['width'] ?? 100) / 2, 1, $zoom);
                        $height = scaleSize(($obj['height'] ?? 100), 1, $zoom);
                    @endphp
                    <div class="element"
                         style="
                             left: {{ $left }}px;
                             top: {{ $top }}px;
                             width: 0;
                             height: 0;
                             border-left: {{ $halfWidth }}px solid transparent;
                             border-right: {{ $halfWidth }}px solid transparent;
                             border-bottom: {{ $height }}px solid {{ $obj['fill'] ?? '#000' }};
                         ">
                    </div>

                @elseif ($type === 'line')
                    @php
                        $lineWidth = ($obj['width'] ?? 100) * $zoom;
                        $strokeWidth = ($obj['strokeWidth'] ?? 2);
                    @endphp
                    <div class="element"
                         style="
                             left: {{ $left }}px;
                             top: {{ $top }}px;
                             width: {{ $lineWidth }}px;
                             height: 0;
                             border-top: {{ $strokeWidth }}px solid {{ $obj['stroke'] ?? '#000' }};
                         ">
                    </div>
                @endif
            @endforeach
        </div>
    @endforeach
</body>

</html>