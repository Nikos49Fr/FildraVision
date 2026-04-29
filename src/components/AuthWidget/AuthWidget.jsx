import { useEffect, useState } from 'react';
import './AuthWidget.scss';
import TwitchLogo from './../../assets/logos/twitch-brands-solid-full.svg?react';
import {
    getCurrentUser,
    loginWithTwitch,
    logout,
    subscribeToAuthChanges,
} from '../../services/auth';
import { isSupabaseConfigured } from '../../services/supabaseClient';

function getDisplayName(user) {
    if (!user) {
        return '';
    }

    return (
        user.user_metadata?.nickname ||
        user.user_metadata?.slug ||
        user.user_metadata?.name ||
        'Utilisateur Twitch'
    );
}

function getAvatarURL(user) {
    if (!user) {
        return false;
    }

    return user.user_metadata?.avatar_url || false;
}

export default function AuthWidget() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(isSupabaseConfigured);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            return undefined;
        }

        let isMounted = true;

        async function loadUser() {
            try {
                const currentUser = await getCurrentUser();

                if (isMounted) {
                    setUser(currentUser);
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadUser();

        const {
            data: { subscription },
        } = subscribeToAuthChanges((_event, session) => {
            if (!isMounted) {
                return;
            }

            const currentUser = session?.user ?? null;

            setUser(currentUser);
            setErrorMessage('');
            setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    async function handleLogin() {
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            await loginWithTwitch();
        } catch (error) {
            setErrorMessage(error.message);
            setIsSubmitting(false);
        }
    }

    async function handleLogout() {
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            await logout();
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <aside className="auth-widget" aria-live="polite">
            {/* <TwitchLogo className="auth-widget__icon" /> */}
            {isSupabaseConfigured && loading && (
                <p className="auth-widget__message">
                    Vérification de la session...
                </p>
            )}

            {isSupabaseConfigured && !loading && !user && (
                <>
                    <TwitchLogo className="auth-widget__icon" />
                    <button
                        className="auth-widget__button auth-widget__button--login"
                        type="button"
                        onClick={handleLogin}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Redirect...' : 'Login'}
                    </button>
                </>
            )}

            {isSupabaseConfigured && !loading && user && (
                <>
                    <TwitchLogo className="auth-widget__icon" />
                    <button
                        className="auth-widget__button auth-widget__button--logout"
                        type="button"
                        onClick={handleLogout}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Loging out...' : 'Logout'}
                    </button>
                    <img
                        className="auth-widget__avatar"
                        src={getAvatarURL(user)}
                        alt="Avatar Twitch"
                    />
                    <p className="auth-widget__username">
                        {getDisplayName(user)}
                    </p>
                    <div className="auth-widget__user"></div>
                </>
            )}

            {errorMessage && (
                <p className="auth-widget__error">{errorMessage}</p>
            )}
        </aside>
    );
}
