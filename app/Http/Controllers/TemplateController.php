<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use DragonCode\Support\Facades\Helpers\Str;
class TemplateController extends Controller
{
    public function index(Request $request)
    {
        $width = $request->query('width');
        $height = $request->query('height');
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
            'unit' => $template->unit ?? 'px',

        ]);
    }

    public function store(Request $request)
    {
        $id = $request->input('template_id');
        $template = $this->createOrUpdateTemplate(
            $request->input('name'),
            $request->input('width'),
            $request->input('height'),
            $request->input('config'),
            $request->input('elements', []),
            $id
        );

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'template' => $template
            ]);
        }

        return redirect()->route('templates.index')->with('success', 'Template saved successfully!');
    }

    public function printBatch(Request $request)
    {
        try {
            $template = $this->createOrUpdateTemplate(
                $request->input('template_name'),
                $request->input('template_width'),
                $request->input('template_height'),
                $request->input('template_config'),
                $request->input('elements', []),
                $request->input('template_id'),
               
            );


            $qrVariables = $this->saveTemplateElements($template);
            
            $zoom = floatval($request->input('template_zoom', 1));
            $viewport = json_decode($request->input('template_viewport', '[]'), true);

            
            // Lấy fields động từ client
            $fields = array_filter(array_map('trim', explode(',', $request->input('fields', ''))));

            $rows = $this->parseCsvRowsAndGenerateQr(
                $request->input('csv_rows'),
                $qrVariables,
                $fields
            );
            // dd($rows);

            $pdf = \Barryvdh\DomPDF\Facade\PDF::loadView('print.batch', [
                'template' => $template,
                'rows' => $rows,
                'preview_image' => $request->input('template_image'),
                'zoom' => $zoom,
                'viewport' => $viewport,

            ]);

            //  dd($request->input('fields'),$qrVariables, $fields);


            return $pdf->download($template->name . '.pdf');
        } catch (\Throwable $th) {
            Log::info('Error printing batch: ' . $th->getMessage());
            $message = str_contains($th->getMessage(), 'Column \'name\' cannot be null')
                ? 'Vui lòng nhập tên bản thiết kế!'
                : ($th->getMessage() === 'Tên bản thiết kế đã tồn tại!' ? $th->getMessage() : 'Đã xảy ra lỗi khi in. Vui lòng thử lại sau!');
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
    private function createOrUpdateTemplate($name, $width, $height, $config, $elements = [], $id = null)
    {

        if ($id) {
            $template = Template::find($id);
            if ($template) {
                // Nếu đổi tên, kiểm tra trùng tên với template khác
                $existing = Template::where('name', $name)->where('id', '!=', $id)->first();
                if ($existing) {
                    throw new \Exception('Tên bản thiết kế đã tồn tại!');
                }
                $template->name = $name;
            } else {
                $template = new Template();
                $template->name = $name;
            }
        } else {
            $template = Template::where('name', $name)->first() ?? new Template();
            $template->name = $name;
        }

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
    private function parseCsvRowsAndGenerateQr($csv, $qrVariables, $fields = [])
    {
        $rows = [];
        $lines = explode("\n", trim($csv));
        foreach ($lines as $line) {
            $parts = str_getcsv(trim($line));
            $row = [];
            foreach ($fields as $i => $field) {
                $row[$field] = mb_convert_encoding($parts[$i] ?? '', 'UTF-8', 'auto');
            }
            // Sinh QR cho từng biến QR động
            foreach ($qrVariables as $qrVar) {
                $qrField = preg_replace('/[#{\}]/', '', $qrVar);
                $qrContent = $row[$qrField] ?? '';
                if ($qrContent) {
                    $qrFileName = 'qr_codes/' . md5($qrContent) . '.png';
                    if (!Storage::disk('public')->exists($qrFileName)) {
                        $qrImage = QrCode::format('png')->size(200)->margin(1)->generate($qrContent);
                        Storage::disk('public')->put($qrFileName, $qrImage);
                    }
                    $qrBinary = Storage::disk('public')->get($qrFileName);
                    $row['qr_image_base64_' . $qrField] = 'data:image/png;base64,' . base64_encode($qrBinary);
                }
            }

            $rows[] = $row;
        }

        return $rows;
    }




    // Tạo bản sao template
    public function copy($id)
    {
        $template = Template::findOrFail($id);
        $new = $template->replicate();
        $new->name = $template->name . ' (Bản sao)';
        $new->save();
        return redirect()->route('templates.edit', $new->id)->with('success', 'Đã tạo bản sao!');
    }

    // Tải xuống template (ví dụ: file JSON)
    public function download($id)
    {
        $template = Template::findOrFail($id);
        $filename = Str::slug($template->name) . '.json';
        return response()->json($template)->withHeaders([
            'Content-Disposition' => 'attachment; filename="' . $filename . '"'
        ]);
    }

    // Chia sẻ template (ví dụ: trả về link chia sẻ)
    public function share($id)
    {
        $template = Template::findOrFail($id);
        $shareUrl = route('templates.edit', $template->id);
        return response()->json(['url' => $shareUrl]);
    }

    // Xóa template (đưa vào thùng rác hoặc xóa hẳn)
    public function destroy($id)
    {
        $template = Template::findOrFail($id);
        $template->delete();
        return redirect()->route('templates.index')->with('success', 'Đã xóa template!');
    }
    public function bulkDelete(Request $request)
    {
        $ids = explode(',', $request->input('ids', ''));
        if ($ids && count($ids)) {
            Template::whereIn('id', $ids)->delete();
        }
        return redirect()->route('templates.index')->with('success', 'Đã xóa các bản thiết kế đã chọn!');
    }
}