import { useEffect, useState } from 'react'
import styled from 'styled-components';

// Components
import Dashboard from './Dashboard';
import Greeter from './Greeter';
import Navigation from './Navigation';
import StravaAccountCreation from './StravaAccount';

// Images
import mapsImage from '../assets/images/chain.jpg';

// Redux
import { useSelector } from 'react-redux';

// Store
import { selectAuthDetails } from '../store/tokenExchange';
import WalletConnect from './WalletConnect';
import useWalletConnected from '../hooks/useAccount';

const AppContainer = styled("div")`
  position: relative;
  background-image: url(${mapsImage});
  background-size: cover;
  min-height: 100vh;
`;

const LeftVerticalLine = styled("div")`
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: #0d2137;
    left: 0;
    top: 0;
`;

const RightVerticalLine = styled("div")`
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: #19ddd3;
    right: 0;
    top: 0;
`;

function App() {
  const authDetails = useSelector(selectAuthDetails);
  const { address: walletConnected } = useWalletConnected();

  return (
    <AppContainer>

      {walletConnected && (
        <>
          <Navigation account={authDetails ? `${authDetails?.athlete.firstname} ${authDetails?.athlete.lastname}` : null} />
          <LeftVerticalLine />
          <RightVerticalLine />
        </>
      )}

      {/* <Greeter /> */}

      {!walletConnected
        ? <WalletConnect />
        : (
          !authDetails
            ? <StravaAccountCreation userAccountDetails={authDetails} />
            : <Dashboard
              athlete={authDetails?.athlete}
              address={walletConnected}
            />
        )
      }
    </AppContainer>
  )
}

export default App;
