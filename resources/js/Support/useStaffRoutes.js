import { usePage } from '@inertiajs/react';

export default function useStaffRoutes() {
    const instructor = usePage().props.auth.user.role === 'instructor';
    return (name, parameters) => route(
        name === 'courses'
            ? (instructor ? 'instructor.courses.index' : 'admin.subjects.index')
            : `${instructor ? 'instructor' : 'admin'}.${name}`,
        parameters,
    );
}
