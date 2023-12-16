import React, { useRef, useEffect } from "react";
import styled, { keyframes } from 'styled-components';

// Components
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Images
import logo from '../assets/images/image.png';

// Styles
const WalletContainer = styled("div")`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    // background-color: #0d2137;
    background: linear-gradient(to right, #0d2137, #19ddd3);
    color: #ffffff;
`

const Title = styled("h1")`
    font-size: 2.5rem;
    margin-bottom: 20px;
`

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

const Brand = styled('p')`
    // padding: 1%;
    // background: linear-gradient(to right, #0d2137, #19ddd3);
    color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
    position: relative;

    &.run-animation {
        animation: ${colorRun} 5s linear infinite;
    }
`

const LogoImg = styled.img`
  width: 200px; /* Adjust the width as needed */
  height: auto;
  transition: transform 0.3s ease-in-out;
  margin-bottom: 100px;

  &:hover {
    transform: scale(1.5);
  }
`;

const WalletConnect = () => {
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
        <WalletContainer className="wallet-connect-container">
            <LogoImg
                alt="logo"
                src={logo}
                className="d-inline-block align-top mx-3"
            />
            <Title>Welcome to
                <Brand ref={greeterRef}>
                    &nbsp; ChainRunners &nbsp;
                </Brand>
            </Title>
            <p>Connect your wallet to get started</p>
            <ConnectButton>
                Connect Wallet
            </ConnectButton>
        </WalletContainer>
    );
}

export default WalletConnect;
