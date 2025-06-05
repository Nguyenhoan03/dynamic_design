<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $template->name }}</title>
    <style>
        body {
            width: {{ $template->width }}px;
            height: {{ $template->height }}px;
            position: relative;
            font-family: DejaVu Sans, sans-serif;
        }
        .element {
            position: absolute;
        }
    </style>
</head>
<body>
    @foreach ($rows as $data)
        <div style="page-break-after: always;">
            @foreach ($template->elements as $el)
                @php
                    $text = $el->content;
                    // Replace placeholders like #{name} and #{code}
                    $text = str_replace('#{name}', $data['name'], $text);
                    $text = str_replace('#{code}', $data['code'], $text);
                @endphp

                @if ($el->type === 'text' || $el->type === 'dynamic')
                    <div class="element" style="
                        left: {{ $el->x }}px;
                        top: {{ $el->y }}px;
                        font-size: {{ $el->font_size ?? 18 }}px;
                        ">
                        {{ $text }}
                    </div>
                @elseif ($el->type === 'qr')
                    <div class="element" style="left: {{ $el->x }}px; top: {{ $el->y }}px;">
                        {!! QrCode::size(100)->generate($text) !!}
                    </div>
                @endif
            @endforeach
        </div>
    @endforeach
</body>
</html>
