import './Home.scss';
import branding from './../../assets/logos/fildravision_branding.webp';
import fildraenLogo from './../../assets/logos/fildraen-logo.png';
import TwitchLogo from './../../assets/logos/twitch-brands-solid-full.svg?react';
import eurovisionSmallLogo from './../../assets/flags/flag_at.svg';

export default function Home() {
    return (
        <main className="main">
            <div className="main__title">
                <h1>Soirées réact FildraVision</h1>
                <h2>
                    Euro
                    <span>
                        <img
                            className="logo"
                            src={eurovisionSmallLogo}
                            alt="logo Eurovision 2026"
                        />
                    </span>
                    ision 2026 song contest - Vienne
                </h2>
            </div>
            <article className="main__content">
                <div className="main__branding">
                    <img src={branding} alt="affiche du fildravision" />
                </div>
                <div className="main__article">
                    <div className="main__article-section">
                        <h3>
                            Rejoins les Fildrayen pour 3 soirées à ne pas
                            manquer
                        </h3>
                        <ul>
                            <li>1ère demi finale Mardi 12 Mai 20h30</li>
                            <li>2ème demi finale Jeudi 14 Mai 20h30</li>
                            <li>FINALE Samedi 16 Mai 20h30</li>
                        </ul>
                    </div>
                    <div className="main__article-section">
                        <h3>Pourquoi participer ?</h3>
                        <p>
                            Fildrayen passionné.e ou intrigué.e, ce site est là
                            pour toi !
                        </p>
                        <p>Ici, tu pourras faire ton propre classement.</p>
                        <p>
                            Et en direct chez Fildraen, nous regarderons
                            ensemble qui est le plus proche, qui a bon goût
                            😎... ou pas du tout 💩
                        </p>
                        <p>
                            Mais surtout, tous les votes contribueront à établir
                            le classement "communautaire".
                        </p>
                        <p>Avez-vous l'oreille musicale ?</p>
                    </div>

                    <div className="fildraen-link">
                        <img
                            className="fildraen-link__logo"
                            src={fildraenLogo}
                            alt="Logo de la chaîne Twitch de Fildraen"
                        />
                        <a
                            className="fildraen-link__twitch-link"
                            href="https://www.twitch.tv/fildraen"
                        >
                            https://www.twitch.tv/fildraen
                        </a>
                        <TwitchLogo className="fildraen-link__twitch-icon" />
                    </div>
                </div>
            </article>
        </main>
    );
}
