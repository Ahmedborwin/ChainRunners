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
import { selectUserData } from '../store/reducers/tokenExchangeReducer';

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
  const [isLoading, setIsLoading] = useState(true);

  const { data } = useSelector(selectUserData);

  useEffect(() => {
    if (data && Object.keys(data).length > 0)
      setIsLoading(false);
    else setIsLoading(true);
  }, [data])

  return (
    <AppContainer>

      {!isLoading &&
        <Navigation account={`${data.athlete.firstname} ${data.athlete.lastname}`} />
      }

      <LeftVerticalLine />
      <RightVerticalLine />

      <Greeter />

      {isLoading
        ? <StravaAccountCreation userAccountDetails={data} />
        : <Dashboard />
      }

    </AppContainer>
  )
}

export default App;
