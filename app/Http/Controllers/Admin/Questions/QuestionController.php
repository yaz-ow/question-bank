<?php

namespace App\Http\Controllers\Admin\Questions;

use App\Http\Controllers\Controller;
use App\Imports\QuestionPreviewRows;
use App\Imports\QuestionsImportTemplate;
use App\Models\Question;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class QuestionController extends Controller
{
    private const FIELDS = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'];

    private const PAGE_SIZE = 6;

    public function index(Request $request, Subject $subject)
    {
        $this->authorize('manage-questions', $subject);
        $filters = $request->validate(['search' => ['nullable', 'string', 'max:1000']]);
        $pending = $request->session()->get($this->importKey($request, $subject));

        return Inertia::render('Admin/Questions/Index', [
            'subject' => $subject->loadCount('questions'),
            'questions' => $subject->questions()
                ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('question_text', 'like', "%{$search}%"))
                ->orderByDesc('id')->paginate(self::PAGE_SIZE)->withQueryString(),
            'filters' => $filters,
            'importPreview' => $pending && ($pending['expires_at'] ?? 0) > now()->timestamp
                ? ($pending['preview'] ?? null) : null,
        ]);
    }

    // Existing bookmarks remain available; the workspace itself uses inline forms.
    public function create(Subject $subject)
    {
        $this->authorize('manage-questions', $subject);

        return Inertia::render('Admin/Questions/Form', ['subject' => $subject, 'question' => null]);
    }

    public function store(Request $request, Subject $subject)
    {
        $this->authorize('manage-questions', $subject);
        $subject->questions()->create($this->validatedQuestion($request));

        return redirect()->route('admin.questions.index', $subject->id)
            ->with('success', 'تم إنشاء السؤال بنجاح');
    }

    public function show(Subject $subject, Question $question)
    {
        $this->authorize('manage-questions', $subject);
        abort_unless($question->subject_id === $subject->id, 404);

        return Inertia::render('Admin/Questions/Show', ['subject' => $subject, 'question' => $question]);
    }

    public function edit(Subject $subject, Question $question)
    {
        $this->authorize('manage-questions', $subject);
        abort_unless($question->subject_id === $subject->id, 404);

        return Inertia::render('Admin/Questions/Form', ['subject' => $subject, 'question' => $question]);
    }

    public function update(Request $request, Subject $subject, Question $question)
    {
        $this->authorize('manage-questions', $subject);
        abort_unless($question->subject_id === $subject->id, 404);
        $question->update($this->validatedQuestion($request));

        return $this->workspaceRedirect($request, $subject)->with('success', 'تم تحديث السؤال بنجاح');
    }

    public function destroy(Request $request, Subject $subject, Question $question)
    {
        $this->authorize('manage-questions', $subject);
        abort_unless($question->subject_id === $subject->id, 404);
        $question->delete();

        return $this->workspaceRedirect($request, $subject)->with('success', 'تم حذف السؤال بنجاح');
    }

    public function downloadTemplate(Subject $subject)
    {
        $this->authorize('manage-questions', $subject);

        return Excel::download(new QuestionsImportTemplate($subject->id), 'questions_template.xlsx');
    }

    public function uploadPreview(Request $request, Subject $subject)
    {
        $this->authorize('manage-questions', $subject);
        $key = $this->importKey($request, $subject);
        // A failed replacement must never leave the previous file confirmable.
        $request->session()->forget($key);
        $request->validate(['file' => ['required', 'file', 'mimes:xlsx,xls,csv,txt', 'max:5120']]);

        try {
            $sheets = Excel::toCollection(new QuestionPreviewRows, $request->file('file'));
            $source = $sheets->first() ?? collect();
            if ($source->isNotEmpty() && array_diff(self::FIELDS, array_keys($source->first()->toArray()))) {
                return back()->withErrors(['file' => 'أعمدة الملف غير مطابقة. حمّل قالب Excel واستخدم أعمدته دون تغيير أسمائها.']);
            }

            $rows = [];
            $unique = [];
            $seen = [];
            $errorCount = 0;
            $duplicateCount = 0;
            foreach ($source as $index => $raw) {
                if (collect($raw)->every(fn ($value) => $value === null || (is_scalar($value) && trim((string) $value) === ''))) {
                    continue;
                }
                if (count($rows) >= 1000) {
                    return back()->withErrors(['file' => 'الحد الأقصى 1000 سؤال في الملف الواحد. قسّم الملف ثم أعد رفعه.']);
                }
                $row = [];
                foreach (self::FIELDS as $field) {
                    $value = $raw[$field] ?? '';
                    $row[$field] = is_scalar($value) ? trim((string) $value) : '';
                }
                $row['correct_answer'] = strtoupper($row['correct_answer']);
                $row['correct_answer'] = ['أ' => 'A', 'ا' => 'A', 'ب' => 'B', 'ج' => 'C', 'د' => 'D'][$row['correct_answer']] ?? $row['correct_answer'];
                $validator = Validator::make($row, $this->questionRules(), $this->questionMessages());
                $errors = $validator->errors()->all();
                $status = 'ready';
                if ($errors) {
                    $status = 'error';
                    $errorCount++;
                } else {
                    $fingerprint = hash('sha256', json_encode($row, JSON_UNESCAPED_UNICODE));
                    if (isset($seen[$fingerprint]) || $subject->questions()->where($row)->exists()) {
                        $status = 'duplicate';
                        $duplicateCount++;
                    } else {
                        $unique[] = $row;
                    }
                    $seen[$fingerprint] = true;
                }
                $rows[] = array_merge($row, ['line' => $index + 2, 'status' => $status, 'errors' => $errors]);
            }

            if (! $rows) {
                return back()->withErrors(['file' => 'الملف لا يحتوي على أسئلة.']);
            }
            $token = (string) Str::uuid();
            $expires = now()->addMinutes(15);
            $request->session()->put($key, [
                'rows' => $errorCount ? [] : $unique,
                'token' => $token,
                'expires_at' => $expires->timestamp,
                'preview' => [
                    'token' => $token,
                    'filename' => $request->file('file')->getClientOriginalName(),
                    'rows' => $rows,
                    'totalCount' => count($rows),
                    'validCount' => count($unique),
                    'duplicateCount' => $duplicateCount,
                    'errorCount' => $errorCount,
                    'expiresAt' => $expires->toIso8601String(),
                ],
            ]);

            return $this->workspaceRedirect($request, $subject);
        } catch (\Throwable $e) {
            report($e);

            return back()->withErrors(['file' => 'تعذّر قراءة الملف. تأكد أنه ملف Excel أو CSV سليم ويستخدم أعمدة القالب.']);
        }
    }

    public function importConfirm(Request $request, Subject $subject)
    {
        $this->authorize('manage-questions', $subject);
        $key = $this->importKey($request, $subject);
        $data = $request->session()->get($key);
        if (! $data) {
            return back()->withErrors(['import' => 'لا توجد معاينة جاهزة. اختر الملف وافحصه أولًا.']);
        }
        if (($data['expires_at'] ?? 0) <= now()->timestamp) {
            $request->session()->forget($key);

            return back()->withErrors(['import' => 'انتهت صلاحية المعاينة. أعد رفع الملف وفحصه قبل التأكيد.']);
        }
        if (! is_string($request->input('import_token')) || ! hash_equals($data['token'], $request->input('import_token'))) {
            return back()->withErrors(['import' => 'تغيّرت معاينة الملف. حدّث الصفحة وافحص الملف الحالي قبل التأكيد.']);
        }
        if ($data['preview']['errorCount'] || ! $data['rows']) {
            return back()->withErrors(['import' => 'صحّح أخطاء الملف وأعد رفعه. لا يمكن اعتماد ملف فيه أخطاء أو لا يحتوي أسئلة جديدة.']);
        }

        try {
            [$imported, $skipped] = DB::transaction(function () use ($subject, $data) {
                $imported = 0;
                $skipped = $data['preview']['duplicateCount'];
                foreach ($data['rows'] as $row) {
                    if ($subject->questions()->where($row)->exists()) {
                        $skipped++;
                    } else {
                        $subject->questions()->create($row);
                        $imported++;
                    }
                }

                return [$imported, $skipped];
            });
            $request->session()->forget($key);

            return redirect()->route('admin.questions.index', $subject->id)
                ->with('success', "تم استيراد $imported سؤال بنجاح وتخطي $skipped سؤال مكرر.");
        } catch (\Throwable $e) {
            report($e);

            return back()->withErrors(['import' => 'تعذّر حفظ الأسئلة. لم يُعتمد الاستيراد؛ حاول مرة أخرى.']);
        }
    }

    public function cancelImport(Request $request, Subject $subject)
    {
        $this->authorize('manage-questions', $subject);
        $key = $this->importKey($request, $subject);
        $data = $request->session()->get($key);
        if ($data && (! is_string($request->input('import_token')) || ! hash_equals($data['token'], $request->input('import_token')))) {
            return back()->withErrors(['import' => 'تغيّرت معاينة الملف. حدّث الصفحة قبل إلغاء المعاينة الحالية.']);
        }
        $request->session()->forget($key);

        return $this->workspaceRedirect($request, $subject);
    }

    private function importKey(Request $request, Subject $subject): string
    {
        return 'excel_import_'.$subject->id.'_'.$request->user()->id;
    }

    private function workspaceRedirect(Request $request, Subject $subject)
    {
        $list = $request->validate([
            'list_search' => ['nullable', 'string', 'max:1000'],
            'list_page' => ['nullable', 'integer', 'min:1', 'max:100000'],
        ]);
        $search = $list['list_search'] ?? null;
        $count = $subject->questions()->when($search, fn ($q) => $q->where('question_text', 'like', "%{$search}%"))->count();
        $page = min((int) ($list['list_page'] ?? 1), max(1, (int) ceil($count / self::PAGE_SIZE)));

        return redirect()->route('admin.questions.index', array_filter([
            'subject' => $subject->id, 'search' => $search, 'page' => $page > 1 ? $page : null,
        ], fn ($value) => $value !== null && $value !== ''));
    }

    private function validatedQuestion(Request $request): array
    {
        $request->merge(collect(self::FIELDS)->mapWithKeys(fn ($field) => [
            $field => is_string($request->input($field)) ? trim($request->input($field)) : $request->input($field),
        ])->all());

        return $request->validate($this->questionRules(), $this->questionMessages());
    }

    private function questionRules(): array
    {
        return [
            'question_text' => ['required', 'string'],
            'option_a' => ['required', 'string', 'max:255'],
            'option_b' => ['required', 'string', 'max:255'],
            'option_c' => ['required', 'string', 'max:255'],
            'option_d' => ['required', 'string', 'max:255'],
            'correct_answer' => ['required', 'string', Rule::in(['A', 'B', 'C', 'D'])],
        ];
    }

    private function questionMessages(): array
    {
        return [
            'question_text.required' => 'نص السؤال مطلوب',
            'option_a.required' => 'الخيار أ مطلوب',
            'option_b.required' => 'الخيار ب مطلوب',
            'option_c.required' => 'الخيار ج مطلوب',
            'option_d.required' => 'الخيار د مطلوب',
            'correct_answer.required' => 'الإجابة الصحيحة مطلوبة',
            'correct_answer.in' => 'الإجابة الصحيحة يجب أن تكون أ، ب، ج، أو د',
            'option_a.max' => 'الخيار أ لا يمكن أن يتجاوز 255 حرفًا',
            'option_b.max' => 'الخيار ب لا يمكن أن يتجاوز 255 حرفًا',
            'option_c.max' => 'الخيار ج لا يمكن أن يتجاوز 255 حرفًا',
            'option_d.max' => 'الخيار د لا يمكن أن يتجاوز 255 حرفًا',
        ];
    }
}
