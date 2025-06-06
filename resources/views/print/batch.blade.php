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

<body style="width: {{ $template->width }}px; height: {{ $template->height }}px;">
    @foreach ($rows as $data)
    <div style="page-break-after: always;">
        @foreach ($template->elements as $el)
        @php
        $content = $el->content;
        $content = str_replace('#{name}', $data['name'] ?? '', $content);
        $content = str_replace('#{code}', $data['code'] ?? '', $content);
        @endphp

        @if ($el->type === 'text' || $el->type === 'dynamic')
        <div style="position: absolute; left: {{ $el->x }}px; top: {{ $el->y }}px; font-size: {{ $el->font_size ?? 16 }}px;">
            {{ $content }}
        </div>
        @elseif ($el->type === 'qr' && !empty($data['qr_image_base64']))
        <div style="position: absolute; left: {{ $el->x }}px; top: {{ $el->y }}px;">
            <img src="{{ $data['qr_image_base64'] }}" width="100" height="100" alt="QR Code">
        </div>
        @endif
       
        @endforeach
    </div>
    @endforeach

</body>

</html>