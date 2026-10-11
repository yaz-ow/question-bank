<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display a listing of the students.
     */
    public function index(Request $request)
    {
        $this->authorize('admin', User::class);

        $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);
        $search = $request->input('search');
        $accounts = User::where('role', 'student');
        $total = (clone $accounts)->count();
        $active = (clone $accounts)->where('is_active', true)->count();

        $students = (clone $accounts)
            ->when($search !== null && $search !== '', function ($query) use ($search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('university_id', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($query) => $query
                ->where('is_active', $request->input('status') === 'active'))
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'university_id' => $student->university_id,
                    'is_active' => $student->is_active,
                    'created_at' => $student->created_at?->toDateString(),
                ];
            });

        return Inertia::render('Admin/StudentManagementPage', [
            'students' => $students,
            'filters' => $request->only('search', 'status'),
            'stats' => [
                'total' => $total,
                'active' => $active,
                'inactive' => $total - $active,
            ],
        ]);
    }

    /**
     * Toggle the active status of a student.
     */
    public function toggle(Request $request, User $user)
    {
        $this->authorize('admin', User::class);

        // Ensure the user is a student
        if ($user->role !== 'student') {
            return back()->with('error', 'يمكن فقط تبديل حالة الحساب للطلاب');
        }

        $request->validate(['is_active' => ['sometimes', 'required', 'boolean']]);
        $user->update(['is_active' => $request->has('is_active')
            ? $request->boolean('is_active') : ! $user->is_active]);

        return redirect()->back()->with(
            'success',
            $user->is_active
                ? 'تم تفعيل الحساب بنجاح'
                : 'تم تعطيل الحساب بنجاح'
        );
    }
}
