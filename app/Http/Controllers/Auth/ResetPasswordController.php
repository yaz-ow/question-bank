<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ResetPasswordController extends Controller
{
    /**
     * Show the student password reset form.
     */
    public function studentShow(string $token)
    {
        return Inertia::render('ResetPasswordStudentPage', ['token' => $token]);
    }

    /**
     * Handle student password reset request.
     */
    public function studentStore(Request $request): RedirectResponse
    {
        try {
            $request->validate([
                'token' => ['required', 'string'],
                'university_id' => ['required', 'string'],
                'email' => ['required', 'string', 'email'],
                'password' => ['required', 'confirmed', PasswordRule::defaults()],
            ]);
        } catch (ValidationException $e) {
            return redirect()->back()
                ->withInput($request->only('email'))
                ->withErrors($e->errors());
        }

        // Normalize university ID input
        $university_id = strtoupper(trim($request->university_id));

        // Find student by university_id and email to verify identity
        $user = User::where('university_id', $university_id)
            ->where('email', $request->email)
            ->where('role', 'student')
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'university_id' => ['الحقائق غير صحيحة'], // Arabic: Invalid credentials
            ]);
        }

        // Validate the token and reset password
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                // Rotate persistent login tokens and invalidate database sessions.
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                if (config('session.driver') === 'database') {
                    DB::connection(config('session.connection'))
                        ->table(config('session.table', 'sessions'))
                        ->where('user_id', $user->getKey())->delete();
                }

                event(new PasswordReset($user));
            }
        );

        // Only proceed if password reset was successful
        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('login-student.show')
                ->with('success', 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول'); // Arabic: Password has been reset successfully. You can now log in
        }

        return back()->withInput($request->only('email'))
            ->withErrors(['email' => __($status)]);
    }

    /**
     * Show the admin/instructor password reset form.
     */
    public function adminShow(string $token)
    {
        return Inertia::render('ResetPasswordAdminPage', ['token' => $token]);
    }

    /**
     * Handle admin/instructor password reset request.
     */
    public function adminStore(Request $request): RedirectResponse
    {
        try {
            $request->validate([
                'token' => ['required', 'string'],
                'email' => ['required', 'string', 'email'],
                'password' => ['required', 'confirmed', PasswordRule::defaults()],
            ]);
        } catch (ValidationException $e) {
            return redirect()->back()
                ->withInput($request->only('email'))
                ->withErrors($e->errors());
        }

        // Find user by email and check if they are instructor or admin
        $user = User::where('email', $request->email)
            ->whereIn('role', ['instructor', 'admin'])
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['الحقائق غير صحيحة'], // Arabic: Invalid credentials
            ]);
        }

        // Validate the token and reset password
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                // Rotate persistent login tokens and invalidate database sessions.
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                if (config('session.driver') === 'database') {
                    DB::connection(config('session.connection'))
                        ->table(config('session.table', 'sessions'))
                        ->where('user_id', $user->getKey())->delete();
                }

                event(new PasswordReset($user));
            }
        );

        // Only proceed if password reset was successful
        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('login-admin.show')
                ->with('success', 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول'); // Arabic: Password has been reset successfully. You can now log in
        }

        return back()->withInput($request->only('email'))
            ->withErrors(['email' => __($status)]);
    }
}
