<?php

namespace App\Providers;

use Illuminate\Routing\ResponseFactory;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResponseFactory::macro('api', function($data = null, string $message = '', int $code = 200, bool $success = true) {
            return response()->json([
                'success' => $success,
                'code' => $code,
                'message' => $message,
                'data' => $data,
            ]);
        });
    }
}
