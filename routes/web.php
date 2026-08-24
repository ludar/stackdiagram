<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiagramActionsController;
use App\Http\Controllers\DiagramEditController;
use App\Http\Controllers\DiagramViewController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Landing'))->name('home');

Route::get('/d/{id}.md', [DiagramViewController::class, 'context'])
    ->where('id', '[A-Za-z0-9]+')->name('diagrams.context');
Route::get('/d/{id}', [DiagramViewController::class, 'show'])
    ->where('id', '[A-Za-z0-9]+')->name('diagrams.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/d/{id}/claim', [DiagramActionsController::class, 'claim'])->name('diagrams.claim');
    Route::post('/d/{id}/fork', [DiagramActionsController::class, 'fork'])->name('diagrams.fork');
    Route::patch('/d/{id}/visibility', [DiagramActionsController::class, 'visibility'])->name('diagrams.visibility');
    Route::delete('/d/{id}', [DiagramActionsController::class, 'destroy'])->name('diagrams.destroy');
    Route::patch('/d/{id}/doc', [DiagramEditController::class, 'doc'])->name('diagrams.doc');
    Route::patch('/d/{id}/layout', [DiagramEditController::class, 'layout'])->name('diagrams.layout');
    Route::post('/d/{id}/relayout', [DiagramEditController::class, 'relayout'])->name('diagrams.relayout');
});

Route::get('/llms.txt', fn () => response(file_get_contents(resource_path('docs/llms.txt')))
    ->header('Content-Type', 'text/plain; charset=utf-8')
    ->header('Cache-Control', 'public, max-age=3600'));
