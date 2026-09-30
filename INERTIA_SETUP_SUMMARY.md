# React, authentication and course-management integration

The application uses Laravel 12, Inertia and React. HTTP middleware is configured
in `bootstrap/app.php`; the obsolete application Kernel has been removed.

## Runtime fixes

- The Blade root renders `@inertia`, live Ziggy routes and Vite React refresh.
- The React entry mounts with `createRoot` and discovers `./Pages/**/*.jsx`.
- Vite's React plugin compiles every referenced JSX page, including student and
  admin dashboards and course-management pages.
- Forms rely on Inertia's built-in validation errors; server flash messages are
  shown after redirects. Student toggling uses the router outside React hooks.
- Named routes come from the server, without a stale generated Ziggy file.

## Authentication and authorization

- Guests redirect to the correct login portal; student and staff dashboards
  enforce their respective roles and active status.
- Admin-only account actions have explicit authorization gates. Administrators
  and instructors can manage subjects; students cannot.
- Password reset links use the account role. Laravel's password broker checks
  token validity, expiry and one-time usage; the URL itself is not signed.
- Password reset rotates remember tokens, removes database sessions when that
  driver is configured, and protected routes check session password hashes.
- Authentication rate limits are scoped to endpoint, IP and account. Read-only
  login pages do not consume submission limits.

## Validation

Run from the project root:

```sh
composer install
npm ci
npm run build
php artisan test
```

For Sail, prefix PHP commands with `./vendor/bin/sail` (for example,
`./vendor/bin/sail artisan test`). GitHub Actions runs the build and PHP tests.
The PHP suite uses an in-memory SQLite database and disables Vite rendering;
the separate production build verifies that all React pages compile.

Configure `ADMIN_CREATION_CODE` before creating instructors. Configure a real
mail transport to deliver reset emails (`MAIL_MAILER=log` only logs messages).
Do not use `migrate:fresh` on an existing database; normal updates use
`php artisan migrate`.
