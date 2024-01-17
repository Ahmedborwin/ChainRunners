import styled from "styled-components"
import { useEffect, useRef, useState } from "react"
import { useContractRead } from "wagmi"

// Components
import Dashboard from "./Dashboard/index"
import StravaAccountCreation from "./StravaAccount"
import WalletConnect from "./WalletConnect"

// Images
import mapsImage from "../assets/images/chain.jpg"

//Address and ABIs
import ChainRunners_ABI from "../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../config/chainRunnerAddress.json"

// Redux
import { useSelector } from "react-redux"

// Store
import { selectAuthDetails } from "../store/tokenExchange"

import { useAccount, useNetwork } from "wagmi"

const AppContainer = styled("div")`
    position: relative;
    background-image: url(${mapsImage});
    background-size: cover;
    min-height: 100vh;
`

function App() {
    const [athleteProfile, setAthleteProfile] = useState({})

    const authDetails = useSelector(selectAuthDetails)

    const { address: walletConnected, isConnected, address } = useAccount()
    const { chain } = useNetwork()

    // useRef to store the initial wallet address
    const initialWalletRef = useRef(null)

    // Read athlete table
    const { data: athleteTable } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "athleteTable",
        args: [address],
    })

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

    useEffect(() => {
        if (athleteTable) {
            const newAthleteProfile = {
                username: athleteTable[0],
                stravaId: athleteTable[1],
                totalMeters: parseInt(athleteTable[2]) / 1000,
                registeredAthlete: athleteTable[3],
            }
            setAthleteProfile(newAthleteProfile)
            console.log("athlete?", athleteProfile.registeredAthlete)
        }
    }, [athleteTable])

    return (
        <AppContainer>
            {!walletConnected ? (
                <WalletConnect />
            ) : !authDetails || !athleteProfile.registeredAthlete ? (
                <StravaAccountCreation userAccountDetails={authDetails} />
            ) : (
                <Dashboard athlete={authDetails?.athlete} address={walletConnected} />
            )}
        </AppContainer>
    )
}

export default App
