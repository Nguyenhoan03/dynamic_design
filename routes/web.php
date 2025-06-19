<?php

use App\Http\Controllers\HomeController;
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
// Route::get('/', function () {

//     return view('home');
// });
Route::get('/', [HomeController::class, 'index']);

Route::get('/templates', [TemplateController::class, 'index'])->name('templates.index');
Route::post('/templates', [TemplateController::class, 'store']);
Route::get('/templates/edit/{id}', [TemplateController::class, 'edit'])->name('templates.edit');
Route::post('/templates/check-or-create', [TemplateController::class, 'checkOrCreate']);
Route::post('/print-batch', [TemplateController::class, 'printBatch']);
Route::get('/templates/{id}/preview', [TemplateController::class, 'preview']);
Route::post('/templates/{id}/print', [TemplateController::class, 'print']);


Route::get('/templates/{id}/copy', [TemplateController::class, 'copy'])->name('templates.copy');
Route::get('/templates/{id}/download', [TemplateController::class, 'download'])->name('templates.download');
Route::get('/templates/{id}/share', [TemplateController::class, 'share'])->name('templates.share');
Route::delete('/templates/{id}', [TemplateController::class, 'destroy'])->name('templates.destroy');
Route::delete('/templates/bulk-delete', [TemplateController::class, 'bulkDelete'])->name('templates.bulkDelete');