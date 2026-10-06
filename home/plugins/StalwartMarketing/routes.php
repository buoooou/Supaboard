<?php

use Illuminate\Support\Facades\Route;
use Plugin\StalwartMarketing\Controllers\AdminController;

Route::middleware(['web'])->group(function () {
    Route::get('/plugin/stalwart-marketing', [AdminController::class, 'panel'])
        ->name('plugin.stalwart_marketing.panel');

    Route::get('/onlineboard/plugin/stalwart-marketing', function () {
        return redirect('/plugin/stalwart-marketing', 302);
    });
});

Route::group([
    'prefix' => 'admin/plugin/stalwart-marketing',
    'middleware' => ['web', 'admin'],
], function () {
    Route::get('/', [AdminController::class, 'index'])->name('plugin.stalwart_marketing.index');
    Route::post('/test', [AdminController::class, 'test'])->name('plugin.stalwart_marketing.test');
    Route::post('/send', [AdminController::class, 'send'])->name('plugin.stalwart_marketing.send');
});
