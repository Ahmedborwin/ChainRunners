import styled from "styled-components"

// Components
import Dashboard from "./Dashboard/index"
import Greeter from "./Greeter"
import StravaAccountCreation from "./StravaAccount"
import WalletConnect from "./WalletConnect"

// Images
import mapsImage from "../assets/images/chain.jpg"

// Redux
import { useSelector } from "react-redux"

// Store
import { selectAuthDetails } from "../store/tokenExchange"

// Hooks
import useWalletConnected from "../hooks/useAccount"

const AppContainer = styled("div")`
    position: relative;
    background-image: url(${mapsImage});
    background-size: cover;
    min-height: 100vh;
`

function App() {
    const authDetails = useSelector(selectAuthDetails)
    const { address: walletConnected } = useWalletConnected()

    return (
        <AppContainer>
            {!walletConnected ? (
                <WalletConnect />
            ) : !authDetails ? (
                <StravaAccountCreation userAccountDetails={authDetails} />
            ) : (
                <Dashboard athlete={authDetails?.athlete} address={walletConnected} />
            )}
        </AppContainer>
    )
}

export default App
