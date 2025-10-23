<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InternalApiRequestCheck
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-Api-Key');
        $validKey = config('app.internal_api_key');

        if (!$apiKey || $apiKey != $validKey) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => '无效的 API Key',
            ], 401);
        }

        return $next($request);
    }
}
