import React, { useState, useEffect } from "react"
import { formatEther, parseEther } from "viem"
import styled from "styled-components"
import { Form, Button, Card, Table } from "react-bootstrap"

// ABIs
import ChainRunners_ABI from "../../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../../config/chainRunnerAddress.json"

// Hooks
import { useContractWrite, usePrepareContractWrite, useContractRead } from "wagmi"
import useWalletConnected from "../../hooks/useAccount"

const MyCompetitions = ({ competitionId }) => {
    const [renderComp, setRenderComp] = useState(false)
    const [competitionDetails, setCompetitionDetails] = useState({})
    const [getCompetitionInformation, setGetCompetitionInformation] = useState(false)
    const [startComp, setStartComp] = useState(false)
    const [compId, setCompId] = useState(null)
    const [startCompetitionReady, setStartCompetitionReady] = useState(false)
    const [abortCompetitionReady, setAbortCompetitionReady] = useState(false)
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

    // Prepare contract write to start Competition
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

    // start competition
    const { write: joinCompetition } = useContractWrite(prepareStartComp)

    // Prepare contract write to abort Competition
    const { config: prepareAbortComp } = usePrepareContractWrite({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "abortCompetition",
        args: [compId],
        enabled: abortCompetitionReady,
        onError(error) {
            window.alert(error)
            setAbortCompetitionReady(false) // Reset the state after the operation
        },
        onSuccess(data) {
            console.log("Abort competition preparation success", data)
            setAbortCompetitionReady(false) // Reset the state after the operation
        },
        onSettled(data, error) {
            if (data) {
                console.log("Abort Comp Prepare write Settled Successfully", { data })
            } else if (error) {
                console.log("Abort Comp Prepare write settled with error", { error })
            }
        },
    })

    // join competition
    const { write: abortCompetition } = useContractWrite(prepareAbortComp)

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
            }
        }
    }, [competitionForm])

    //handle start competition
    const handleStartCompetition = async (_compId) => {
        setCompId(_compId)
        setStartCompetitionReady(true)
    }

    //handle Abort competition
    const handleAbortCompetition = async (_compId) => {
        setCompId(_compId)
        setAbortCompetitionReady(true)
    }

    useEffect(() => {
        if (winnerAddress) {
            console.log(winnerAddress)
        }
    }, [winnerAddress])

    useEffect(() => {
        setGetCompetitionInformation(true)
    }, [competitionId])

    //Trigger start competition contract call
    useEffect(() => {
        if (startCompetitionReady && compId && prepareStartComp) {
            console.log(prepareStartComp)
            joinCompetition()
            setStartCompetitionReady(false) // Reset the state after the operation
        }
    }, [startCompetitionReady, compId, prepareStartComp])

    //Trigger abort competition contract call
    useEffect(() => {
        console.log(prepareAbortComp)
        if (abortCompetitionReady && compId && prepareAbortComp) {
            abortCompetition()
            setAbortCompetitionReady(false) // Reset the state after the operation
        }
    }, [abortCompetitionReady, compId, prepareAbortComp])

    return (
        <>
            {renderComp && (
                <tr>
                    <th scope="row">{competitionDetails.name}</th>
                    <td>{competitionDetails.status}</td>
                    <td>
                        <button
                            className={`${
                                startComp
                                    ? "bg-[#18729c] hover:bg-[#0f5261] cursor-pointer"
                                    : "bg-[#ccc] cursor-not-allowed opacity-50"
                            }`}
                            onClick={
                                startComp
                                    ? () => handleStartCompetition(competitionDetails.id)
                                    : null
                            }
                            disabled={!startComp}
                        >
                            Start Competition
                        </button>
                    </td>
                    <td>
                        <button
                            className={`${
                                startComp
                                    ? "bg-[#18729c] hover:bg-[#0f5261] cursor-pointer"
                                    : "bg-[#ccc] cursor-not-allowed opacity-50"
                            }`}
                            onClick={
                                startComp
                                    ? () => handleAbortCompetition(competitionDetails.id)
                                    : null
                            }
                            disabled={!startComp}
                        >
                            Abort Competition
                        </button>
                    </td>
                </tr>
            )}
        </>
    )
}

export default MyCompetitions
