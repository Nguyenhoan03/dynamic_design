<?php
namespace App\Http\Controllers;

use App\Models\Template;
use App\Models\TemplateElement;
use Illuminate\Http\Request;

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
}
