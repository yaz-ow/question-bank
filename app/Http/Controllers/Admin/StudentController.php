<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Inertia;

class StudentController extends Controller
{
    /**
     * Display a listing of the students.
     */
    public function index(Request $request)
    {
        $this->authorize('admin', User::class);

        $search = $request->input('search');

        $students = User::where('role', 'student')
            ->when($search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('university_id', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'university_id' => $student->university_id,
                    'is_active' => $student->is_active,
                ];
            });

        return Inertia::render('Admin/StudentManagementPage', [
            'students' => $students,
            'filters' => $request->only('search'),
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

        $user->toggle('is_active');

        return redirect()->back()->with(
            $user->is_active ? 'success' : 'error',
            $user->is_active
                ? 'تم تفعيل الحساب بنجاح'
                : 'تم تعطيل الحساب بنجاح'
        );
    }
}
