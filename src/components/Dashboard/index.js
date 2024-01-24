import React, { useState, useEffect } from "react"
import { Card } from "react-bootstrap"
import Swal from "sweetalert2"
import styled from "styled-components"
import { formatEther } from "viem"
import { useContractEvent } from "wagmi"

// ABIs
import ChainRunners_ABI from "../../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../../config/chainRunnerAddress.json"
import ChainRunnersTokenAddresses from "../../config/chainRunnerTokenAddress.json"
import ChainRunnersTokenABI from "../../config/chainRunnerTokenAbi.json"

// Components
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

const TableTitle = styled("h4")`
    text-colour: #ffffff;
    font-size: 1.5rem;
    text-transform: uppercase;
`

const CenteredCards = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
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

const TableCard = styled(Card)`
    background: rgba(13, 33, 55, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
`

const Dashboard = ({ athlete }) => {
    const [athleteProfile, setAthleteProfile] = useState({})
    const [athleteWinningStats, setAthleteWinningStats] = useState({})
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

    //Read winner statistics used to get CompetitionWon by Address
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

    //read chainrunners for competitionId's
    const { data: competitionCount } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "competitionId",

        onSettled(data, error) {
            if (data) {
                console.log("Comp Count Success", data)
            } else if (error) {
                console.log("Comp Count Error", error)
            }
        },
    })

    useEffect(() => {
        if (athleteTable) {
            const newAthleteProfile = {
                username: athleteTable[0],
                stravaId: athleteTable[1],
                totalMeters: parseInt(athleteTable[2]) / 1000,
                registeredAthlete: athleteTable[3],
            }
            setAthleteProfile(newAthleteProfile)
        }
    }, [athleteTable])

    //Get Competitions Won for signed in Athlete
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
            console.log("athleteWinningStats", athleteWinningStats)
        }
    }, [winnerStatistics])

    useEffect(() => {
        if (competitionCount > 0) {
            //create array of compID's
            const _compIdArray = []
            for (let i = 1; i <= competitionCount; i++) {
                _compIdArray.push(i)
            }
            setCompIdArray(_compIdArray)
        }
    }, [competitionCount])

    //read tokens balance from token Contract
    useEffect(() => {
        if (tokens > 0) {
            const formattedTokens = formatEther(tokens)
            setTokensOwned(formattedTokens)
        } else {
            setTokensOwned(0)
        }
    }, [tokens, tokensOwned])

    //comp Started Event Listener
    useContractEvent({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        eventName: "competitionStarted",
        listener(log) {
            console.log("comp started", log)
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Competition Started Succesfully!",
                showConfirmButton: false,
                timer: 1500,
            }).then(() => {
                window.location.reload(true)
            })
        },
    })

    //Comp Aborted Event
    useContractEvent({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        eventName: "competitionAborted",
        listener(log) {
            console.log("comp Aborted", log)
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Competition Aborted Succesfully!",
                showConfirmButton: false,
                timer: 1500,
            }).then(() => {
                window.location.reload(true)
            })
        },
    })

    // //Interval Winner Picked Event Listener
    // useContractEvent({
    //     address: ChainRunnersAddresses[chain.id],
    //     abi: ChainRunners_ABI,
    //     eventName: "IntervalWinnerEvent",
    //     listener(log) {
    //         console.log("log", log)
    //         const winnerAddress = log[0].args.winnerAddress

    //         Swal.fire({
    //             title: `Interval Winner Picked! The winners Address is: ${winnerAddress}`,
    //             width: 600,
    //             padding: "3em",
    //             color: "#716add",
    //             background: "#fff url(/images/trees.png)",
    //             backdrop: `
    //               rgba(0,0,123,0.4)
    //               url("/images/nyan-cat.gif")
    //               left top
    //               no-repeat
    //             `,
    //         }).then(() => {
    //             window.location.reload(true)
    //         })
    //     },
    // })

    //Test overall current winner
    useContractEvent({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        eventName: "testCurrentOverAllWinner",
        listener(log) {
            console.log("log", log)
            const winnerAddress = log[0].args._athlete

            Swal.fire({
                title: `Current Overall Winner is:  ${winnerAddress}`,
                width: 600,
                padding: "3em",
                color: "#716add",
                background: "#fff url(/images/trees.png)",
                backdrop: `
                      rgba(0,0,123,0.4)
                      url("/images/nyan-cat.gif")
                      left top
                      no-repeat
                    `,
            }).then(() => {
                window.location.reload(true)
            })
        },
    })

    //Winner Picked Event Listener
    useContractEvent({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        eventName: "winnerPicked",
        listener(log) {
            const winnerAddress = log[0].args.winnnerAddress
            console.log("Winner picked log", log)

            Swal.fire({
                title: `Winner Picked! The winners Address is: ${winnerAddress}`,
                width: 600,
                padding: "3em",
                color: "#716add",
                background: "#fff url(/images/trees.png)",
                backdrop: `
                  rgba(0,0,123,0.4)
                  url("/images/nyan-cat.gif")
                  left top
                  no-repeat
                `,
            }).then(() => {
                window.location.reload(true)
            })
        },
    })

    return (
        <>
            <div className=" p-2 ">
                <DashboardTitle className="text-center my-2 text-white bg-blue-800 uppercase text-4xl mb-5 shadow-xl rounded-lg px-4 py-2">
                    {athlete?.firstname} {athlete?.lastname}'s Dashboard
                </DashboardTitle>

                <CenteredCards>
                    <InfoCards className="text-center">
                        <strong>Competitions Won: </strong>
                        <span>{athleteWinningStats?.competitionsWon}</span>
                    </InfoCards>
                    <InfoCards className="text-center">
                        <strong>Intervals Won: </strong>
                        <span>{athleteWinningStats?.intervalsWon}</span>
                    </InfoCards>
                    <InfoCards className="text-center">
                        <strong>Distance Logged: </strong>
                        <span>{athleteProfile?.totalMeters} KM</span>
                    </InfoCards>
                    <InfoCards className="text-center">
                        <strong>ChainRunner Tokens:</strong> <span>{tokensOwned}</span> CRT
                    </InfoCards>
                </CenteredCards>

                <TableCard>
                    <TableTitle className="text-white p-1 text-bold">Competitions</TableTitle>
                    <table className="table table-striped table-light">
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
                </TableCard>
            </div>
        </>
    )
}

export default Dashboard
