// One consistent book family, with stable variations across academic cards.
const books = [
    <>
        <path d="M12 5v15M3 4c3-1 6 0 9 2 3-2 6-3 9-2v15c-3-1-6 0-9 2-3-2-6-3-9-2Z" />
    </>,
    <>
        <path d="M5 3h14v18H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 14h14M7 3v14" />
        <path d="M12 3v8l2-1.5 2 1.5V3" />
    </>,
    <>
        <path d="m3 7 10-4 8 4-10 4L3 7Zm0 0v4l8 4 10-4V7M3 15l8 4 10-4M3 19l8 4 10-4M11 11v4" />
    </>,
    <>
        <rect x="5" y="3" width="15" height="18" rx="2" />
        <path d="M9 3v18M3 7h4M3 12h4M3 17h4M12 8h5M12 12h4" />
    </>,
    <>
        <path d="M12 6v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-3-1-6 0-9 2-3-2-6-3-9-2Z" />
        <path d="m6 9 3 1m-3 3 3 1m6-4 3-1m-3 5 3-1" />
    </>,
    <>
        <rect x="3" y="5" width="5" height="16" rx="1" />
        <path d="M3 9h5M3 17h5M10 3h5v18h-5V3Zm0 5h5m-5 9h5m1-10 4-1 3 14-4 1-3-14Z" />
    </>,
    <>
        <path d="M12 6v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-3-1-6 0-9 2-3-2-6-3-9-2Z" />
        <path d="M15 5v8l2-1.5 2 1V4M6 10l3 1" />
    </>,
    <>
        <path d="M18 13V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7M3 17h10M7 3v14M10 7h5M10 11h3" />
        <path d="m14 17 6-6 2 2-6 6-3 1 1-3Zm4-4 2 2" />
    </>,
    <>
        <path d="M7 3h12a2 2 0 0 1 2 2v13H9a2 2 0 0 1-2-2V3Zm0 11h14M11 3v11M4 6H3v13a2 2 0 0 0 2 2h13v-3" />
        <path d="M14 7h4M14 10h3" />
    </>,
];

export default function AcademicBookIcon({ index = 0, className = 'size-6' }) {
    const variant = Math.abs(Number(index) || 0) % books.length;
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {books[variant]}
        </svg>
    );
}
