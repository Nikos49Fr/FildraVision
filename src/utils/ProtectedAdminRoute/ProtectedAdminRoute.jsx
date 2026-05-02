import { useProfile } from '../../context/profileContext';
import { Navigate } from 'react-router';

export function ProtectedAdminRoute({ children }) {
    const { profile, isProfileLoading } = useProfile();

    if (isProfileLoading) {
        return null;
    }

    if (!profile?.is_admin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
