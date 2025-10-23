<?php

use App\Http\Controllers\Api\Internal\AccountController;
use App\Http\Middleware\InternalApiRequestCheck;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//Route::get('/user', function (Request $request) {
//    return $request->user();
//})->middleware('auth:sanctum');


Route::middleware([InternalApiRequestCheck::class])->group(function () {

    Route::controller(AccountController::class)->group(function() {
        Route::get('/account/in-freeze', 'inFreeze')->name('inFreeze');
    });


});
