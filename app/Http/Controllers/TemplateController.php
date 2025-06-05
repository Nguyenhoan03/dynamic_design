<?php

namespace App\Http\Controllers;

use App\Models\Template;
use App\Models\TemplateElement;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\PDF;

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
            // 1. Tạo mới Template
            $template = new Template();
            $template->name = $request->input('template_name', 'Mẫu mới');
            $template->width = $request->input('template_width', 750);
            $template->height = $request->input('template_height', 350);
            $template->config = $request->input('template_config');
            $template->save();

            // 1.1. Lưu các element vào bảng template_elements
            $config = json_decode($template->config, true);
            if (!empty($config['objects'])) {
                foreach ($config['objects'] as $obj) {
                    $type = $obj['customType'] ?? $obj['type'] ?? 'text';
                    $content = $obj['text'] ?? '';
                    if ($type === 'dynamicQR' || $type === 'qr') {
                        $type = 'qr';
                        $content = $obj['variable'] ?? '#{code}';
                    }
                    $template->elements()->create([
                        'type' => $type,
                        'content' => $content,
                        'x' => $obj['left'] ?? 0,
                        'y' => $obj['top'] ?? 0,
                        'font_size' => $obj['fontSize'] ?? 18,
                        'size' => $obj['width'] ?? null,
                        'style' => [],
                    ]);
                }
            }

            // 2. Xử lý dữ liệu CSV
            $csv = $request->input('csv_rows');
            $rows = [];
            foreach (explode("\n", $csv) as $line) {
                $parts = str_getcsv(trim($line));
                if (count($parts) >= 2) {
                    $rows[] = ['name' => $parts[0], 'code' => $parts[1]];
                }
            }

            // 3. Render PDF
            $pdf = \Barryvdh\DomPDF\Facade\PDF::loadView('print.batch', [
                'template' => $template,
                'rows' => $rows
            ]);
            return $pdf->download($template->name . '.pdf');
        } catch (\Throwable $th) {
            dd($th->getMessage());
        }
    }
}
