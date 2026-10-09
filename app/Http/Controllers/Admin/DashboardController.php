<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('manage-subjects');

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'level' => ['nullable', 'integer', 'between:1,9'],
        ]);

        $stats = [
            'subjects' => Subject::count(),
            'questions' => Question::count(),
            'levels' => Subject::distinct()->count('level'),
        ];

        if ($request->user()->role === 'admin') {
            $stats['students'] = User::where('role', 'student')->count();
        }

        return Inertia::render('AdminDashboardPage', [
            'stats' => $stats,
            'subjects' => Subject::query()
                ->withCount('questions')
                ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
                ->when($filters['level'] ?? null, fn ($query, $level) => $query->where('level', $level))
                ->orderBy('level')->orderBy('name')->orderBy('id')
                ->paginate(4)->withQueryString(),
            'filters' => $filters,
        ]);
    }
}
