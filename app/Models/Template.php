<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'width', 'height', 'config','unit'];

    public function elements()
    {
        return $this->hasMany(TemplateElement::class);
    }
    protected $casts = [
    'config' => 'array',
];
}
