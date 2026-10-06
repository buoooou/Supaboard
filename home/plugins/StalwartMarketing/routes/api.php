<?php

use Illuminate\Support\Facades\Route;
use Plugin\StalwartMarketing\Controllers\AdminController;

Route::group([
    'prefix' => 'api/v1/plugin/stalwart-marketing',
    'middleware' => ['api', 'admin'],
], function () {
    Route::get('/config', [AdminController::class, 'config']);
    Route::get('/recipients', [AdminController::class, 'recipients']);
    Route::post('/send', [AdminController::class, 'send']);
    Route::post('/test', [AdminController::class, 'test']);
});
