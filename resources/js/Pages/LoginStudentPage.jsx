import LoginPortal from '../Components/Auth/LoginPortal';

export default function LoginStudentPage({ universityId = '' }) {
    return (
        <LoginPortal initialRole="student" initialIdentifier={universityId} />
    );
}
