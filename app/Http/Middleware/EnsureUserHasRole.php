<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (! Auth::check() || ! in_array(Auth::user()->role, $roles)) {
            // Redirect based on user's actual role or show error
            if (Auth::check()) {
                // User is logged in but doesn't have required role
                return redirect('/')->with('error', 'غير مسموح لك بالوصول إلى هذه الصفحة');
            } else {
                // User is not logged in
                return redirect()->route('login-student.show')->with('error', 'يجب تسجيل الدخول أولًا');
            }
        }

        return $next($request);
    }
}
