import React, { useState, useEffect } from "react"
import { Button, Card, CardBody, Container } from "react-bootstrap"

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
    margin-bottom: 20px; /* Add some spacing at the bottom */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 10);
    border-radius: 12px;
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
        }
    }, [tokens, tokensOwned])

    return (
        <>
            <Greeter />
            <div className="relative p-5 bg-no-repeat bg-cover bg-center items-center">
                <DashboardTitle className="text-center my-4 text-white bg-blue-800 uppercase text-4xl mb-5 shadow-xl rounded-lg px-4 py-2">
                    {athlete?.firstname} {athlete?.lastname}'s Dashboard
                </DashboardTitle>
                <div className="grid grid-cols-[100px_200px] grid-rows-[100px_50px] gap-x-6 gap-y-6">
                    <Card className="my-5 p-5 rounded-lg shadow-lg bg-white text-black">
                        <p>
                            <strong>Competitions Won</strong>: {athleteWinningStats.competitionsWon}
                        </p>
                    </Card>
                    <Card className="my-5 p-5 rounded-lg shadow-lg bg-white text-black">
                        <p>
                            <strong>ChainRunner Tokens</strong>: {athleteWinningStats.tokensEarned}{" "}
                            CRT
                        </p>
                    </Card>
                </div>

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
        </>
    )
}

export default Dashboard
