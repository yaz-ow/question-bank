<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage-subjects');
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'level' => ['nullable', 'integer', 'between:1,9'],
        ]);

        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => Subject::query()
                ->when($filters['search'] ?? null, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
                ->when($filters['level'] ?? null, fn ($q, $level) => $q->where('level', $level))
                ->orderBy('level')->orderBy('name')->paginate(10)->withQueryString(),
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        $this->authorize('manage-subjects');

        return Inertia::render('Admin/Subjects/Form');
    }

    public function store(Request $request)
    {
        $this->authorize('manage-subjects');
        Subject::create($this->validatedData($request));

        return redirect()->route('admin.subjects.index')->with('success', 'تم إنشاء المقرر بنجاح');
    }

    public function show(Subject $subject)
    {
        $this->authorize('manage-subjects');

        return Inertia::render('Admin/Subjects/Show', ['subject' => $subject]);
    }

    public function edit(Subject $subject)
    {
        $this->authorize('manage-subjects');

        return Inertia::render('Admin/Subjects/Form', ['subject' => $subject]);
    }

    public function update(Request $request, Subject $subject)
    {
        $this->authorize('manage-subjects');
        $subject->update($this->validatedData($request, $subject));

        return redirect()->route('admin.subjects.index')->with('success', 'تم تحديث المقرر بنجاح');
    }

    public function destroy(Subject $subject)
    {
        $this->authorize('manage-subjects');
        $subject->delete();

        return redirect()->route('admin.subjects.index')->with('success', 'تم حذف المقرر بنجاح');
    }

    private function validatedData(Request $request, ?Subject $subject = null): array
    {
        $request->merge(['name' => is_string($request->name) ? trim($request->name) : $request->name]);
        $unique = Rule::unique('subjects', 'name')->where('level', $request->input('level'));
        if ($subject) {
            $unique->ignore($subject);
        }

        return $request->validate([
            'name' => ['required', 'string', 'max:255', $unique],
            'level' => ['required', 'integer', 'between:1,9'],
        ], ['name.unique' => 'اسم المقرر موجود بالفعل لهذا المستوى']);
    }
}
