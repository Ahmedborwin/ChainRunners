import React, { useState, useEffect } from "react"
import styled from "styled-components"

// ABIs
import ChainRunners_ABI from "../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../config/chainRunnerAddress.json"

// Hooks
import { useContractWrite, usePrepareContractWrite } from "wagmi"
import useWalletConnected from "../hooks/useAccount"
import useChainLinkFunctions from "../hooks/useChainLinkFunctions"

// Images
import mapsImage from "../assets/images/chain.jpg"

// Redux
import { useDispatch } from "react-redux"

// Store
import { exchangeToken } from "../store/tokenExchange"

const CLIENT_ID = "116415"
const CLIENT_SECRET = "4784e5e419141ad81ecaac028eb765f0311ee0af"
const REDIRECT_URI = "http://localhost:3000" // Replace with your actual redirect URI
const SCOPE = "read,activity:read_all"

const STRAVA_AUTH_URL = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: linear-gradient(to right, #0d2137, #19ddd3);
    color: #ffffff;
`

const Body = styled.div`
    font-family: "Arial, sans-serif";
    display: flex;
    align-items: center;
    justify-content: center;
    height: 800px;
    width: 80%; /* Adjust the width as needed */
    max-width: 400px; /* Set a maximum width */
    background-image: url(${mapsImage});
    background-color: #f2f2f2; /* Light gray background color */
    border-radius: 20px; /* Rounded corners */
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); /* Box shadow for depth */
`

const ContentContainer = styled.div`
    text-align: center;
`

const Title = styled.h1`
    color: #ffffff;
`

const LoginButton = styled.button`
    padding: 10px 20px;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    background-color: #18729c;
    border-color: #0d6efd;
`

const StravaAccountCreation = () => {
    const dispatch = useDispatch()

    const [isLoading, setIsLoading] = useState(false)
    const [athlete, setAthlete] = useState(null)
    const [accessToken, setAccessToken] = useState(null)

    const { chain } = useWalletConnected()

    useChainLinkFunctions(accessToken)

    // Prepare contract write
    const { config } = usePrepareContractWrite({
        address: ChainRunnersAddresses[chain],
        abi: ChainRunners_ABI,
        functionName: "createAthlete",
        args: [athlete?.username, athlete?.id],
        enabled: Boolean(athlete),
    })

    // Write contract
    useContractWrite(config)

    const redirectToStravaAuthorization = () => {
        window.location.href = STRAVA_AUTH_URL
    }

    const handleTokenExchange = (code) => {
        setIsLoading(true)

        dispatch(
            exchangeToken({
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                redirectUri: REDIRECT_URI,
                authorizationCode: code,
            })
        )
            .then((response) => {
                console.log("Token exchange successful:", response)
                setAccessToken(response.accessToken)
                setAthlete(response.athlete)
            })
            .catch((error) => {
                console.error("Token exchange error:", error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const authorizationCode = urlParams ? urlParams.get("code") : null

        if (authorizationCode) {
            handleTokenExchange(authorizationCode)
        } else {
            console.error("Authorization code not found in URL parameters.")
        }
    }, [])

    return (
        <Container>
            <Body>
                <ContentContainer>
                    <Title>Create Your Strava Account</Title>
                    <p>Connect with Strava to start tracking your activities!</p>
                    <LoginButton onClick={redirectToStravaAuthorization} disabled={isLoading}>
                        {isLoading ? "Connecting..." : "Connect with Strava"}
                    </LoginButton>
                </ContentContainer>
            </Body>
        </Container>
    )
}

export default StravaAccountCreation
