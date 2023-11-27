import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Dashboard from './Dashboard';
import Navigation from './Navigation';
import Loading from './Loading';
import StravaAccountCreation from './StravaAccount';

// Redux
import { useSelector } from 'react-redux';

// Store
import { selectUserData } from '../store/reducers/tokenExchangeReducer';

// ABIs: Import your contract ABIs here
// import TOKEN_ABI from '../abis/Token.json'

// Config: Import your network config here
// import config from '../config.json';

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
    <Container>

      {dataLoaded &&
        <Navigation account={`${data.athlete.firstname} ${data.athlete.lastname}`} />
      }

      <h1 className='my-4 text-center'>Welcome to ChainRunners</h1>

      {isLoading
        ? <Loading />
        : !dataLoaded && <StravaAccountCreation userAccountDetails={data} />
      }

      {!isLoading && dataLoaded && <Dashboard />}
    </Container>
  )
}

export default App;
