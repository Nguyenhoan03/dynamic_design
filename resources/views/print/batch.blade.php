@foreach($rows as $row)
    <div style="width:{{$template->width}}px;height:{{$template->height}}px;position:relative;page-break-after:always;">
        @foreach($template->elements as $el)
            @php
                $content = $el->content;
                foreach($row as $k=>$v) {
                    $content = str_replace('#{'.$k.'}', $v, $content);
                }
            @endphp
            @if($el->type == 'text')
                <div style="position:absolute;left:{{$el->x}}px;top:{{$el->y}}px;font-size:{{$el->font_size}}px;">
                    {!! $content !!}
                </div>
            @elseif($el->type == 'qr')
                <div style="position:absolute;left:{{$el->x}}px;top:{{$el->y}}px;">
                    {!! QrCode::size(70)->generate($row['code']) !!}
                </div>
            @endif
        @endforeach
    </div>
@endforeach