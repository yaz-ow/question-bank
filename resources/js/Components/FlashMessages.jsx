import { usePage } from '@inertiajs/react';

export default function FlashMessages() {
    const { flash = {} } = usePage().props;
    return <div aria-live="polite">
        {Object.entries(flash).filter(([, value]) => value).map(([kind, value]) => (
            <div key={kind} role={kind === 'error' ? 'alert' : 'status'}
                className={`mb-4 rounded-md border p-3 ${kind === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-blue-200 bg-blue-50 text-blue-800'}`}>
                {value}
            </div>
        ))}
    </div>;
}
