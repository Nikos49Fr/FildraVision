import { NavLink } from 'react-router';
import './Nav.scss';
import { useProfile } from '../../context/profileContext';

export default function Nav() {
    const profile = useProfile();

    return (
        <div className="nav">
            <NavLink
                to="/"
                className={({ isActive }) =>
                    isActive ? 'nav__link nav__link--active' : 'nav__link'
                }
            >
                Accueil
            </NavLink>
            <NavLink
                to="/singers"
                end
                className={({ isActive }) =>
                    isActive ? 'nav__link nav__link--active' : 'nav__link'
                }
            >
                Candidats
            </NavLink>
            <NavLink
                to="/vote"
                end
                className={({ isActive }) =>
                    isActive ? 'nav__link nav__link--active' : 'nav__link'
                }
            >
                Voter
            </NavLink>
            {profile?.is_admin ? (
                <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                        isActive ? 'nav__link nav__link--active' : 'nav__link'
                    }
                >
                    Admin
                </NavLink>
            ) : (
                ''
            )}
        </div>
    );
}
