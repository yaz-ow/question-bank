# Phase 6: student results history and review

- `/student/results` lists only the authenticated student's attempts, newest first, in pages of 15. Course and status filters persist across pagination.
- Completed attempts display score and percentage. In-progress and abandoned attempts remain ungraded. In-progress attempts can be resumed.
- Statistics show the completed-attempt count and unweighted average percentage for the selected course (or all courses). Status filtering affects the list, not these statistics. Empty statistics show no average.
- `/student/results/{attempt}` reviews completed attempts only, using saved question snapshots, ordered options, selected answers, and correct answers. Another student's attempt returns 404. Unfinished/abandoned attempts cannot expose answer keys through this endpoint.
- Result summaries link to history and review. History links back to the existing summary and retry workflow, preserving the same course/count and starting a separate randomized attempt.
- Existing Next-button navigation is preserved. No automatic advancement, new quiz counts, administrator reporting, or dependencies are introduced.
- Existing course deletion cascades to attempts and review items. No new migration is required; Phase 5 migrations must already be installed.

## Local update

```bash
cd '/mnt/c/project QB'
git pull --ff-only origin main
./vendor/bin/sail artisan optimize:clear
./vendor/bin/sail npm run build
```

## Verification

`Phase6ResultsTest` covers ownership, route permissions, pagination, filtering, aggregate isolation, empty states, saved answer review, retry preservation, and course deletion. Tests use the configured SQLite in-memory database. The existing Actions workflow runs all PHP tests and the frontend build.

Manual check: open **سجل النتائج** from the student dashboard; filter by course/status; complete an attempt and review its answers; retry and verify the previous result remains; abandon a new attempt and verify no score or review is available. Sign in as another student and confirm the original review URL is inaccessible. Inspect desktop/mobile RTL rendering. Browser checks must be performed locally if no PHP/browser runtime is available to the implementer.
