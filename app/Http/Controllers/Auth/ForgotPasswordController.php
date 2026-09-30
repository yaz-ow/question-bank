<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ForgotPasswordController extends Controller
{
    /**
     * Show the student password reset request form.
     */
    public function studentShow()
    {
        return Inertia::render('ForgotPasswordStudentPage');
    }

    /**
     * Handle student password reset request (university ID and email).
     */
    public function studentStore(Request $request): RedirectResponse
    {
        try {
            $request->validate([
                'university_id' => ['required', 'string'],
                'email' => ['required', 'string', 'email'],
            ]);
        } catch (ValidationException $e) {
            return redirect()->route('password-request-student.show')
                ->withInput($request->only('university_id', 'email'))
                ->withErrors($e->errors());
        }

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
            Password::sendResetLink(
                $user->only('email')
            );
        }

        // Generic response regardless of whether account exists
        return redirect()->route('password-request-student.show')
            ->with(['status' => 'إذا كانت التفاصيل صحيحة، سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني']);
    }

    /**
     * Show the admin/instructor password reset request form.
     */
    public function adminShow()
    {
        return Inertia::render('ForgotPasswordAdminPage');
    }

    /**
     * Handle admin/instructor password reset request (email only).
     */
    public function adminStore(Request $request): RedirectResponse
    {
        try {
            $request->validate([
                'email' => ['required', 'string', 'email'],
            ]);
        } catch (ValidationException $e) {
            return redirect()->route('password-request-admin.show')
                ->withInput($request->only('email'))
                ->withErrors($e->errors());
        }

        // Find user by email and check if they are instructor or admin
        $user = User::where('email', $request->email)
            ->whereIn('role', ['instructor', 'admin'])
            ->first();

        // Always show same message to prevent information disclosure
        if ($user) {
            Password::sendResetLink(
                $user->only('email')
            );
        }

        // Generic response regardless of whether account exists
        return redirect()->route('password-request-admin.show')
            ->with(['status' => 'إذا كانت التفاصيل صحيحة، سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني']);
    }
}
