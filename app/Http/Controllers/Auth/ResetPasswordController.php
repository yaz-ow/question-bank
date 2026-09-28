<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class ResetPasswordController extends Controller
{
    /**
     * Show the student password reset form.
     */
    public function studentShow(string $token)
    {
        return view('auth.reset-student', ['token' => $token]);
    }

    /**
     * Handle student password reset request.
     */
    public function studentStore(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'university_id' => ['required', 'string'],
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        // Normalize university ID input
        $university_id = strtoupper(trim($request->university_id));

        // Find student by university_id and email to verify identity
        $user = User::where('university_id', $university_id)
                    ->where('email', $request->email)
                    ->where('role', 'student')
                    ->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'university_id' => ['الحقائق غير صحيحة'], // Arabic: Invalid credentials
            ]);
        }

        // Validate the token and reset password
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    // Ensure the account remains student and active status unchanged
                ])->setRememberToken(Hash::make($password))->save();
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
        return view('auth.reset-admin', ['token' => $token]);
    }

    /**
     * Handle admin/instructor password reset request.
     */
    public function adminStore(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        // Find user by email and check if they are instructor or admin
        $user = User::where('email', $request->email)
                    ->whereIn('role', ['instructor', 'admin'])
                    ->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['الحقائق غير صحيحة'], // Arabic: Invalid credentials
            ]);
        }

        // Validate the token and reset password
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    // Ensure role and active status remain unchanged
                ])->setRememberToken(Hash::make($password))->save();
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