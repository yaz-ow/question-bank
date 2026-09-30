<?php

use App\Http\Controllers\Admin\InstructorController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ResetPasswordController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

// Student registration
Route::get('/register', function () {
    return Inertia::render('RegisterPage');
})->name('register');
Route::post('/register', [RegisterController::class, 'store'])->middleware('throttle:registration');

// Student login
Route::get('/login/student', function () {
    return Inertia::render('LoginStudentPage');
})->name('login-student.show');
Route::post('/login/student', [LoginController::class, 'studentStore'])->name('login-student.store')->middleware('throttle:authentication');

// Admin login
Route::get('/login/admin', function () {
    return Inertia::render('LoginAdminPage');
})->name('login-admin.show');
Route::post('/login/admin', [LoginController::class, 'adminStore'])->name('login-admin.store')->middleware('throttle:authentication');

// Logout
Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

// Password reset request forms
Route::get('/password/request/student', function () {
    return Inertia::render('ForgotPasswordStudentPage');
})->name('password-request-student.show');
Route::get('/password/request/admin', function () {
    return Inertia::render('ForgotPasswordAdminPage');
})->name('password-request-admin.show');

// Password reset request handling
Route::post('/password/request/student', [ForgotPasswordController::class, 'studentStore'])->name('password-request-store')->middleware('throttle:authentication');
Route::post('/password/request/admin', [ForgotPasswordController::class, 'adminStore'])->name('password-request-admin')->middleware('throttle:authentication');

// Password reset forms
Route::get('/password/reset/student/{token}', function ($token) {
    return Inertia::render('ResetPasswordStudentPage', ['token' => $token, 'email' => request()->query('email', '')]);
})->name('password-reset.student');
Route::get('/password/reset/admin/{token}', function ($token) {
    return Inertia::render('ResetPasswordAdminPage', ['token' => $token, 'email' => request()->query('email', '')]);
})->name('password-reset.admin');

// Password reset handling
Route::post('/password/reset/student', [ResetPasswordController::class, 'studentStore'])->name('password-reset.student.store')->middleware('throttle:authentication');
Route::post('/password/reset/admin', [ResetPasswordController::class, 'adminStore'])->name('password-reset.admin.store')->middleware('throttle:authentication');

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('WelcomePage');
});

// Student and admin dashboards
Route::middleware(['auth', 'active', 'auth.session'])->group(function () {
    Route::get('/student/dashboard', function () {
        return Inertia::render('StudentDashboardPage');
    })->name('student.dashboard')->middleware('role:student');

    Route::middleware(['role:admin,instructor'])->group(function () {
        Route::get('/admin/dashboard', function () {
            return Inertia::render('AdminDashboardPage');
        })->name('admin.dashboard');

        Route::resource('admin/subjects', SubjectController::class)->names('admin.subjects');

        Route::middleware(['role:admin'])->group(function () {
            // Admin student management
            Route::get('/admin/students', [StudentController::class, 'index'])->name('admin.students.index');
            Route::post('/admin/students/{user}/toggle', [StudentController::class, 'toggle'])->name('admin.students.toggle')->middleware('throttle:admin-actions');

            // Admin instructor creation
            Route::get('/admin/instructors/create', [InstructorController::class, 'create'])->name('admin.instructors.create');
            Route::post('/admin/instructors', [InstructorController::class, 'store'])->name('admin.instructors.store')->middleware('throttle:admin-actions');
        });
    });
});
