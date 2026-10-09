import StudentIcon from './StudentIcon';

export default function AdminIcon({ name = 'book', className = '' }) {
    const paths = {
        grid: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </>
        ),
        users: (
            <>
                <circle cx="9" cy="7" r="3" />
                <path d="M3 21v-3a6 6 0 0 1 12 0v3H3Zm13-17a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v3h-3" />
            </>
        ),
        'user-plus': (
            <>
                <circle cx="9" cy="7" r="3" />
                <path d="M3 21v-3a6 6 0 0 1 12 0v3H3Zm16-11v6m-3-3h6" />
            </>
        ),
        user: (
            <>
                <circle cx="12" cy="7" r="4" />
                <path d="M4 21v-2a8 8 0 0 1 16 0v2H4Z" />
            </>
        ),
        question: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 3h.01" />
            </>
        ),
        plus: <path d="M12 4v16M4 12h16" />,
        eye: (
            <>
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
            </>
        ),
        download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
        upload: <path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5" />,
        trash: (
            <>
                <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
            </>
        ),
        edit: (
            <>
                <path d="m14 5 5 5M4 20l4-1L21 6l-4-4L4 15l-1 6Z" />
            </>
        ),
        search: (
            <>
                <circle cx="10" cy="10" r="7" />
                <path d="m15 15 6 6" />
            </>
        ),
        chevron: <path d="m8 10 4 4 4-4" />,
    };
    if (!paths[name])
        return (
            <StudentIcon name={name} className={`admin-icon ${className}`} />
        );
    return (
        <svg
            className={`admin-icon ${className}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
}
