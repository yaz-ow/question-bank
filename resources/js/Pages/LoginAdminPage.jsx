import LoginPortal from '../Components/Auth/LoginPortal';

export default function LoginAdminPage({ email = '' }) {
    return <LoginPortal initialRole="admin" initialIdentifier={email} />;
}
