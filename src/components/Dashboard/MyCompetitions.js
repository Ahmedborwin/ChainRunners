import React, { useState, useEffect } from "react"
import { formatEther, parseEther } from "viem"
import styled from "styled-components"
import { Form, Button, Card } from "react-bootstrap"

// ABIs
import ChainRunners_ABI from "../../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../../config/chainRunnerAddress.json"

// Hooks
import { useContractWrite, usePrepareContractWrite, useContractRead } from "wagmi"
import useWalletConnected from "../../hooks/useAccount"
const FlexGridContainer = styled.div`
    display: flex;
    flex-direction: row;
    wrap: nowrap;
    gap: 2px; /* Adjust the gap as needed */
    overflow-x: auto; /* Add horizontal scrolling if items overflow */
`
const GridItem = styled.div`
    border: 1px solid #ccc;
    padding: 10px;
    box-sizing: border-box;
    flex: 0 1 auto; /* Allow shrinking but not growing */
    min-width: 130px; /* Set a minimum width for each item */

    /* Default flex-basis for small screens (e.g., mobile devices) */
    flex-basis: calc(100% - 10px); /* Full width minus the gap */

    /* Medium screens (e.g., tablets) */
    @media (min-width: 600px) {
        flex-basis: calc(50% - 10px); /* Half width for 2 items per row */
    }

    /* Large screens (e.g., desktops) */
    @media (min-width: 1024px) {
        flex-basis: calc(33.333% - 10px); /* One-third width for 3 items per row */
    }

    /* Extra large screens */
    @media (min-width: 1440px) {
        flex-basis: calc(25% - 10px); /* One-fourth width for 4 items per row */
    }
`

const ScrollableGridContainer = styled.div`
    display: column;
    flex-direction: column;
    overflow-x: auto; // Enable horizontal scrolling
    width: 100%; // Adjust the width as needed
`

const MyCompetitions = ({ competitionId }) => {
    const [renderComp, setRenderComp] = useState(false)
    const [competitionDetails, setCompetitionDetails] = useState({})
    const [getCompetitionInformation, setGetCompetitionInformation] = useState(false)
    const [startComp, setStartComp] = useState(false)
    const [compId, setCompId] = useState(null)
    const [startCompetitionReady, setStartCompetitionReady] = useState(false)
    const [compInProgress, setCompInProgress] = useState(false)
    const [compClosed, setCompClosed] = useState(false)
    const [compAborted, setCompAborted] = useState(false)
    const [winnersAddress, setWinnersAddress] = useState(null)
    //functions
    function formatDate(epoch) {
        var date = new Date(epoch * 1000) // Convert epoch to milliseconds

        const localString = date.toLocaleString()

        // Assuming dateString is in the format "dd/mm/yyyy, hh:mm:ss"
        var parts = localString.split(/[/, :]/)
        // parts is ["dd", "mm", "yyyy", "hh", "mm", "ss"]

        var day = parts[0]
        var month = parts[1] - 1 // Month is 0-indexed in JavaScript
        var year = parts[2]
        var hours = parts[3]
        var minutes = parts[4]
        var seconds = parts[5]

        if ((hours = 0)) {
            hours = "00"
        }

        var date = new Date(year, month, day, hours, minutes, seconds)

        // Now format the date as you like

        return `${day}/${month + 1}/${year} ${hours}:${minutes}:${seconds}`
    }

    //hooks
    const { chain, address, wallet } = useWalletConnected()

    // Read competition table
    const { data: competitionForm } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "competitionTable",
        args: [competitionId],
        enabled: getCompetitionInformation,
        onError(error) {
            setGetCompetitionInformation(false)
            window.alert(error)
        },
        onSuccess(data) {
            console.log("competition table", data)
            setGetCompetitionInformation(false)
        },
    })

    // Read competition table
    const { data: winnerAddress } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "overAllWinnerByComp",
        args: [competitionId],
        onError(error) {
            window.alert(error)
        },
        onSuccess(data) {
            setWinnersAddress(data)
            console.log("winners address", data)
        },
    })

    // Prepare contract write to join Competition
    const { config: prepareStartComp } = usePrepareContractWrite({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "commenceCompetition",
        args: [compId],
        enabled: startCompetitionReady,
        onError(error) {
            window.alert(error)
            setStartCompetitionReady(false) // Reset the state after the operation
        },
        onSuccess(data) {
            console.log("start competition preparation success", data)
            setStartCompetitionReady(false) // Reset the state after the operation
        },
        onSettled(data, error) {
            if (data) {
                console.log("Start Comp Prepare write Settled Successfully", { data })
            } else if (error) {
                console.log("Start Comp Prepare write settled with error", { error })
            }
        },
    })

    // join competition
    const { data, write: joinCompetition, isSuccess } = useContractWrite(prepareStartComp)

    //set state for retreived comp table
    useEffect(() => {
        if (competitionForm) {
            const status = {
                0: "PENDING",
                1: "IN_PROGRESS",
                2: "CLOSED",
                3: "ABORTED",
            }

            const competitionDetails = {
                id: parseInt(competitionForm[0]),
                name: competitionForm[1],
                status: status[competitionForm[2]],
                adminAddress: competitionForm[3],
                startDate: parseInt(competitionForm[4]),
                durationDays: parseInt(competitionForm[5]),
                endDate: parseInt(competitionForm[6]),
                nextPayoutDate: parseInt(competitionForm[7]),
                payoutIntervals: parseInt(competitionForm[8]),
                startDeadline: parseInt(competitionForm[9]),
                buyInAmount: parseInt(competitionForm[10]),
                totalStakedAmount: parseInt(competitionForm[11]),
                prizeReward: parseInt(competitionForm[12]),
            }
            competitionDetails.startDeadline = formatDate(competitionDetails.startDeadline)

            setCompetitionDetails(competitionDetails)

            //check if comp status is pending
            if (competitionDetails.adminAddress == address) {
                setRenderComp(true)
            }
            if (competitionDetails.status === "PENDING") {
                setStartComp(true)
            } else if (competitionDetails.status === "IN_PROGRESS") {
                setCompInProgress(true)
            } else if (competitionDetails.status === "CLOSED") {
                setCompClosed(true)
            } else if (competitionDetails.status === "ABORTED") {
                setCompAborted(true)
            }
        }
    }, [competitionForm])

    //handle start competition
    const handleStartCompetition = async (_compId) => {
        console.log(_compId)
        setCompId(_compId)
        setStartCompetitionReady(true)
    }

    useEffect(() => {
        setGetCompetitionInformation(true)
    }, [competitionId])

    useEffect(() => {
        if (startCompetitionReady && compId && prepareStartComp) {
            joinCompetition()
            setStartCompetitionReady(false) // Reset the state after the operation
        }
    }, [startCompetitionReady, compId, prepareStartComp])

    return (
        <div>
            {renderComp && (
                <FlexGridContainer>
                    <GridItem>{competitionDetails.name}</GridItem>
                    <GridItem>{competitionDetails.status}</GridItem>
                    {startComp && (
                        <GridItem>
                            <Button
                                style={{ backgroundColor: "#18729c" }}
                                onClick={() => handleStartCompetition(competitionDetails.id)}
                            >
                                Start Competition
                            </Button>
                        </GridItem>
                    )}
                    {!startComp && (
                        <GridItem>
                            <Button style={{ backgroundColor: "#444444" }}>
                                Start Competition
                            </Button>
                        </GridItem>
                    )}
                </FlexGridContainer>
            )}
            {/* {startComp && (
                        <>
                            <GridItem>
                                {formatEther(competitionDetails.totalStakedAmount)} ETH
                            </GridItem>
                            <GridItem> {competitionDetails.startDeadline}</GridItem>
                            <GridItem>
                                <Button
                                    style={{ backgroundColor: "#18729c" }}
                                    onClick={() => handleStartCompetition(competitionDetails.id)}
                                >
                                    Start Competition
                                </Button>
                            </GridItem>
                        </>
                    )}
                    {compClosed && (
                        <>
                            <GridItem> {winnerAddress}</GridItem>
                        </>
                    )} */}
        </div>
    )
}

export default MyCompetitions
