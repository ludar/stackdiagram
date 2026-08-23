<?php

use App\Http\Controllers\Api\DiagramController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/diagrams', [DiagramController::class, 'store'])
        ->middleware('throttle:diagram-create');
    Route::get('/diagrams/{id}', [DiagramController::class, 'show'])
        ->middleware('throttle:diagram-read')->name('api.diagrams.get');
    Route::put('/diagrams/{id}', [DiagramController::class, 'update'])
        ->middleware('throttle:diagram-write');
});
