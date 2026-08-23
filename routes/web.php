<?php

use App\Http\Controllers\DiagramViewController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => view('welcome'));

Route::get('/d/{id}', [DiagramViewController::class, 'show'])->name('diagrams.show');

Route::get('/llms.txt', fn () => response(file_get_contents(resource_path('docs/llms.txt')))
    ->header('Content-Type', 'text/plain; charset=utf-8')
    ->header('Cache-Control', 'public, max-age=3600'));
