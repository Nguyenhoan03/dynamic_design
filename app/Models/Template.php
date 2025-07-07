<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'viewport_state',
        'canvas_objects',
        'width',
        'height',
        'config',
        'unit'
    ];

    public function elements()
    {
        return $this->hasMany(TemplateElement::class);
    }
    protected $casts = [
        'viewport_state' => 'array',
        'canvas_objects' => 'array',
        'config' => 'array',
    ];
}
