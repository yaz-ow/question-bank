<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LoginController extends Controller
{
    /**
     * Show the student login form.
     */
    public function studentShow()
    {
        return Inertia::render('LoginStudentPage');
    }

    /**
     * Handle student login request (using university ID).
     */
    public function studentStore(Request $request): RedirectResponse
    {
        try {
            $request->validate([
                'university_id' => ['required', 'string'],
                'password' => ['required', 'string'],
            ]);

            // Normalize university ID input
            $university_id = strtoupper(trim($request->university_id));

            // Find user by university_id
            $user = User::where('university_id', $university_id)->first();

            // Validate credentials and check if user is active student
            if (! $user ||
                ! Hash::check($request->password, $user->password) ||
                $user->role !== 'student' ||
                ! $user->is_active) {
                throw ValidationException::withMessages([
                    'university_id' => ['بيانات الدخول غير صحيحة'], // Arabic: Invalid credentials
                ]);
            }

            Auth::login($user);
            $request->session()->regenerate();

            return redirect()->intended(route('student.dashboard'))
                ->with('success', 'مرحبا بعودتك'); // Arabic: Welcome back
        } catch (ValidationException $e) {
            return redirect()->route('login-student.show')
                ->withInput($request->only('university_id'))
                ->withErrors($e->errors());
        }
    }

    /**
     * Show the admin login form.
     */
    public function adminShow()
    {
        return Inertia::render('LoginAdminPage');
    }

    /**
     * Handle admin/login request (using email).
     */
    public function adminStore(Request $request): RedirectResponse
    {
        try {
            $request->validate([
                'email' => ['required', 'string', 'email'],
                'password' => ['required', 'string'],
            ]);

            // Find user by email
            $user = User::where('email', $request->email)->first();

            // Validate credentials and check if user is admin or instructor and active
            if (! $user ||
                ! Hash::check($request->password, $user->password) ||
                ! in_array($user->role, ['instructor', 'admin']) ||
                ! $user->is_active) {
                throw ValidationException::withMessages([
                    'email' => ['بيانات الدخول غير صحيحة'], // Arabic: Invalid credentials
                ]);
            }

            Auth::login($user);
            $request->session()->regenerate();

            return redirect()->intended(route('admin.dashboard'))
                ->with('success', 'مرحبا بعودتك'); // Arabic: Welcome back
        } catch (ValidationException $e) {
            return redirect()->route('login-admin.show')
                ->withInput($request->only('email'))
                ->withErrors($e->errors());
        }
    }

    /**
     * Handle logout.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
