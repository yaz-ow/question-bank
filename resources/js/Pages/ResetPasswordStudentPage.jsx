import AccountPortal from '../Components/Auth/AccountPortal';

export default function ResetPasswordStudentPage({ token, email = '' }) {
    return (
        <AccountPortal
            mode="reset"
            role="student"
            token={token}
            email={email}
        />
    );
}
