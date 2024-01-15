import styled from "styled-components"
import { useEffect, useRef } from "react"
// Components
import Dashboard from "./Dashboard/index"
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
import { useAccount } from "wagmi"

const AppContainer = styled("div")`
    position: relative;
    background-image: url(${mapsImage});
    background-size: cover;
    min-height: 100vh;
`

function App() {
    const authDetails = useSelector(selectAuthDetails)
    const { address: walletConnected, isConnected } = useAccount()

    // useRef to store the initial wallet address
    const initialWalletRef = useRef(null)

    useEffect(() => {
        if (isConnected) {
            if (initialWalletRef.current === null) {
                // Store the initial wallet address
                initialWalletRef.current = walletConnected
            } else if (initialWalletRef.current !== walletConnected) {
                // Reload the app only if the wallet address has changed
                console.log("Wallet address changed. Reloading app.")
                window.location.reload()
            }
        }
    }, [walletConnected, isConnected])

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
