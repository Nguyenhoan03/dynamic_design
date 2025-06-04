<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TemplateElement extends Model
{
    use HasFactory;
     protected $fillable = ['template_id', 'type', 'content', 'x', 'y', 'font_size', 'size', 'style'];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    protected $casts = [
        'style' => 'array',
    ];
}
