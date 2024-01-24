import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { useContractEvent } from "wagmi"
import Swal from "sweetalert2"

// ABIs
import ChainRunners_ABI from "../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../config/chainRunnerAddress.json"

// Hooks
import { useContractWrite, usePrepareContractWrite } from "wagmi"
import useWalletConnected from "../hooks/useAccount"

import useChainLinkFunctions from "../hooks/useChainLinkFunctions"

// Images
import LoginImage from "../assets/images/chainRunnersLoginScreen.png"

// Redux
import { useDispatch } from "react-redux"

// Store
import { exchangeToken } from "../store/tokenExchange"

const CLIENT_ID = "116415"

const CLIENT_SECRET = "4784e5e419141ad81ecaac028eb765f0311ee0af"

const REDIRECT_URI = "https://localhost:3000" // Replace with your actual redirect UR

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
const ImageContainerLeft = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 38%; /* Half of the container */
    background-image: url(${LoginImage}); /* Use LoginImage */
    background-size: cover; /* Cover the entire div */
    border-radius: 20px 0 0 20px; /* Adjusted rounded corners */
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
`

const ImageContainerRight = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 38%; /* Half of the container */
    background-image: url(${LoginImage}); /* Use LoginImage */
    background-size: cover; /* Cover the entire div */
    background-position: right center;
    border-radius: 20px 0 0 20px; /* Adjusted rounded corners */
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
`

const Body = styled.div`
    font-family: "Arial, sans-serif";
    display: flex;
    flex-direction: row; /* Align elements side by side */
    align-items: center;
    justify-content: space-between; /* Space between elements */
    height: 400px;
    width: 80%;
    max-width: 800px; /* Adjust the total max width as needed */
    border-radius: 20px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
`

const ContentContainer = styled.div`
    text-align: center;
    width: 50%;
    padding: 0 20px;
    font-family: "Comic Sans MS, Fantasy Fonts"; /* Specify the font family */
    font-size: 16px; /* Specify the font size */
    font-weight: normal; /* Specify the font weight (e.g., normal, bold) */
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
    const [athlete, setAthlete] = useState({})
    const [getSingleToken, setGetSingleToken] = useState(false)
    const [tokenObject, setTokenObject] = useState({})
    const [prepareCreateAthleteReady, setPrepareCreateAthleteReady] = useState(false)
    const [createAthleteReady, setCreateAthleteReady] = useState(false)

    const { chain } = useWalletConnected()

    //useChainLinkFunctions(tokenObject.accessToken)

    const redirectToStravaAuthorization = () => {
        window.location.href = STRAVA_AUTH_URL
        setGetSingleToken(true)
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
                const accessTokenData = response["payload"]["data"]

                if (accessTokenData) {
                    setTokenObject({
                        accessToken: accessTokenData["access_token"],
                        refreshToken: accessTokenData["refresh_token"],
                        expiresAt: accessTokenData["expires_at"],
                        expiresIn: accessTokenData["expires_in"],
                    })

                    setAthlete(accessTokenData["athlete"])
                } else {
                    console.error("No token data found in response")
                }
            })
            .catch((error) => {
                console.error("Token exchange error:", error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    //Prepare contract write
    const { config: prepareCreateAthlete } = usePrepareContractWrite({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "createAthlete",
        args: ["Enigma", athlete?.id],
        enabled: prepareCreateAthleteReady,
        onSettled(data, error) {
            if (data) {
                setPrepareCreateAthleteReady(false)
                setCreateAthleteReady(true)
                console.log(data, error)
            } else if (error) {
                setPrepareCreateAthleteReady(false)
                console.log(error, error)
            }
        },
    })

    const { data: createAthleteData, write: createAthleteWrite } =
        useContractWrite(prepareCreateAthlete)

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const authorizationCode = urlParams ? urlParams.get("code") : null

        if (authorizationCode) {
            handleTokenExchange(authorizationCode)
            setGetSingleToken(false)
        } else {
            console.error("Authorization code not found in URL parameters.")
        }
    }, [])

    useEffect(() => {
        if (createAthleteData) {
            console.log(createAthleteData)
        }
    }, [createAthleteData])

    // Athlete Set
    useEffect(() => {
        if (athlete && Object.keys(athlete).length > 0) {
            //Call contract to create new athlete
            console.log("ATHLETE")
            setPrepareCreateAthleteReady(true)
        }
    }, [athlete])

    // tokenObject Set
    useEffect(() => {
        if (tokenObject && Object.keys(tokenObject).length > 0) {
            //TODO
            //upload secrets to DON here
            //write DON secrets version?
        }
    }, [tokenObject])

    useEffect(() => {
        if (createAthleteReady) {
            setCreateAthleteReady(false)
            createAthleteWrite()
        }
    }, [createAthleteReady])

    //comp Started Event Listener
    useContractEvent({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        eventName: "athleteProfileCreated",
        listener(log) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Athlete Created!",
                showConfirmButton: false,
                timer: 1500,
            }).then(() => {
                window.location.reload(true)
            })
        },
    })

    return (
        <Container>
            <Body>
                <ImageContainerLeft></ImageContainerLeft>
                <ContentContainer>
                    <Title>Connect Your Strava Account</Title>
                    <LoginButton onClick={redirectToStravaAuthorization} disabled={isLoading}>
                        {isLoading ? "Connecting..." : "Connect with Strava"}
                    </LoginButton>
                </ContentContainer>
                <ImageContainerRight></ImageContainerRight>
            </Body>
        </Container>
    )
}

export default StravaAccountCreation
