import AccountPortal from '../Components/Auth/AccountPortal';

export default function ResetPasswordAdminPage({ token, email = '' }) {
    return (
        <AccountPortal mode="reset" role="admin" token={token} email={email} />
    );
}
