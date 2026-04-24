import './FactsCaroussel.scss';
import { facts } from './../../datas/facts';
import { useEffect, useState } from 'react';

export default function FactsCaroussel() {
    const numberOfFacts = facts.length;
    const [factIndex, setFactIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const random = Math.floor(Math.random() * numberOfFacts);
            setFactIndex(random);
        }, 30000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="caroussel">
            {facts.map((fact, index) => (
                <div
                    key={index}
                    className={`caroussel__facts${index === factIndex ? ' display' : ' hide'}`}
                >
                    <h2 className="caroussel__title">Le saviez-vous ?</h2>
                    <h3 className="caroussel__shortFact">
                        {facts[index].shortFact}
                    </h3>
                    <p className="caroussel__longFact">
                        {facts[index].longFact}
                    </p>
                </div>
            ))}
            <div className="caroussel__pagination">
                {facts.map((fact, index) => (
                    <input
                        className={`caroussel__dot ${index === factIndex ? 'caroussel__dot--selected' : ''}`}
                        type="radio"
                        key={index}
                        name="radio-button"
                        checked={index === factIndex}
                        onChange={() => setFactIndex(index)}
                    />
                ))}
            </div>
        </div>
    );
}
