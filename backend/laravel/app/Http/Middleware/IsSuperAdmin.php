<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsSuperAdmin
{
    /**
     * Handle an incoming request.
     * Check if user is super_admin
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        if (!$request->user()->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized. Super Admin access required.'], 403);
        }

        return $next($request);
    }
}
