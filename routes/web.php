<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/tailwind-test', function () {
    return view('test');
});

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
