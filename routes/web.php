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
    Route::get('/_demo/400', fn () => abort(400));
    Route::get('/_demo/401', fn () => abort(401));
    Route::get('/_demo/404', fn () => abort(404));
    Route::get('/_demo/405', fn () => abort(405));
    Route::get('/_demo/408', fn () => abort(408));
    Route::get('/_demo/409', fn () => abort(409));
    Route::get('/_demo/410', fn () => abort(410));
    Route::get('/_demo/413', fn () => abort(413));
    Route::get('/_demo/415', fn () => abort(415));
    Route::get('/_demo/418', fn () => abort(418));
    Route::get('/_demo/419', fn () => abort(419));
    Route::get('/_demo/422', fn () => abort(422));
    Route::get('/_demo/429', fn () => abort(429));
    Route::get('/_demo/500', fn () => abort(500));
    Route::get('/_demo/502', fn () => abort(502));
    Route::get('/_demo/503', fn () => abort(503));
    Route::get('/_demo/504', fn () => abort(504));
}

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
