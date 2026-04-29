import { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthChanges } from '../services/auth';
import { getCurrentProfile, upsertProfileFromUser } from '../services/profiles';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        async function loadProfile() {
            try {
                const currentProfile = await getCurrentProfile();
                setProfile(currentProfile);
            } catch (error) {
                console.error(error.message);
            }
        }

        async function syncProfile(currentUser) {
            try {
                await upsertProfileFromUser(currentUser);
                const currentProfile = await getCurrentProfile();
                setProfile(currentProfile);
            } catch (error) {
                console.error(error.message);
            }
        }

        loadProfile();

        const {
            data: { subscription },
        } = subscribeToAuthChanges((_event, session) => {
            if (!session?.user) {
                setProfile(null);
                return;
            }

            void syncProfile(session.user);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <ProfileContext.Provider value={profile}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    return context;
}
