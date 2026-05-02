import './FactsCarousel.scss';
import { facts } from '../../datas/facts';
import { useEffect, useState } from 'react';

export default function FactsCarousel() {
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
        <div className="carousel">
            {facts.map((fact, index) => (
                <div
                    key={index}
                    className={`carousel__facts${index === factIndex ? ' display' : ' hide'}`}
                >
                    <h2 className="carousel__title">Le saviez-vous ?</h2>
                    <h3 className="carousel__shortFact">{fact.shortFact}</h3>
                    <p className="carousel__longFact">{fact.longFact}</p>
                </div>
            ))}
            <div className="carousel__pagination">
                {facts.map((_, index) => (
                    <input
                        className={`carousel__dot ${index === factIndex ? 'carousel__dot--selected' : ''}`}
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
