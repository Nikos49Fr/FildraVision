import { NavLink } from 'react-router';
import './Nav.scss';

export default function Nav() {
    return (
        <div className="nav">
            <NavLink className="nav__link" to="/">
                Accueil
            </NavLink>
            <NavLink className="nav__link" to="/vote" end>
                Voter
            </NavLink>
            <NavLink className="nav__link" to="/singers" end>
                Candidats
            </NavLink>
        </div>
    );
}
