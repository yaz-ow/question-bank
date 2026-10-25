<?php

namespace App\Providers;

use App\Models\Subject;
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
        Gate::define('manage-subjects', fn (User $user) => $user->is_active && $user->role === 'admin');
        Gate::define('manage-questions', fn (User $user, Subject $subject) => $user->is_active
            && ($user->role === 'admin' || ($user->role === 'instructor' && $subject->instructor_id === $user->id)));
        Gate::define('student', fn (User $user) => $user->is_active && $user->role === 'student');
        Gate::define('view-student-results', fn (User $user, ?Subject $subject = null) => $user->is_active
            && ($user->role === 'admin' || ($user->role === 'instructor'
                && ($subject === null || $subject->instructor_id === $user->id))));

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
        RateLimiter::for('instructor-deletions', fn (Request $request) => Limit::perMinute(5)
            ->by('instructor-delete|'.$request->user()->id.'|'.$request->ip()));
        RateLimiter::for('quiz-starts', fn (Request $request) => Limit::perMinute(10)->by('quiz-start|'.$request->user()->id));
        RateLimiter::for('quiz-actions', fn (Request $request) => Limit::perMinute(120)->by('quiz-action|'.$request->user()->id));
    }
}
