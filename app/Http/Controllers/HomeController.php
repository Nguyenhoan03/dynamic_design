<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $templates = Template::all();
        return view('home', compact('templates'));
    }
   
}
