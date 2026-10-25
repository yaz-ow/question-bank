<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\User;
use App\Rules\BcryptPassword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class InstructorController extends Controller
{
    /**
     * Display instructor management, including the inline creation form.
     */
    public function index(Request $request)
    {
        $this->authorize('admin', User::class);

        $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $accounts = User::where('role', 'instructor');
        $total = (clone $accounts)->count();
        $active = (clone $accounts)->where('is_active', true)->count();
        $search = $request->input('search');
        $instructors = (clone $accounts)
            ->when($search !== null && $search !== '', fn ($query) => $query
                ->where(fn ($query) => $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")))
            ->when($request->filled('status'), fn ($query) => $query
                ->where('is_active', $request->input('status') === 'active'))
            ->orderBy('name')->orderBy('id')->paginate(10)->withQueryString()
            ->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at?->toDateString(),
            ]);

        return Inertia::render('Admin/InstructorCreationPage', [
            'instructors' => $instructors,
            'filters' => $request->only('search', 'status'),
            'stats' => ['total' => $total, 'active' => $active, 'inactive' => $total - $active],
            'subjects' => Subject::with('instructor:id,name')->orderBy('level')->orderBy('name')->orderBy('id')
                ->get(['id', 'name', 'level', 'instructor_id'])->map(fn ($subject) => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'level' => $subject->level,
                    'instructor_id' => $subject->instructor_id,
                    'instructor_name' => $subject->instructor?->name,
                ]),
        ]);
    }

    public function create(Request $request)
    {
        return $this->index($request);
    }

    /**
     * Store a newly created instructor in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('admin', User::class);

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'password' => ['required', 'confirmed', Password::defaults(), new BcryptPassword],
            'instructor_creation_code' => ['required', 'string', 'max:255'],
        ], [
            'instructor_creation_code.required' => 'رمز التفويض لإنشاء المدرّس مطلوب',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput($request->only('name', 'email'));
        }

        // Check the instructor creation code
        $code = config('admin.creation_code');

        if (empty($code) || ! hash_equals($code, $request->instructor_creation_code)) {
            return back()
                ->withInput($request->only('name', 'email'))
                ->withErrors(['instructor_creation_code' => 'رمز التفويض غير صحيح']);
        }

        // Create the instructor
        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'instructor',
            'is_active' => true,
        ]);

        // Regenerate session
        $request->session()->regenerate();

        return redirect()->route('admin.instructors.index')
            ->with('success', 'تم إنشاء حساب المدرّس بنجاح');
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('admin', User::class);
        abort_unless($user->role === 'instructor', 404);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);
        $user->update($data);

        return back()->with('success', 'تم تحديث بيانات المدرّس بنجاح');
    }

    public function toggle(Request $request, User $user)
    {
        $this->authorize('admin', User::class);
        abort_unless($user->role === 'instructor', 404);
        $data = $request->validate(['is_active' => ['required', 'boolean']]);
        $user->update($data);

        return back()->with('success', $user->is_active
            ? 'تم تفعيل حساب المدرّس بنجاح' : 'تم تعطيل حساب المدرّس بنجاح');
    }

    public function subjects(Request $request, User $user)
    {
        $this->authorize('admin', User::class);
        abort_unless($user->role === 'instructor', 404);
        $data = $request->validate([
            'subject_ids' => ['present', 'array', 'max:2000'],
            'subject_ids.*' => ['required', 'integer', 'distinct', 'exists:subjects,id'],
        ], [
            'subject_ids.present' => 'حدد المقررات المطلوبة أو احفظ قائمة فارغة لإلغاء الإسناد.',
            'subject_ids.array' => 'قائمة المقررات غير صحيحة.',
            'subject_ids.max' => 'يمكن إسناد 2000 مقرر كحد أقصى.',
            'subject_ids.*.required' => 'المقرر المحدد غير صحيح.',
            'subject_ids.*.integer' => 'المقرر المحدد غير صحيح.',
            'subject_ids.*.distinct' => 'لا يمكن تكرار المقرر في القائمة.',
            'subject_ids.*.exists' => 'أحد المقررات لم يعد موجودًا. حدّث الصفحة وحاول مجددًا.',
        ]);
        $ids = array_map('intval', $data['subject_ids']);

        DB::transaction(function () use ($user, $ids) {
            // Serialize changes to this teacher and lock every affected course in a stable order.
            $teacher = User::whereKey($user->id)->where('role', 'instructor')->lockForUpdate()->firstOrFail();
            $subjects = Subject::where(fn ($query) => $query->where('instructor_id', $teacher->id)
                ->orWhereIn('id', $ids))->orderBy('id')->lockForUpdate()->get();

            if ($subjects->whereIn('id', $ids)->count() !== count($ids)) {
                throw ValidationException::withMessages([
                    'subject_ids' => 'أحد المقررات لم يعد موجودًا. حدّث الصفحة وحاول مجددًا.',
                ]);
            }
            if ($subjects->whereIn('id', $ids)->contains(fn ($subject) => $subject->instructor_id !== null
                && $subject->instructor_id !== $teacher->id)) {
                throw ValidationException::withMessages([
                    'subject_ids' => 'أحد المقررات مسند إلى مدرس آخر. ألغِ إسناده أولًا ثم حاول مجددًا.',
                ]);
            }

            Subject::where('instructor_id', $teacher->id)->whereNotIn('id', $ids)->update(['instructor_id' => null]);
            Subject::whereIn('id', $ids)->update(['instructor_id' => $teacher->id]);
        }, 3);

        return back()->with('success', 'تم تحديث مقررات المدرّس بنجاح');
    }

    public function destroy(Request $request, User $user)
    {
        $this->authorize('admin', User::class);
        abort_unless($user->role === 'instructor', 404);

        $validator = Validator::make($request->all(), [
            'instructor_creation_code' => ['required', 'string', 'max:255'],
        ], [
            'instructor_creation_code.required' => 'رمز المؤسس مطلوب لتأكيد الحذف',
            'instructor_creation_code.string' => 'رمز المؤسس غير صحيح',
            'instructor_creation_code.max' => 'رمز المؤسس غير صحيح',
        ]);
        // Return errors without flashing the secret into session input or page props.
        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $code = config('admin.creation_code');
        if (empty($code) || ! hash_equals((string) $code, $request->input('instructor_creation_code'))) {
            return back()->withErrors(['instructor_creation_code' => 'رمز المؤسس غير صحيح']);
        }

        DB::transaction(function () use ($user) {
            PasswordBroker::deleteToken($user);
            $user->delete();
        });

        return redirect()->route('admin.instructors.index')
            ->with('success', 'تم حذف حساب المدرّس بنجاح');
    }
}
