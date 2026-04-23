import './Header.scss';
import eurovisionLogo from './../../assets/logos/eurovision-logo.png';
import Nav from '../Nav/Nav';

export default function Header() {
    return (
        <div className="header">
            <img src={eurovisionLogo} alt="" />
            <Nav />
        </div>
    );
}
