<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Inertia;
use Illuminate\Support\Str;

class InstructorController extends Controller
{
    /**
     * Show the form for creating a new instructor.
     */
    public function create()
    {
        $this->authorize('admin', User::class);

        return Inertia::render('Admin/InstructorCreationPage');
    }

    /**
     * Store a newly created instructor in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('admin', User::class);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'password' => ['required', 'confirmed', Password::defaults()],
            'instructor_creation_code' => ['required', 'string'],
        ], [
            'instructor_creation_code.required' => 'رمز إنشاء المدرب مطلوب',
        ]);

        // Check the instructor creation code
        $code = config('admin.creation_code');

        if (empty($code) || !hash_equals($code, $request->instructor_creation_code)) {
            return back()
                ->withInput($request->except('password', 'password_confirmation', 'instructor_creation_code'))
                ->withErrors(['instructor_creation_code' => 'رمز إنشاء المدرب غير صحيح']);
        }

        // Create the instructor
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'instructor',
            'is_active' => true,
        ]);

        // Regenerate session
        $request->session()->regenerate();

        return redirect()->route('admin.dashboard')
            ->with('success', 'تم إنشاء حساب المدرب بنجاح');
    }
}
