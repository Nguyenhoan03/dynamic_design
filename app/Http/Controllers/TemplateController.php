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
        dd($request->all());
        $template = Template::with('elements')->findOrFail($request->template_id);
        $csv = $request->input('csv_rows');
        $rows = [];
        foreach (explode("\n", $csv) as $line) {
            $parts = str_getcsv(trim($line));
            if (count($parts) >= 2) {
                $rows[] = ['name' => $parts[0], 'code' => $parts[1]];
            }
        }
        $pdf = PDF::loadView('print.batch', [
            'template' => $template,
            'rows' => $rows
        ]);
        return $pdf->download('batch.pdf');
    }
}
