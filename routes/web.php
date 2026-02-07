<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/tailwind-test', function () {
    return view('test');
});

// HTTP error demo routes (local only)
if (app()->environment('local')) {
    Route::get('/_demo/403', fn () => abort(403));
    Route::get('/_demo/404', fn () => abort(404));
    Route::get('/_demo/419', fn () => abort(419));
    Route::get('/_demo/429', fn () => abort(429));
    Route::get('/_demo/500', fn () => abort(500));
    Route::get('/_demo/503', fn () => abort(503));
}

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
