import { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthChanges } from '../services/auth';
import { getCurrentProfile, upsertProfileFromUser } from '../services/profiles';

const ProfileContext = createContext(undefined);

export function ProfileProvider({ children }) {
    const [profile, setProfile] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            try {
                const currentProfile = await getCurrentProfile();

                if (!isMounted) {
                    return;
                }

                setProfile(currentProfile);
            } catch (error) {
                if (error.message === 'Auth session missing!') {
                    if (!isMounted) {
                        return;
                    }

                    setProfile(null);
                    return;
                }

                console.error(error.message);
            } finally {
                if (isMounted) {
                    setIsProfileLoading(false);
                }
            }
        }

        async function syncProfile(currentUser) {
            try {
                await upsertProfileFromUser(currentUser);
                const currentProfile = await getCurrentProfile();

                if (!isMounted) {
                    return;
                }

                setProfile(currentProfile);
            } catch (error) {
                console.error(error.message);
            } finally {
                if (isMounted) {
                    setIsProfileLoading(false);
                }
            }
        }

        loadProfile();

        const {
            data: { subscription },
        } = subscribeToAuthChanges((_event, session) => {
            if (!isMounted) {
                return;
            }

            setIsProfileLoading(true);

            if (!session?.user) {
                setProfile(null);
                setIsProfileLoading(false);
                return;
            }

            void syncProfile(session.user);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <ProfileContext.Provider value={{ profile, isProfileLoading }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);

    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider.');
    }

    return context;
}
