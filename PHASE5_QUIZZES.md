# Phase 5: student practice quizzes

## Behavior

- Start from a student's course details page. Choose 10, 20, or 30 questions; unavailable sizes are disabled and also rejected by the server.
- Questions are selected randomly from that course without repetition inside an attempt. There is no exam timer.
- Only the current question is sent to the browser. Selecting an option saves it permanently and reveals that question's correct answer. The interface waits for the student to press Next after reviewing feedback.
- Attempt state and question snapshots live in the database. Reloading resumes the same question and feedback. Editing or deleting a bank question does not change an existing attempt.
- Each student has at most one ongoing attempt through the application: repeated starts resume it, including starts from another course. Starts lock the student's row; answer/advance/exit operations lock the attempt.
- Explicit exit asks for confirmation and marks the attempt abandoned with a null score. Closing the tab or navigating away leaves an incomplete, ungraded attempt that can be resumed from a course page. Browser unload events are not treated as reliable completion events.
- A score is calculated only after every question has been answered and the last feedback has been advanced. Repeated submissions cannot overwrite answers, skip questions, or change a completed score.
- The summary provides correct-answer count, percentage, and retry. Retry uses the same course and question count, prioritizes unseen questions, and fills any shortage from the previous selection. If the bank is too small for a wholly new set, overlap is unavoidable; the exact previous ordering is not reused.
- Course deletion cascades to attempts and their snapshots. Individual question deletion clears the source link while retaining its attempt snapshot. User deletion cascades to that user's attempts.

This delivers the practice flow and a basic completion summary. Detailed results history, question-by-question review, administrative performance reports, and analytics are not added here.

## Local update (WSL, Docker/Sail)

With Docker Desktop and the existing project containers running:

```bash
cd '/mnt/c/project QB'
git pull --ff-only origin main
./vendor/bin/sail artisan migrate
./vendor/bin/sail npm run build
./vendor/bin/sail artisan test --filter=Phase5QuizTest
```

There are no new Composer/npm packages or environment variables. Migration creates `quiz_attempts` and `quiz_items` without changing existing records. If a Vite development server is already running, it can continue serving source changes instead of the production build.

## Verification

`tests/Feature/Phase5QuizTest.php` covers counts, course isolation, snapshot persistence, authorization and ownership, immutable answers, server grading, request replay, completion, abandonment, retry, and cascading deletion. It uses the repository's isolated SQLite in-memory test database. The existing GitHub Actions workflow runs all PHP tests and the frontend build.

Manual walkthrough:

1. Log in as a student and open a course with at least 10 questions. Check 10/20/30 availability.
2. Start a quiz, answer one correctly and one incorrectly, and check feedback and manual advancement with Next.
3. Refresh during a question or during feedback; verify the same saved state returns.
4. Exit and confirm: no grade should appear. Start again and complete every question to see a score.
5. Retry and verify the same count/course with a new random selection, subject to the bank size.
6. Open the attempt URL under another student's account; access must be denied.
7. Verify that existing admin question management and Excel import still work.

If no available count can be selected, add questions through the existing administration portal rather than seeding development data.
