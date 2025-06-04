<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TemplateController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('home');
});
Route::get('/templates', [TemplateController::class, 'index']);
Route::post('/templates', [TemplateController::class, 'store']);
Route::get('/templates/{id}/preview', [TemplateController::class, 'preview']);
Route::post('/templates/{id}/print', [TemplateController::class, 'print']);