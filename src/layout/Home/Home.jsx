import './Home.scss';
import fildraenLogo from './../../assets/logos/fildraen-logo.png';
import TwitchLogo from './../../assets/logos/twitch-brands-solid-full.svg?react';

export default function Home() {
    return (
        <main className="main">
            <h1>Eurovision 2026 song contest - Vienne 2026</h1>
            <div className='fildraen-link'>
                <img className='fildraen-link__logo' src={fildraenLogo} alt="Logo de la chaîne Twitch de Fildraen" />
                <a className='fildraen-link__twitch-link' href="https://www.twitch.tv/fildraen">https://www.twitch.tv/fildraen</a>
                <TwitchLogo className="fildraen-link__twitch-icon"/>
            </div>
            <p>
                Fildrayen passionné.e ou intrigué.e, ce site est là pour toi !
            </p>
            <p>Ici, tu pourras faire ton propre classement.</p>
            <p>
                Et en direct chez Fildraen, nous regarderons ensemble qui est le
                plus proche, qui a bon goût 😎... ou pas du tout 💩
            </p>
            <p>
                Mais surtout, tous les votes établiront un classement "général".
                Avez-vous l'oreille musicale ?
            </p>
        </main>
    );
}
