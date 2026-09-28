<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ForgotPasswordController extends Controller
{
    /**
     * Show the student password reset request form.
     */
    public function studentShow()
    {
        return view('auth.forgot-student');
    }

    /**
     * Handle student password reset request (university ID and email).
     */
    public function studentStore(Request $request): RedirectResponse
    {
        $request->validate([
            'university_id' => ['required', 'string'],
            'email' => ['required', 'string', 'email'],
        ]);

        // Normalize university ID input
        $university_id = strtoupper(trim($request->university_id));

        // Find user by both university_id and email to prevent information disclosure
        $user = User::where('university_id', $university_id)
                    ->where('email', $request->email)
                    ->where('role', 'student')
                    ->first();

        // Always show same message to prevent information disclosure
        // But only actually send reset link if credentials match
        if ($user) {
            $status = Password::sendResetLink(
                $user->only('email')
            );

            return $status === Password::RESET_LINK_SENT
                ? back()->with(['status' => __($status)])
                : back()->withInput($request->only('email'))
                        ->withErrors(['email' => __($status)]);
        }

        // Generic response regardless of whether account exists
        return back()->with(['status' => 'إذا كانت التفاصيل صحيحة، سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني']); // Arabic: If details are correct, password reset link will be sent to your email
    }

    /**
     * Show the admin/instructor password reset request form.
     */
    public function adminShow()
    {
        return view('auth.forgot-admin');
    }

    /**
     * Handle admin/instructor password reset request (email only).
     */
    public function adminStore(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        // Find user by email and check if they are instructor or admin
        $user = User::where('email', $request->email)
                    ->whereIn('role', ['instructor', 'admin'])
                    ->first();

        // Always show same message to prevent information disclosure
        if ($user) {
            $status = Password::sendResetLink(
                $user->only('email')
            );

            return $status === Password::RESET_LINK_SENT
                ? back()->with(['status' => __($status)])
                : back()->withInput($request->only('email'))
                        ->withErrors(['email' => __($status)]);
        }

        // Generic response regardless of whether account exists
        return back()->with(['status' => 'إذا كانت التفاصيل صحيحة، سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني']); // Arabic: If details are correct, password reset link will be sent to your email
    }
}