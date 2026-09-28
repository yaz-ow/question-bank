<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

// Student registration
Route::get('/register', [RegisterController::class, 'create'])->name('register');
Route::post('/register', [RegisterController::class, 'store']);

// Student login
Route::get('/login/student', [LoginController::class, 'studentShow'])->name('login-student.show');
Route::post('/login/student', [LoginController::class, 'studentStore'])->name('login-student.store');

// Admin login
Route::get('/login/admin', [LoginController::class, 'adminShow'])->name('login-admin.show');
Route::post('/login/admin', [LoginController::class, 'adminStore'])->name('login-admin.store');

// Logout
Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

// Password reset request forms
Route::get('/password/request/student', [ForgotPasswordController::class, 'studentShow'])->name('password-request-student.show');
Route::get('/password/request/admin', [ForgotPasswordController::class, 'adminShow'])->name('password-request-admin.show');

// Password reset request handling
Route::post('/password/request/student', [ForgotPasswordController::class, 'studentStore'])->name('password-request-store');
Route::post('/password/request/admin', [ForgotPasswordController::class, 'adminStore'])->name('password-request-admin');

// Password reset forms
Route::get('/password/reset/student/{token}', [ResetPasswordController::class, 'studentShow'])->name('password-reset.student');
Route::get('/password/reset/admin/{token}', [ResetPasswordController::class, 'adminShow'])->name('password-reset.admin');

// Password reset handling
Route::post('/password/reset', [ResetPasswordController::class, 'studentStore'])->name('password-reset.student.store');
Route::post('/password/reset', [ResetPasswordController::class, 'adminStore'])->name('password-reset.admin.store');

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('welcome');
});
