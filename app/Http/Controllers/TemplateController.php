<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class TemplateController extends Controller
{
    public function index(Request $request)
    {
        $width = $request->query('width', 750);
        $height = $request->query('height', 350);
        $unit = $request->query('unit', 'px');
        return view('templates.index', compact('width', 'height', 'unit'));
    }

    public function create()
    {
        return view('templates.create');
    }

    public function edit($id)
    {
        $template = Template::findOrFail($id);
        return view('templates.index', [
            'template' => $template,
            'config' => $template->config,
            'width' => $template->width,
            'height' => $template->height,
            'unit' => 'px',
        ]);
    }

    public function store(Request $request)
    {
        $this->createOrUpdateTemplate(
            $request->input('name'),
            $request->input('width'),
            $request->input('height'),
            $request->input('config'),
            $request->input('elements', [])
        );
        return redirect()->route('templates.index')->with('success', 'Template saved successfully!');
    }

    public function printBatch(Request $request)
    {
        try {
            $template = $this->createOrUpdateTemplate(
                $request->input('template_name'),
                $request->input('template_width'),
                $request->input('template_height'),
                $request->input('template_config')
            );

            $qrVariables = $this->saveTemplateElements($template);

            $rows = $this->parseCsvRowsAndGenerateQr(
                $request->input('csv_rows'),
                $qrVariables
            );

            $pdf = \Barryvdh\DomPDF\Facade\PDF::loadView('print.batch', [
                'template' => $template,
                'rows' => $rows,
            ]);

            return $pdf->download($template->name . '.pdf');
        } catch (\Throwable $th) {
            $message = str_contains($th->getMessage(), 'Column \'name\' cannot be null')
                ? 'Vui lòng nhập tên bản thiết kế!'
                : 'Đã xảy ra lỗi khi in. Vui lòng thử lại sau!';
            return redirect()->back()->with('error', $message);
        }
    }

    public function checkOrCreate(Request $request)
    {
        $name = $request->input('name', 'no-name');
        $width = $request->input('width');
        $height = $request->input('height');
        $config = $request->input('config');

        $template = Template::where('name', $name)->first();

        if ($template) {
            if ($template->config !== $config) {
                $template->update([
                    'config' => $config,
                    'width' => $width,
                    'height' => $height,
                ]);
                return response()->json(['status' => 'updated', 'template' => $template]);
            }
            return response()->json(['status' => 'no-change', 'template' => $template]);
        } else {
            $template = Template::create([
                'name' => $name,
                'width' => $width,
                'height' => $height,
                'config' => $config,
            ]);
            return response()->json(['status' => 'created', 'template' => $template]);
        }
    }

    /**
     * Tạo mới hoặc cập nhật template theo tên.
     */
    private function createOrUpdateTemplate($name, $width, $height, $config, $elements = [])
    {
        $template = Template::firstOrNew(['name' => $name]);
        $template->width = $width;
        $template->height = $height;
        $template->config = $config;
        $template->save();

        // Nếu có elements thì cập nhật lại
        if (!empty($elements)) {
            $template->elements()->delete();
            foreach ($elements as $element) {
                $template->elements()->create([
                    'type' => $element['type'],
                    'data' => json_encode($element['data'] ?? []),
                ]);
            }
        }
        return $template;
    }

    /**
     * Lưu elements từ config vào DB, trả về danh sách biến QR.
     */
    private function saveTemplateElements($template)
    {
        $config = json_decode($template->config, true);
        $qrVariables = [];
        $template->elements()->delete();
        if (!empty($config['objects'])) {
            foreach ($config['objects'] as $obj) {
                $type = $obj['customType'] ?? $obj['type'] ?? 'text';
                if ($type === 'dynamicQR' || $type === 'qr') {
                    $type = 'qr';
                    $qrVariables[] = $obj['variable'] ?? '#{code}';
                }
                $template->elements()->create([
                    'type' => $type,
                    'data' => json_encode($obj),
                ]);
            }
        }
        return $qrVariables;
    }

    /**
     * Parse CSV và sinh QR code cho từng dòng.
     */
    private function parseCsvRowsAndGenerateQr($csv, $qrVariables)
    {
        $rows = [];
        foreach (explode("\n", $csv) as $line) {
            $parts = str_getcsv(trim($line));
            $row = [
                'name' => mb_convert_encoding($parts[0] ?? '', 'UTF-8', 'auto'),
                'code' => mb_convert_encoding($parts[1] ?? '', 'UTF-8', 'auto'),
                'qrcode' => (count($parts) > 2) ? mb_convert_encoding($parts[2], 'UTF-8', 'auto') : null,
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
        return $rows;
    }
}