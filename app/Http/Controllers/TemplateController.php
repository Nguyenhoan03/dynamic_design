<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class TemplateController extends Controller
{
    public function index()
    {
        $templates = Template::all();
        return view('templates.index', compact('templates'));
    }

    public function create()
    {
        return view('templates.create');
    }

    public function store(Request $request)
    {
        $template = Template::create([
            'name' => $request->input('name'),
            'width' => $request->input('width'),
            'height' => $request->input('height'),
        ]);

        $elements = $request->input('elements');

        foreach ($elements as $element) {
            $template->elements()->create([
                'type' => $element['type'],
                'content' => $element['content'],
                'x' => $element['x'],
                'y' => $element['y'],
                'font_size' => $element['font_size'] ?? null,
                'size' => $element['size'] ?? null,
                'style' => $element['style'] ?? [],
            ]);
        }

        return redirect()->route('templates.index')->with('success', 'Template created successfully!');
    }

    public function printBatch(Request $request)
    {
        try {
            $template = $this->createTemplateFromRequest($request);
            $qrVariables = $this->saveTemplateElements($template);

            $rows = $this->parseCsvRowsAndGenerateQr(
                $request->input('csv_rows'),
                $qrVariables
            );

            $pdf = \Barryvdh\DomPDF\Facade\PDF::loadView('print.batch', [
                'template' => $template,
                'rows' => $rows
            ]);

            return $pdf->download($template->name . '.pdf');
        } catch (\Throwable $th) {
            dd($th->getMessage());
        }
    }

    private function createTemplateFromRequest(Request $request)
    {
        $template = new Template();
        $template->name = $request->input('template_name', 'Mẫu mới');
        $template->width = $request->input('template_width');
        $template->height = $request->input('template_height');
        $template->config = $request->input('template_config');
        $template->save();
        return $template;
    }

    private function saveTemplateElements($template)
    {
        $config = json_decode($template->config, true);
        $qrVariables = [];
        if (!empty($config['objects'])) {
            foreach ($config['objects'] as $obj) {
                $type = $obj['customType'] ?? $obj['type'] ?? 'text';
                $content = '';

                // Xử lý nội dung cho từng loại
                if ($type === 'dynamicQR' || $type === 'qr') {
                    $type = 'qr';
                    $content = $obj['variable'] ?? '#{code}';
                    $qrVariables[] = $content;
                } elseif ($type === 'text' || $type === 'dynamic' || $type === 'textbox') {
                    $content = $obj['text'] ?? '';
                } elseif ($type === 'image') {
                    $content = $obj['src'] ?? '';
                } elseif (in_array($type, ['rect', 'circle', 'triangle', 'line'])) {
                    $content = '';
                } elseif ($type === 'group') {
                    $content = ''; 
                }

                // Lưu thêm các thuộc tính style nếu có
                $style = [];
                if (isset($obj['fill'])) $style['fill'] = $obj['fill'];
                if (isset($obj['radius'])) $style['radius'] = $obj['radius'];
                if (isset($obj['stroke'])) $style['stroke'] = $obj['stroke'];
                if (isset($obj['strokeWidth'])) $style['strokeWidth'] = $obj['strokeWidth'];
                if (isset($obj['scaleX'])) $style['scaleX'] = $obj['scaleX'];
                if (isset($obj['scaleY'])) $style['scaleY'] = $obj['scaleY'];

                $template->elements()->create([
                    'type' => $type,
                    'content' => $content,
                    'x' => $obj['left'] ?? 0,
                    'y' => $obj['top'] ?? 0,
                    'font_size' => $obj['fontSize'] ?? 18,
                    'size' => $obj['width'] ?? null,
                    'style' => $style,
                ]);
            }
        }
        return $qrVariables;
    }
    private function parseCsvRowsAndGenerateQr($csv, $qrVariables)
    {
        $rows = [];
        foreach (explode("\n", $csv) as $line) {
            $parts = str_getcsv(trim($line));
            if (count($parts) >= 2) {
                $row = [
                    'name' => mb_convert_encoding($parts[0], 'UTF-8', 'auto'),
                    'code' => mb_convert_encoding($parts[1], 'UTF-8', 'auto'),
                    'qrcode' => isset($parts[2]) ? mb_convert_encoding($parts[2], 'UTF-8', 'auto') : null,
                ];

                if (!empty($qrVariables)) {
                    $qrContent = $row['qrcode'] ?? null;
                    if (!$qrContent) {
                        $qrTemplate = $qrVariables[0];
                        $qrContent = str_replace(
                            ['#{name}', '#{code}'],
                            [$row['name'], $row['code']],
                            $qrTemplate
                        );
                    }
                    $qrContent = mb_convert_encoding($qrContent, 'UTF-8', 'auto');
                    $qrFileName = 'qr_codes/' . md5($qrContent) . '.png';

                    if (!Storage::disk('public')->exists($qrFileName)) {
                        $qrImage = QrCode::format('png')->size(200)->margin(1)->generate($qrContent);
                        Storage::disk('public')->put($qrFileName, $qrImage);
                    }
                    $qrBinary = Storage::disk('public')->get($qrFileName);
                    $row['qr_image_base64'] = 'data:image/png;base64,' . base64_encode($qrBinary);
                }

                $rows[] = $row;
            }
        }
        // dd($rows);
        return $rows;
    }
}
