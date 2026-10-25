<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Instructor/Courses', [
            'courses' => $request->user()->subjects()->withCount('questions')
                ->orderBy('level')->orderBy('name')->orderBy('id')->get(['id', 'name', 'level']),
        ]);
    }
}
