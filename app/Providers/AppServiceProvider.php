<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Gate::define('admin', fn (User $user) => $user->is_active && $user->role === 'admin');
        Gate::define('manage-subjects', fn (User $user) => $user->is_active
            && in_array($user->role, ['admin', 'instructor'], true));

        RateLimiter::for('authentication', function (Request $request) {
            $scope = $request->route()->uri().'|'.$request->ip();
            $identifier = $request->input('university_id', $request->input('email', ''));
            $identifier = is_string($identifier) ? strtolower(trim($identifier)) : '';

            return [
                Limit::perMinute(60)->by('ip|'.$scope),
                Limit::perMinute(5)->by('account|'.$scope.'|'.$identifier),
            ];
        });
        RateLimiter::for('registration', fn (Request $request) => Limit::perMinute(5)->by('register|'.$request->ip()));
        RateLimiter::for('admin-actions', fn (Request $request) => Limit::perMinute(60)->by('admin|'.$request->user()->id));
    }
}
