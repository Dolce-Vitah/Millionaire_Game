import React from "react";

const currencySymbols = ['$', '€', '₽', '£', '¥', '₹', '₩', '₺', ];
const numberOfSymbols = 70;

const getRandomLeft = () => {
    let left = Math.random() * 100;
    while (left >= 30 && left <= 70) {
        left = Math.random() * 100;
    }

    return left;
}

const getRandomDelay = () => `${(Math.random() * 10).toFixed(2)}s`;

const CurrencyOverlay = () => {
    const symbols = Array.from({ length: numberOfSymbols }, (_, i) => {
        const symbol = currencySymbols[Math.floor(Math.random() * currencySymbols.length)];
        const left = getRandomLeft();
        const animationDelay = getRandomDelay();
        return (
            <span key={i} className="floating-currency" style={{ left: `${left}%`, animationDelay }}>{symbol}</span>
        );
    });

    return <div className="currency-overlay">{symbols}</div>;
}

export default React.memo(CurrencyOverlay);