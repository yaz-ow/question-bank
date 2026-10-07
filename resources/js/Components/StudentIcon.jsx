export default function StudentIcon({ name = 'book', className = 'size-5' }) {
    const paths = {
        book: <><path d="M12 5v15M3 4c3-1 6 0 9 2 3-2 6-3 9-2v15c-3-1-6 0-9 2-3-2-6-3-9-2Z" /></>,
        layers: <><path d="m12 3 9 7-9 7-9-7 9-7Zm-9 12 9 7 9-7" /></>,
        home: <><path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8" /></>,
        tick: <path d="m5 12 4 4L19 6" />,
        retry: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6.1 6.1A8 8 0 0 1 20 12M17.9 17.9A8 8 0 0 1 4 12" /></>,
        calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 11h18" /></>,
        chart: <><path d="M4 20V10m8 10V4m8 16v-7" /></>,
        check: <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="m8 12 3 3 5-6" /></>,
        arrow: <path d="M20 12H4m6-6-6 6 6 6" />,
        exit: <><path d="M10 4H4v16h6m4-12 4 4-4 4m-6-4h10" /></>,
        menu: <path d="M4 6h16M4 12h16M4 18h16" />,
        close: <path d="m6 6 12 12M6 18 18 6" />,
        code: <><path d="m7 6-6 6 6 6m10-12 6 6-6 6m-3-15-4 18" /></>,
        file: <><path d="M14 3H5v18h14V8Zm0 0v5h5M8 12h8m-8 4h6" /></>,
    };
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.book}</svg>;
}
