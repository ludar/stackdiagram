<?php

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('diagrams:purge-expired')->dailyAt('04:30');
    })
    ->booted(function (): void {
        RateLimiter::for('diagram-create', fn (Request $r) => Limit::perHour(30)->by($r->ip()));
        RateLimiter::for('diagram-read', fn (Request $r) => Limit::perMinute(120)->by($r->ip()));
        RateLimiter::for('diagram-write', fn (Request $r) => Limit::perMinute(20)->by($r->ip()));
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
