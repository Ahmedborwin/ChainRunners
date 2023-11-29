import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const colorRun = keyframes`
    0% {
        color: #fdfb31;
    }
    25% {
        color: #b7ff00;
    }
    50% {
        color: #38ff7f;
    }
    75% {
        color: #b7ff00;
    }
    100% {
        color: #fdfb31;
    }
`;

const StyledGreeter = styled.h1`
    padding: 2%;
    background: linear-gradient(to right, #0d2137, #19ddd3);
    color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
    position: relative;

    &.run-animation {
        animation: ${colorRun} 5s linear infinite;
    }
`;

const Greeter = () => {
    const greeterRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            runEffect();
        }, 10000); // Run the effect every 10 seconds

        // Clean up the interval when the component is unmounted
        return () => clearInterval(interval);
    }, []);

    const runEffect = () => {
        // Trigger the running effect
        if (greeterRef.current) {
            greeterRef.current.classList.remove('run-animation');
            void greeterRef.current.offsetWidth; // Trigger reflow
            greeterRef.current.classList.add('run-animation');
        }
    };

    return (
        <StyledGreeter
            className='my-4 text-center run-animation' // Initial state with the class
            ref={greeterRef}
        >
            Welcome to ChainRunners
        </StyledGreeter>
    );
};

export default Greeter;
