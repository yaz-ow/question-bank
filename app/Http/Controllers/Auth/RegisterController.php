<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class RegisterController extends Controller
{
    /**
     * Show the student registration form.
     */
    public function create()
    {
        return Inertia::render('RegisterPage');
    }

    /**
     * Handle student registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->merge(['university_id' => is_string($request->university_id)
            ? strtoupper(trim($request->university_id)) : $request->university_id]);

        try {
            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    'unique:users,email',
                ],
                'university_id' => [
                    'required',
                    'string',
                    'max:10',
                    'unique:users,university_id',
                    'regex:/^M[0-9]{9}$/',
                ],
                'password' => ['required', 'confirmed', Password::defaults()],
            ]);
        } catch (ValidationException $e) {
            return redirect()->route('register')
                ->withInput($request->only('name', 'email', 'university_id'))
                ->withErrors($e->errors());
        }

        // Normalize university ID (trim whitespace, uppercase)
        $university_id = strtoupper(trim($request->university_id));

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'university_id' => $university_id,
            'role' => 'student', // Always student for public registration
            'is_active' => true, // Always active for public registration
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->intended(route('student.dashboard'))
            ->with('success', 'حسابك تم إنشاؤه بنجاح'); // Arabic: Your account has been created successfully
    }
}
