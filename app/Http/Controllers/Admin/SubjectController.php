<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class SubjectController extends Controller
{
    /**
     * Display a listing of the subjects (courses).
     */
    public function index(Request $request)
    {
        // Authorization check
        abort_if(Gate::denies('subject_access'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        // Get search and filter parameters
        $search = $request->input('search');
        $level = $request->input('level');

        // Build query
        $query = Subject::query();

        // Apply search if provided
        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        // Apply level filter if provided
        if ($level && in_array((int)$level, range(1, 9))) {
            $query->where('level', (int)$level);
        }

        // Get subjects with pagination
        $subjects = $query->orderBy('level')
                         ->orderBy('name')
                         ->paginate(10)
                         ->withQueryString();

        return view('admin.subjects.index', compact('subjects', 'search', 'level'));
    }

    /**
     * Show the form for creating a new subject.
     */
    public function create()
    {
        // Authorization check
        abort_if(Gate::denies('subject_create'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.subjects.create');
    }

    /**
     * Store a newly created subject in storage.
     */
    public function store(Request $request)
    {
        // Authorization check
        abort_if(Gate::denies('subject_create'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        // Validate request
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'level' => [
                'required',
                'integer',
                'min:1',
                'max:9',
            ],
        ], [
            'name.required' => 'اسم الدورة مطلوب',
            'name.string' => 'اسم الدورة يجب أن يكون نصًا',
            'name.max' => 'اسم الدورة لا يجب أن يتجاوز 255 حرفًا',
            'level.required' => 'المستوى مطلوب',
            'level.integer' => 'المستوى يجب أن يكون رقمًا صحيحًا',
            'level.min' => 'المستوى يجب أن يكون بين 1 و 9',
            'level.max' => 'المستوى يجب أن يكون بين 1 و 9',
        ]);

        // Check for duplicate name within the same level
        $exists = Subject::where('name', $request->name)
                        ->where('level', $request->level)
                        ->exists();

        if ($exists) {
            return back()
                ->withInput()
                ->withErrors(['name' => 'اسم الدورة موجود بالفعل لهذا المستوى']);
        }

        // Create the subject
        $subject = Subject::create([
            'name' => trim($request->name),
            'level' => (int)$request->level,
        ]);

        return redirect()->route('admin.subjects.index')
            ->with('success', 'تم إنشاء الدورة بنجاح');
    }

    /**
     * Display the specified subject.
     */
    public function show(Subject $subject)
    {
        // Authorization check
        abort_if(Gate::denies('subject_view'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.subjects.show', compact('subject'));
    }

    /**
     * Show the form for editing the specified subject.
     */
    public function edit(Subject $subject)
    {
        // Authorization check
        abort_if(Gate::denies('subject_update'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        return view('admin.subjects.edit', compact('subject'));
    }

    /**
     * Update the specified subject in storage.
     */
    public function update(Request $request, Subject $subject)
    {
        // Authorization check
        abort_if(Gate::denies('subject_update'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        // Validate request
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'level' => [
                'required',
                'integer',
                'min:1',
                'max:9',
            ],
        ], [
            'name.required' => 'اسم الدورة مطلوب',
            'name.string' => 'اسم الدورة يجب أن يكون نصًا',
            'name.max' => 'اسم الدورة لا يجب أن يتجاوز 255 حرفًا',
            'level.required' => 'المستوى مطلوب',
            'level.integer' => 'المستوى يجب أن يكون رقمًا صحيحًا',
            'level.min' => 'المستوى يجب أن يكون بين 1 و 9',
            'level.max' => 'المستوى يجب أن يكون بين 1 و 9',
        ]);

        // Check for duplicate name within the same level (excluding current subject)
        $exists = Subject::where('name', $request->name)
                        ->where('level', $request->level)
                        ->where('id', '!=', $subject->id)
                        ->exists();

        if ($exists) {
            return back()
                ->withInput()
                ->withErrors(['name' => 'اسم الدورة موجود بالفعل لهذا المستوى']);
        }

        // Update the subject
        $subject->update([
            'name' => trim($request->name),
            'level' => (int)$request->level,
        ]);

        return redirect()->route('admin.subjects.index')
            ->with('success', 'تم تحديث الدورة بنجاح');
    }

    /**
     * Remove the specified subject from storage.
     */
    public function destroy(Subject $subject)
    {
        // Authorization check
        abort_if(Gate::denies('subject_delete'), Response::HTTP_FORBIDDEN, '403 Forbidden');

        // Delete the subject
        $subject->delete();

        return redirect()->route('admin.subjects.index')
            ->with('success', 'تم حذف الدورة بنجاح');
    }
}