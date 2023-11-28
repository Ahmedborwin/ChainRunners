import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import styled from 'styled-components';

// Components
import Dashboard from './Dashboard';
import Navigation from './Navigation';
import Loading from './Loading';
import StravaAccountCreation from './StravaAccount';

import mapsImage from '../assets/images/maps.jpg';

// Redux
import { useSelector } from 'react-redux';

// Store
import { selectUserData } from '../store/reducers/tokenExchangeReducer';

// ABIs: Import your contract ABIs here
// import TOKEN_ABI from '../abis/Token.json'

// Config: Import your network config here
// import config from '../config.json';

const AppContainer = styled("div")`
  position: relative;
  background-image: url(${mapsImage});
  background-size: cover;
  background-position: center;
  min-height: 100vh;
`;

const LeftVerticalLine = styled("div")`
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: #fc4c02; /* Orange color */
    left: 0;
    top: 0;
`;

const RightVerticalLine = styled("div")`
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: #ffd700; /* Gold color */
    right: 0;
    top: 0;
`;

function App() {
  const [account, setAccount] = useState(null)
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { data } = useSelector(selectUserData);

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  useEffect(() => {
    if (Object.keys(data).length > 0)
      setDataLoaded(true);
    else setDataLoaded(false);
  }, [data])

  return (
    <AppContainer>

      {dataLoaded &&
        <Navigation account={`${data.athlete.firstname} ${data.athlete.lastname}`} />
      }

      <LeftVerticalLine />
      <RightVerticalLine />

      <h1
        className='my-4 text-center'
        style={{
          padding: '2%',
          background: 'linear-gradient(to right, #fc4C02, #ffd700)', // Orange to gold gradient
          color: '#ffffff', // White text color
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Box shadow
          borderRadius: '12px', // Border radius for rounded corners
        }}
      >
        Welcome to ChainRunners
      </h1>

      {isLoading
        ? <Loading />
        : !dataLoaded && <StravaAccountCreation userAccountDetails={data} />
      }

      {!isLoading && dataLoaded && <Dashboard />}
    </AppContainer>
  )
}

export default App;
