import './Header.scss';
import eurovisionLogo from './../../assets/logos/eurovision-logo.png';
import EurovisionSmallLogo from './../../assets/flags/flag_at.svg?react';
import Nav from '../../components/Nav/Nav';
import FactsCarousel from '../../components/FactsCarousel/FactsCarousel';

export default function Header() {
    return (
        <div className="header">
            <div className="header__logo">
                <img
                    className="header__logo--big"
                    src={eurovisionLogo}
                    alt="logo officiel EuroVision 2026"
                />
                <EurovisionSmallLogo className="header__logo--small" />
            </div>
            <div className="header__carousel">
                <FactsCarousel />
            </div>
            <div className="header__nav">
                <Nav />
            </div>
        </div>
    );
}
