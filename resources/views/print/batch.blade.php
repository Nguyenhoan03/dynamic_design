<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $template->name }}</title>
    <style>
        body {
            position: relative;
            font-family: 'DejaVu Sans', Arial, sans-serif;
        }

        .element {
            position: absolute;
        }
    </style>
</head>

<div style="position: relative; width: {{ $template->width }}px; height: {{ $template->height }}px; page-break-after: always; overflow: hidden; background: #fff;">
    @foreach ($rows as $data)
    <div style="page-break-after: always;">
        @foreach ($template->elements as $el)
        @php
        $obj = is_array($el->data) ? $el->data : json_decode($el->data, true);
        $type = $el->type;
        @endphp

        @if ($type === 'text' || $type === 'dynamic' || $type === 'textbox')
        <div style="position: absolute; left: {{ $obj['left'] ?? 0 }}px; top: {{ $obj['top'] ?? 0 }}px; font-size: {{ $obj['fontSize'] ?? 16 }}px; color: {{ $obj['fill'] ?? '#000' }};">
            {{ str_replace(['#{name}', '#{code}'], [$data['name'] ?? '', $data['code'] ?? ''], $obj['text'] ?? '') }}
        </div>
        @elseif ($type === 'qr' && !empty($data['qr_image_base64']))
        <div style="position: absolute; left: {{ $obj['left'] ?? 0 }}px; top: {{ $obj['top'] ?? 0 }}px;">
            <img src="{{ $data['qr_image_base64'] }}" width="100" height="100" alt="QR Code">
        </div>
        @elseif ($type === 'image' && !empty($obj['src']))
        <div style="position: absolute; left: {{ $obj['left'] ?? 0 }}px; top: {{ $obj['top'] ?? 0 }}px;">
            <img src="{{ $obj['src'] }}"
                style="max-width: {{ $obj['width'] ?? 100 }}px; max-height: {{ $obj['height'] ?? 100 }}px;"
                alt="Image">
        </div>
        @elseif ($type === 'rect')
        <div style="position: absolute; left: {{ $obj['left'] ?? 0 }}px; top: {{ $obj['top'] ?? 0 }}px; width: {{ $obj['width'] ?? 100 }}px; height: {{ $obj['height'] ?? 100 }}px; background: {{ $obj['fill'] ?? '#000' }};"></div>
        @elseif ($type === 'circle')
        <div style="position: absolute; left: {{ $obj['left'] ?? 0 }}px; top: {{ $obj['top'] ?? 0 }}px; width: {{ $obj['radius'] ? $obj['radius']*2 : 100 }}px; height: {{ $obj['radius'] ? $obj['radius']*2 : 100 }}px; border-radius: 50%; background: {{ $obj['fill'] ?? '#000' }};"></div>
        @elseif ($type === 'triangle')
        <div style="position: absolute; left: {{ $obj['left'] ?? 0 }}px; top: {{ $obj['top'] ?? 0 }}px; width: 0; height: 0;
                border-left: {{ ($obj['width'] ?? 100)/2 }}px solid transparent;
                border-right: {{ ($obj['width'] ?? 100)/2 }}px solid transparent;
                border-bottom: {{ $obj['height'] ?? 100 }}px solid {{ $obj['fill'] ?? '#000' }};">
        </div>
        @elseif ($type === 'line')
        <div style="position: absolute; left: {{ $obj['left'] ?? 0 }}px; top: {{ $obj['top'] ?? 0 }}px; width: {{ $obj['width'] ?? 100 }}px; height: 0; border-top: {{ $obj['strokeWidth'] ?? 2 }}px solid {{ $obj['stroke'] ?? '#000' }};">
        </div>
        @endif

        @endforeach
    </div>
    @endforeach

    </body>

</html>