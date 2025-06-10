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
        // $templates = Template::all();

        return view('templates.index', compact('width', 'height', 'unit'));
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
            'config' => $request->input('config') ?? null,
        ]);

        $elements = $request->input('elements', []);

        foreach ($elements as $element) {
            $template->elements()->create([
                'type' => $element['type'],
                'data' => json_encode($element['data'] ?? []),
            ]);
        }

        return redirect()->route('templates.index')->with('success', 'Template created successfully!');
    }

    public function printBatch(Request $request)
    {
        try {
            $template = $this->createTemplateFromRequest($request);
            $qrVariables = $this->saveTemplateElements($template);

            // dd($template['src']);

            $rows = $this->parseCsvRowsAndGenerateQr(
                $request->input('csv_rows'),
                $qrVariables
            );

            $pdf = \Barryvdh\DomPDF\Facade\PDF::loadView('print.batch', [
                'template' => $template,
                'rows' => $rows,
            ]);

            // $pageWidth = is_numeric($template->width) ? $template->width * 0.264583 : 210;  // mm
            // $pageHeight = is_numeric($template->height) ? $template->height * 0.264583 : 297;

            // $pdf->setPaper([$pageWidth, $pageHeight], 'portrait');


            return $pdf->download($template->name . '.pdf');
        } catch (\Throwable $th) {
            if (str_contains($th->getMessage(), 'Column \'name\' cannot be null')) {
                $message = 'Vui lòng nhập tên bản thiết kế!';
            } else {
                dd($th->getMessage());
                $message = 'Đã xảy ra lỗi khi in. Vui lòng thử lại sau!';
            }
            return redirect()->back()->with('error', $message);
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
    private function parseCsvRowsAndGenerateQr($csv, $qrVariables)
    {
        $rows = [];
        foreach (explode("\n", $csv) as $line) {
            $parts = str_getcsv(trim($line));

            $row = [
                'name' => mb_convert_encoding($parts[0], 'UTF-8', 'auto'),
                'code' => mb_convert_encoding($parts[1], 'UTF-8', 'auto'),
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
        // dd($rows);
        return $rows;
    }

    public function checkOrCreate(Request $request)
    {
        $name = $request->input('name', 'no-name');
        $width = $request->input('width');
        $height = $request->input('height');
        $config = $request->input('config');

        // Tìm template theo name (bỏ width, height nếu chỉ cần duy nhất theo name)
        $template = Template::where('name', $name)->first();

        if ($template) {
            // Nếu config khác thì update
            if ($template->config !== $config) {
                $template->config = $config;
                $template->width = $width;   // Có thể cập nhật width/height nếu muốn
                $template->height = $height;
                $template->save();
                return response()->json(['status' => 'updated', 'template' => $template]);
            }
            // Nếu config giống thì không làm gì
            return response()->json(['status' => 'no-change', 'template' => $template]);
        } else {
            // Nếu chưa có thì tạo mới
            $template = Template::create([
                'name' => $name,
                'width' => $width,
                'height' => $height,
                'config' => $config,
            ]);
            return response()->json(['status' => 'created', 'template' => $template]);
        }
    }
}
