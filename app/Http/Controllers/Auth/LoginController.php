<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * Show the student login form.
     */
    public function studentShow()
    {
        return view('auth.login-student');
    }

    /**
     * Handle student login request (using university ID).
     */
    public function studentStore(Request $request): RedirectResponse
    {
        $request->validate([
            'university_id' => ['required', 'string'],
            'password' => ['required'],
        ]);

        // Normalize university ID input
        $university_id = strtoupper(trim($request->university_id));

        // Find user by university_id
        $user = User::where('university_id', $university_id)->first();

        // Validate credentials and check if user is active student
        if (!$user ||
            !Hash::check($request->password, $user->password) ||
            $user->role !== 'student' ||
            !$user->is_active) {
            throw ValidationException::withMessages([
                'university_id' => ['الحقائق غير صحيحة'], // Arabic: Invalid credentials
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('student.dashboard'))
            ->with('success', 'مرحبا بعودتك'); // Arabic: Welcome back
    }

    /**
     * Show the admin login form.
     */
    public function adminShow()
    {
        return view('auth.login-admin');
    }

    /**
     * Handle admin/login request (using email).
     */
    public function adminStore(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required'],
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Validate credentials and check if user is admin or instructor and active
        if (!$user ||
            !Hash::check($request->password, $user->password) ||
            !in_array($user->role, ['instructor', 'admin']) ||
            !$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['الحقائق غير صحيحة'], // Arabic: Invalid credentials
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard'))
            ->with('success', 'مرحبا بعودتك'); // Arabic: Welcome back
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