<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiagramActionsController;
use App\Http\Controllers\DiagramViewController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Landing'))->name('home');

Route::get('/d/{id}', [DiagramViewController::class, 'show'])->name('diagrams.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/d/{id}/claim', [DiagramActionsController::class, 'claim'])->name('diagrams.claim');
    Route::post('/d/{id}/fork', [DiagramActionsController::class, 'fork'])->name('diagrams.fork');
    Route::patch('/d/{id}/visibility', [DiagramActionsController::class, 'visibility'])->name('diagrams.visibility');
    Route::delete('/d/{id}', [DiagramActionsController::class, 'destroy'])->name('diagrams.destroy');
});

Route::get('/llms.txt', fn () => response(file_get_contents(resource_path('docs/llms.txt')))
    ->header('Content-Type', 'text/plain; charset=utf-8')
    ->header('Cache-Control', 'public, max-age=3600'));
