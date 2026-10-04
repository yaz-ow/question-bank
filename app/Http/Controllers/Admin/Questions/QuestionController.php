<?php

namespace App\Http\Controllers\Admin\Questions;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Subject;
use App\Imports\QuestionsImport;
use App\Imports\QuestionsImportTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class QuestionController extends Controller
{
    /**
     * Display a listing of questions for the specified subject.
     */
    public function index(Request $request, Subject $subject)
    {
        $this->authorize('manage-questions', $subject);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:1000'],
        ]);

        return Inertia::render('Admin/Questions/Index', [
            'subject' => $subject,
            'questions' => Question::where('subject_id', $subject->id)
                ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('question_text', 'like', "%{$search}%"))
                ->orderBy('created_at', 'desc')
                ->paginate(10)
                ->withQueryString(),
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new question for the specified subject.
     */
    public function create(Subject $subject)
    {
        $this->authorize('manage-questions', $subject);

        return Inertia::render('Admin/Questions/Form', [
            'subject' => $subject,
            'question' => null,
        ]);
    }

    /**
     * Store a newly created question for the specified subject.
     */
    public function store(Request $request, Subject $subject)
    {
        $this->authorize('manage-questions', $subject);

        $request->merge(['question_text' => is_string($request->question_text) ? trim($request->question_text) : $request->question_text]);
        $request->merge(['option_a' => is_string($request->option_a) ? trim($request->option_a) : $request->option_a]);
        $request->merge(['option_b' => is_string($request->option_b) ? trim($request->option_b) : $request->option_b]);
        $request->merge(['option_c' => is_string($request->option_c) ? trim($request->option_c) : $request->option_c]);
        $request->merge(['option_d' => is_string($request->option_d) ? trim($request->option_d) : $request->option_d]);

        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'option_a' => ['required', 'string', 'max:255'],
            'option_b' => ['required', 'string', 'max:255'],
            'option_c' => ['required', 'string', 'max:255'],
            'option_d' => ['required', 'string', 'max:255'],
            'correct_answer' => ['required', 'string', Rule::in(['A', 'B', 'C', 'D'])],
        ], [
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
        ]);

        Question::create(array_merge($validated, ['subject_id' => $subject->id]));

        return redirect()->route('admin.questions.index', $subject->id)
            ->with('success', 'تم إنشاء السؤال بنجاح');
    }

    /**
     * Display the specified question.
     */
    public function show(Subject $subject, Question $question)
    {
        $this->authorize('manage-questions', $subject);

        // Ensure the question belongs to the subject
        if ($question->subject_id !== $subject->id) {
            abort(404);
        }

        return Inertia::render('Admin/Questions/Show', [
            'subject' => $subject,
            'question' => $question,
        ]);
    }

    /**
     * Show the form for editing the specified question.
     */
    public function edit(Subject $subject, Question $question)
    {
        $this->authorize('manage-questions', $subject);

        // Ensure the question belongs to the subject
        if ($question->subject_id !== $subject->id) {
            abort(404);
        }

        return Inertia::render('Admin/Questions/Form', [
            'subject' => $subject,
            'question' => $question,
        ]);
    }

    /**
     * Update the specified question in storage.
     */
    public function update(Request $request, Subject $subject, Question $question)
    {
        $this->authorize('manage-questions', $subject);

        // Ensure the question belongs to the subject
        if ($question->subject_id !== $subject->id) {
            abort(404);
        }

        $request->merge(['question_text' => is_string($request->question_text) ? trim($request->question_text) : $request->question_text]);
        $request->merge(['option_a' => is_string($request->option_a) ? trim($request->option_a) : $request->option_a]);
        $request->merge(['option_b' => is_string($request->option_b) ? trim($request->option_b) : $request->option_b]);
        $request->merge(['option_c' => is_string($request->option_c) ? trim($request->option_c) : $request->option_c]);
        $request->merge(['option_d' => is_string($request->option_d) ? trim($request->option_d) : $request->option_d]);

        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'option_a' => ['required', 'string', 'max:255'],
            'option_b' => ['required', 'string', 'max:255'],
            'option_c' => ['required', 'string', 'max:255'],
            'option_d' => ['required', 'string', 'max:255'],
            'correct_answer' => ['required', 'string', Rule::in(['A', 'B', 'C', 'D'])],
        ], [
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
        ]);

        $question->update($validated);

        return redirect()->route('admin.questions.index', $subject->id)
            ->with('success', 'تم تحديث السؤال بنجاح');
    }

    /**
     * Remove the specified question from storage.
     */
    public function destroy(Subject $subject, Question $question)
    {
        $this->authorize('manage-questions', $subject);

        // Ensure the question belongs to the subject
        if ($question->subject_id !== $subject->id) {
            abort(404);
        }

        $question->delete();

        return redirect()->route('admin.questions.index', $subject->id)
            ->with('success', 'تم حذف السؤال بنجاح');
    }

    /**
     * Download the Excel template for question import.
     */
    public function downloadTemplate(Subject $subject)
    {
        $this->authorize('manage-questions', $subject);

        return Excel::download(new QuestionsImportTemplate($subject->id), 'questions_template.xlsx');
    }

    /**
     * Handle the Excel file upload and preview.
     */
    public function uploadPreview(Request $request, Subject $subject)
    {
        $this->authorize('manage-questions', $subject);

        $request->validate([
            'file' => ['required', 'file', 'max:5120'], // 5MB limit
        ]);

        $import = new QuestionsImport($subject->id);
        $import->file = $request->file('file');

        try {
            $sheets = $import->toCollection($import->file);
            $rows = $sheets->first()?->toArray() ?? [];

            // Validate the rows with proper rules
            $validator = Validator::make(
                $rows,
                [
                    '*' => [
                        'required',
                        'array',
                        function ($attribute, $value, $fail) {
                            if (!is_array($value)) {
                                $fail('يجب أن يكون الصف مصفوفة');
                            }
                        }
                    ],
                    '*.question_text' => ['required', 'string'],
                    '*.option_a' => ['required', 'string', 'max:255'],
                    '*.option_b' => ['required', 'string', 'max:255'],
                    '*.option_c' => ['required', 'string', 'max:255'],
                    '*.option_d' => ['required', 'string', 'max:255'],
                    '*.correct_answer' => ['required', 'string', Rule::in(['A', 'B', 'C', 'D'])],
                ],
                [
                    '*.question_text.required' => 'نص السؤال مطلوب',
                    '*.option_a.required' => 'الخيار أ مطلوب',
                    '*.option_b.required' => 'الخيار ب مطلوب',
                    '*.option_c.required' => 'الخيار ج مطلوب',
                    '*.option_d.required' => 'الخيار د مطلوب',
                    '*.correct_answer.required' => 'الإجابة الصحيحة مطلوبة',
                    '*.correct_answer.in' => 'الإجابة الصحيحة يجب أن تكون أ، ب، ج، أو د',
                    '*.option_a.max' => 'الخيار أ لا يمكن أن يتجاوز 255 حرفًا',
                    '*.option_b.max' => 'الخيار ب لا يمكن أن يتجاوز 255 حرفًا',
                    '*.option_c.max' => 'الخيار ج لا يمكن أن يتجاوز 255 حرفًا',
                    '*.option_d.max' => 'الخيار د لا يمكن أن يتجاوز 255 حرفًا',
                ]
            );

            // Normalize data before validation
            $normalized = [];
            foreach ($rows as $index => $row) {
                if (is_array($row)) {
                    $normalized[$index] = [
                        'question_text' => isset($row['question_text']) ? trim($row['question_text']) : '',
                        'option_a' => isset($row['option_a']) ? trim($row['option_a']) : '',
                        'option_b' => isset($row['option_b']) ? trim($row['option_b']) : '',
                        'option_c' => isset($row['option_c']) ? trim($row['option_c']) : '',
                        'option_d' => isset($row['option_d']) ? trim($row['option_d']) : '',
                        'correct_answer' => isset($row['correct_answer']) ? strtoupper(trim($row['correct_answer'])) : '',
                    ];
                }
            }

            // Validate normalized data
            $validator = Validator::make(
                $normalized,
                [
                    '*' => [
                        'required',
                        'array',
                        function ($attribute, $value, $fail) {
                            if (!is_array($value)) {
                                $fail('يجب أن يكون الصف مصفوفة');
                            }
                        }
                    ],
                    '*.question_text' => ['required', 'string'],
                    '*.option_a' => ['required', 'string', 'max:255'],
                    '*.option_b' => ['required', 'string', 'max:255'],
                    '*.option_c' => ['required', 'string', 'max:255'],
                    '*.option_d' => ['required', 'string', 'max:255'],
                    '*.correct_answer' => ['required', 'string', Rule::in(['A', 'B', 'C', 'D'])],
                ],
                [
                    '*.question_text.required' => 'نص السؤال مطلوب',
                    '*.option_a.required' => 'الخيار أ مطلوب',
                    '*.option_b.required' => 'الخيار ب مطلوب',
                    '*.option_c.required' => 'الخيار ج مطلوب',
                    '*.option_d.required' => 'الخيار د مطلوب',
                    '*.correct_answer.required' => 'الإجابة الصحيحة مطلوبة',
                    '*.correct_answer.in' => 'الإجابة الصحيحة يجب أن تكون أ، ب، ج، أو د',
                    '*.option_a.max' => 'الخيار أ لا يمكن أن يتجاوز 255 حرفًا',
                    '*.option_b.max' => 'الخيار ب لا يمكن أن يتجاوز 255 حرفًا',
                    '*.option_c.max' => 'الخيار ج لا يمكن أن يتجاوز 255 حرفًا',
                    '*.option_d.max' => 'الخيار د لا يمكن أن يتجاوز 255 حرفًا',
                ]
            );

            if ($validator->fails()) {
                return Redirect::back()
                    ->withInput()
                    ->withErrors($validator)
                    ->with('preview', [
                        'rows' => array_slice($normalized, 0, 10), // Show first 10 rows for preview
                        'hasErrors' => true,
                    ]);
            }

            // Use normalized data for duplicate detection and storage
            $validRows = $normalized;

            // Count duplicates
            $duplicateCount = 0;
            $uniqueValidRows = [];

            foreach ($validRows as $row) {
                $normalizedQuestion = $row['question_text'];
                $normalizedOptionA = $row['option_a'];
                $normalizedOptionB = $row['option_b'];
                $normalizedOptionC = $row['option_c'];
                $normalizedOptionD = $row['option_d'];
                $normalizedAnswer = $row['correct_answer'];

                // Check if this is a duplicate within the upload
                $isDuplicateInUpload = false;
                foreach ($uniqueValidRows as $validRow) {
                    if (
                        $validRow['question_text'] === $normalizedQuestion &&
                        $validRow['option_a'] === $normalizedOptionA &&
                        $validRow['option_b'] === $normalizedOptionB &&
                        $validRow['option_c'] === $normalizedOptionC &&
                        $validRow['option_d'] === $normalizedOptionD &&
                        $validRow['correct_answer'] === $normalizedAnswer
                    ) {
                        $isDuplicateInUpload = true;
                        break;
                    }
                }

                // Check if this is a duplicate in the database
                $isDuplicateInDb = Question::where('subject_id', $subject->id)
                    ->where('question_text', $normalizedQuestion)
                    ->where('option_a', $normalizedOptionA)
                    ->where('option_b', $normalizedOptionB)
                    ->where('option_c', $normalizedOptionC)
                    ->where('option_d', $normalizedOptionD)
                    ->where('correct_answer', $normalizedAnswer)
                    ->exists();

                if (!$isDuplicateInUpload && !$isDuplicateInDb) {
                    $uniqueValidRows[] = $row;
                } else {
                    $duplicateCount++;
                }
            }

            // Store the validated rows in the session for import confirmation
            $key = 'excel_import_' . $subject->id . '_' . $request->user()->id;
            session([$key => [
                'rows' => $uniqueValidRows,
                'expires_at' => now()->addMinutes(15),
            ]]);

            return Inertia::render('Admin/Questions/ImportPreview', [
                'subject' => $subject,
                'rows' => array_slice($uniqueValidRows, 0, 10), // Show first 10 rows for preview
                'validCount' => count($uniqueValidRows),
                'duplicateCount' => $duplicateCount,
                'errorCount' => 0, // No errors since validation passed
                'hasErrors' => false,
                'validationErrors' => [],
            ]);
        } catch (\Exception $e) {
            return Redirect::back()
                ->withInput()
                ->withErrors(['file' => 'حدث خطأ في قراءة الملف: ' . $e->getMessage()]);
        }
    }

    /**
     * Handle the confirmed import of questions from Excel.
     */
    public function importConfirm(Request $request, Subject $subject)
    {
        $this->authorize('manage-questions', $subject);

        // Check for pending import data in the session
        $key = 'excel_import_' . $subject->id . '_' . $request->user()->id;
        if (!session()->has($key)) {
            return Redirect::back()
                ->with('error', 'لا توجد بيانات استيراد مؤقتة. يرجى رفع الملف ومعاينته أولا.');
        }

        $data = session($key);
        if (now()->greaterThan($data['expires_at'])) {
            // Expired
            session()->forget($key);
            return Redirect::back()
                ->with('error', 'انتهت صلاحية بيانات الاستيراد المؤقتة. يرجى رفع الملف ومعاينته مرة أخرى.');
        }

        $rows = $data['rows'];

        try {
            return DB::transaction(function () use ($subject, $rows) {
                $imported = 0;
                $skipped = 0;

                foreach ($rows as $row) {
                    $normalizedQuestion = trim($row['question_text']);
                    $normalizedOptionA = trim($row['option_a']);
                    $normalizedOptionB = trim($row['option_b']);
                    $normalizedOptionC = trim($row['option_c']);
                    $normalizedOptionD = trim($row['option_d']);
                    $normalizedAnswer = strtoupper(trim($row['correct_answer']));

                    // Check for duplicate in the database
                    $isDuplicate = Question::where('subject_id', $subject->id)
                        ->where('question_text', $normalizedQuestion)
                        ->where('option_a', $normalizedOptionA)
                        ->where('option_b', $normalizedOptionB)
                        ->where('option_c', $normalizedOptionC)
                        ->where('option_d', $normalizedOptionD)
                        ->where('correct_answer', $normalizedAnswer)
                        ->exists();

                    if (!$isDuplicate) {
                        Question::create([
                            'subject_id' => $subject->id,
                            'question_text' => $normalizedQuestion,
                            'option_a' => $normalizedOptionA,
                            'option_b' => $normalizedOptionB,
                            'option_c' => $normalizedOptionC,
                            'option_d' => $normalizedOptionD,
                            'correct_answer' => $normalizedAnswer,
                        ]);
                        $imported++;
                    } else {
                        $skipped++;
                    }
                }

                return redirect()->route('admin.questions.index', $subject->id)
                    ->with('success', "تم استيراد $imported سؤال بنجاح وتخطي $skipped سؤال مكرر.");
            });

            // Clear the session data after successful import
            session()->forget($key);

            return redirect()->route('admin.questions.index', $subject->id)
                ->with('success', "تم استيراد $imported سؤال بنجاح وتخطي $skipped سؤال مكرر.");
        } catch (\Exception $e) {
            // If there's an error, we don't clear the session data so the user can try again after fixing the issue?
            return Redirect::back()
                ->withInput()
                ->withErrors(['file' => 'حدث خطأ أثناء الاستيراد: ' . $e->getMessage()]);
        }
    }
}
