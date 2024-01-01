import React, { useState, useEffect } from "react"
import { Card } from "react-bootstrap"

import { Link } from "react-router-dom"
import styled from "styled-components"
import { formatEther } from "viem"

// ABIs
import ChainRunners_ABI from "../../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../../config/chainRunnerAddress.json"
import ChainRunnersTokenAddresses from "../../config/chainRunnerTokenAddress.json"
import ChainRunnersTokenABI from "../../config/chainRunnerTokenAbi.json"

// Components
import CompetitionHeaders from "./CompetitionHeaders"
import Greeter from "../Greeter"
import MyCompetitions from "./MyCompetitions"

// Hooks
import { useContractRead } from "wagmi"
import useWalletConnected from "../../hooks/useAccount"

const DashboardTitle = styled("h2")`
    color: #ffffff;
    background: #0d2137;
    text-transform: uppercase;
    font-size: 2.5rem; /* Increase font size for prominence */
    margin-bottom: 15px; /* Add some spacing at the bottom */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 10);
    border-radius: 12px;
`

const CenteredCards = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap; /* Wrap the cards when the screen is not wide enough */
    gap: 15px; /* Adjust the gap between cards */
`
const InfoCards = styled.div`
    width: 100%; /* Each card takes the full width on small screens */
    max-width: 18rem; /* Set a maximum width for larger screens */
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 20px; /* Add margin between cards */
    background-color: #ffffff;
    span {
        text-decoration: underline;
    }
`

const Dashboard = ({ athlete }) => {
    const [athleteProfile, setAthleteProfile] = useState({})
    const [athleteWinningStats, setAthleteWinningStats] = useState({})
    const [competitionDetails, setCompetitionDetails] = useState({})
    const [compIdArray, setCompIdArray] = useState([])
    const [tokensOwned, setTokensOwned] = useState(0)

    const { chain, address } = useWalletConnected()

    // Read athlete table
    const { data: athleteTable } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "athleteTable",
        args: [address],
    })

    //Read winner statistics
    const { data: winnerStatistics } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "athleteStats",
        args: [address],
        onSettled(data, error) {
            console.log("Settled winner stats read", { data, error })
        },
    })

    //Read ChainRunners Token Contract
    const { data: tokens } = useContractRead({
        address: ChainRunnersTokenAddresses[chain.id],
        abi: ChainRunnersTokenABI,
        functionName: "balanceOf",
        args: [address],
        onSettled(data, error) {
            console.log("Settled Tokens Balance read", { data, error })
        },
    })

    // // Read athlete competitions
    // const { data: athleteCompetitions } = useContractRead({
    //     address: ChainRunnersAddresses[chain.id],
    //     abi: ChainRunners_ABI,
    //     functionName: "listAthleteCompetitions",
    //     args: [address],
    // })

    //read chainrunners for competitionId's
    const { data: competitionCount } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "competitionId",

        onError(error) {
            window.alert(error)
        },
        onSuccess(data) {
            console.log("Last Comp Id:", data)
        },
        onSettled(data, error) {
            console.log("Settled", { data, error })
        },
    })

    useEffect(() => {
        if (athleteTable) {
            const newAthleteProfile = {
                username: athleteTable[0],
                stravaId: athleteTable[1],
                totalMeters: parseInt(athleteTable[2]),
                registeredAthlete: athleteTable[3],
            }
            setAthleteProfile(newAthleteProfile)
        }
    }, [athleteTable])

    useEffect(() => {
        if (winnerStatistics) {
            const newAthleteWinningStats = {
                competitionsWon: parseInt(winnerStatistics[0]),
                intervalsWon: parseInt(winnerStatistics[1]),
                tokensEarned: null,
            }
            let athletesWinnings
            if (winnerStatistics[2] == 0) {
                athletesWinnings = winnerStatistics[2]
            } else {
                athletesWinnings = formatEther(winnerStatistics[2])
            }
            newAthleteWinningStats.tokensEarned = athletesWinnings
            setAthleteWinningStats(newAthleteWinningStats)
        }
    }, [winnerStatistics])

    useEffect(() => {
        if (competitionCount > 0) {
            //create array of compID's
            console.log("competitionCount", competitionCount)
            const _compIdArray = []
            for (let i = 1; i <= competitionCount; i++) {
                _compIdArray.push(i)
            }
            setCompIdArray(_compIdArray)
        }
    }, [competitionCount])

    useEffect(() => {
        if (tokens > 0) {
            const formattedTokens = formatEther(tokens)
            setTokensOwned(formattedTokens)
        } else {
            setTokensOwned(0)
        }
    }, [tokens, tokensOwned])

    return (
        <>
            <Greeter />
            <div className="relative p-5 bg-no-repeat bg-cover bg-center items-center">
                <DashboardTitle className="text-center my-4 text-white bg-blue-800 uppercase text-4xl mb-5 shadow-xl rounded-lg px-4 py-2">
                    {athlete?.firstname} {athlete?.lastname}'s Dashboard
                </DashboardTitle>

                <CenteredCards>
                    <InfoCards className="text-center">
                        <strong>Competitions Won: </strong>
                        <span>{athleteWinningStats.competitionsWon}</span>
                    </InfoCards>
                    <InfoCards className="text-center">
                        <strong>ChainRunner Tokens:</strong> <span>{tokensOwned}</span> CRT
                    </InfoCards>
                </CenteredCards>

                <Card className="">
                    <h4>Your Competitions:</h4>
                    <table class="table table-striped table-light">
                        <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Status</th>
                                <th scope="col">Start</th>
                                <th scope="col">Abort</th>
                            </tr>
                        </thead>
                        <tbody>
                            {compIdArray.length > 0 &&
                                compIdArray.map((compId, index) => (
                                    <MyCompetitions key={index} competitionId={compId} />
                                ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            <CenteredCards>
                <div className="flex-row flex-nowrap flex-auto justify-center ">
                    <Link to="/create-competition">
                        <button className="">Create Competition</button>
                    </Link>
                    <Link to="/join-competition">
                        <button className="">Join Competition</button>
                    </Link>
                    <Link to="/nft-portfolio">
                        <button className="">NFT Portfolio</button>
                    </Link>
                </div>
            </CenteredCards>
        </>
    )
}

export default Dashboard
