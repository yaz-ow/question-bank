<?php

use App\Http\Controllers\Admin\InstructorController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\Questions\QuestionController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Student\QuizController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Excel;
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

    // Student academic browsing
    Route::middleware('role:student')->prefix('student')->name('student.')->group(function () {
        Route::post('courses/{subject}/quizzes', [QuizController::class, 'store'])
            ->name('quizzes.store')->middleware('throttle:10,1');
        Route::get('quizzes/{attempt}', [QuizController::class, 'show'])->name('quizzes.show');
        Route::post('quizzes/{attempt}/answer', [QuizController::class, 'answer'])
            ->name('quizzes.answer')->middleware('throttle:120,1');
        Route::post('quizzes/{attempt}/next', [QuizController::class, 'next'])
            ->name('quizzes.next')->middleware('throttle:120,1');
        Route::post('quizzes/{attempt}/abandon', [QuizController::class, 'abandon'])
            ->name('quizzes.abandon')->middleware('throttle:120,1');
        Route::post('quizzes/{attempt}/retry', [QuizController::class, 'retry'])
            ->name('quizzes.retry')->middleware('throttle:10,1');
    });

    Route::get('/student/levels', [\App\Http\Controllers\Student\AcademicController::class, 'levels'])
        ->name('student.levels')->middleware('role:student');
    Route::get('/student/level/{level}/courses', [\App\Http\Controllers\Student\AcademicController::class, 'levelCourses'])
        ->name('student.level.courses')->middleware('role:student');
    Route::get('/student/level/{level}/course/{id}', [\App\Http\Controllers\Student\AcademicController::class, 'courseDetails'])
        ->name('student.course.details')->middleware('role:student');

    Route::middleware(['auth', 'active', 'auth.session', 'role:admin,instructor'])->group(function () {
        Route::get('/admin/dashboard', function () {
            return Inertia::render('AdminDashboardPage');
        })->name('admin.dashboard');

        Route::resource('admin/subjects', SubjectController::class)->names('admin.subjects');

        // Question management routes nested under subjects
        Route::prefix('admin/subjects/{subject}')->group(function () {
            // Excel import/export routes
            Route::get('questions/download-template', [QuestionController::class, 'downloadTemplate'])
                ->name('admin.questions.download.template');
            Route::post('questions/upload-preview', [QuestionController::class, 'uploadPreview'])
                ->name('admin.questions.upload.preview');
            Route::post('questions/import-confirm', [QuestionController::class, 'importConfirm'])
                ->name('admin.questions.import.confirm');

            Route::resource('questions', QuestionController::class)
                ->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'])
                ->names('admin.questions');
        });

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
