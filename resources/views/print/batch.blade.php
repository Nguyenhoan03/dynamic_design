
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
            $style = $el->style ?? [];
        @endphp

        @if ($el->type === 'text' || $el->type === 'dynamic' || $el->type === 'textbox')
            <div style="position: absolute; left: {{ $el->x }}px; top: {{ $el->y }}px; font-size: {{ $el->font_size ?? 16 }}px;">
                {{ $content }}
            </div>
        @elseif ($el->type === 'qr' && !empty($data['qr_image_base64']))
            <div style="position: absolute; left: {{ $el->x }}px; top: {{ $el->y }}px;">
                <img src="{{ $data['qr_image_base64'] }}" width="100" height="100" alt="QR Code">
            </div>
        @elseif ($el->type === 'image' && !empty($content))
            <div style="position: absolute; left: {{ $el->x }}px; top: {{ $el->y }}px;">
                <img src="{{ $content }}"
                     style="max-width: {{ $el->size ?? 100 }}px; max-height: {{ $el->size ?? 100 }}px;"
                     alt="Image">
            </div>
        @elseif ($el->type === 'rect')
            <div style="position: absolute; left: {{ $el->x }}px; top: {{ $el->y }}px; width: {{ $el->size ?? 100 }}px; height: {{ $el->size ?? 100 }}px; background: {{ $style['fill'] ?? '#000' }}; border: {{ isset($style['stroke']) ? '1px solid '.$style['stroke'] : 'none' }};">
            </div>
        @elseif ($el->type === 'circle')
            <div style="position: absolute; left: {{ $el->x }}px; top: {{ $el->y }}px; width: {{ $el->size ?? 100 }}px; height: {{ $el->size ?? 100 }}px; border-radius: 50%; background: {{ $style['fill'] ?? '#000' }}; border: {{ isset($style['stroke']) ? '1px solid '.$style['stroke'] : 'none' }};">
            </div>
        @elseif ($el->type === 'triangle')
            <div style="position: absolute; left: {{ $el->x }}px; top: {{ $el->y }}px; width: 0; height: 0;
                border-left: {{ ($el->size ?? 100)/2 }}px solid transparent;
                border-right: {{ ($el->size ?? 100)/2 }}px solid transparent;
                border-bottom: {{ $el->size ?? 100 }}px solid {{ $style['fill'] ?? '#000' }};">
            </div>
        @elseif ($el->type === 'line')
            <div style="position: absolute; left: {{ $el->x }}px; top: {{ $el->y }}px; width: {{ $el->size ?? 100 }}px; height: 0; border-top: {{ $style['strokeWidth'] ?? 2 }}px solid {{ $style['stroke'] ?? '#000' }};">
            </div>
        @endif

        @endforeach
    </div>
    @endforeach

</body>
</html>