import React, { useState, useEffect } from "react"
import Swal from "sweetalert2"
import styled from "styled-components"

// ABIs
import ChainRunners_ABI from "../../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../../config/chainRunnerAddress.json"

// Hooks
import { useContractWrite, usePrepareContractWrite, useContractRead } from "wagmi"
import useWalletConnected from "../../hooks/useAccount"
import { Button } from "react-bootstrap"

const TableButtons = styled(Button)`
    box-shadow: 0 4px 8px rgba(0, 0, 0, 10);
    border-radius: 12px;
`

const MyCompetitions = ({ competitionId }) => {
    const [renderComp, setRenderComp] = useState(false)
    const [competitionDetails, setCompetitionDetails] = useState({})
    const [getCompetitionInformation, setGetCompetitionInformation] = useState(false)
    const [getAthleteListByComp, setGetAthleteListByComp] = useState([])
    const [startComp, setStartComp] = useState(false)
    const [compId, setCompId] = useState(null)
    const [prepareStartCompReady, setPrepareStartCompReady] = useState(null)
    const [startCompetitionReady, setStartCompetitionReady] = useState(false)
    const [prepareAbortCompReady, setPrepareAbortCompReady] = useState(false)
    const [abortCompetitionReady, setAbortCompetitionReady] = useState(false)

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
    const { chain, address } = useWalletConnected()

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
    const { data: athleteListByCompId } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "getAthleteList",
        args: [competitionId],
        enabled: getAthleteListByComp,
        onSettled(data, error) {
            setGetAthleteListByComp(true)
            if (data) {
                if (data.includes(address)) {
                    setRenderComp(true)
                }
                console.log(competitionId, data)
            } else if (error) {
                console.log("get List of Athlete Error", error)
            }
        },
    })

    // Prepare contract write to start Competition
    const { config: prepareStartComp } = usePrepareContractWrite({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "commenceCompetition",
        args: [compId],
        enabled: prepareStartCompReady,
        onSettled(data, error) {
            if (data) {
                setStartCompetitionReady(true)
                console.log("Start Comp Prepare write Settled Successfully", { data })
            } else if (error) {
                console.log("Start Comp Prepare write settled with error", { error })
                Swal.fire({
                    title: "Create Competition Error",
                    text: `${error}`,
                    icon: "error",
                })
            }
        },
    })

    // start competition
    const {
        write: startCompetition,
        status: createCompStatus,
        isError: startCompError,
    } = useContractWrite(prepareStartComp)

    // Prepare contract write to abort Competition
    const { config: prepareAbortComp } = usePrepareContractWrite({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "abortCompetition",
        args: [compId],
        enabled: prepareAbortCompReady,
        onSettled(data, error) {
            if (data) {
                setAbortCompetitionReady(true)
                console.log("Abort Comp Prepare write Settled Successfully", { data })
            } else if (error) {
                console.log("Abort Comp Prepare write settled with error", { error })
                Swal.fire({
                    title: "Abort Competition Error",
                    text: `${error}`,
                    icon: "error",
                })
            }
        },
    })

    // join competition
    const { write: abortCompetition } = useContractWrite(prepareAbortComp)

    //handle start competition
    const handleStartCompetition = async (_compId) => {
        setCompId(_compId)
        setPrepareStartCompReady(true)
    }

    //handle Abort competition
    const handleAbortCompetition = async (_compId) => {
        setCompId(_compId)
        console.log("ABORT COMP", compId)
        setPrepareAbortCompReady(true)
    }

    useEffect(() => {
        setGetCompetitionInformation(true)
        setGetAthleteListByComp(true)
    }, [competitionId])

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
            if (
                competitionDetails.status === "PENDING" &&
                competitionDetails.adminAddress == address
            ) {
                setStartComp(true)
            }
        }
    }, [competitionForm])

    //Trigger start competition contract call
    useEffect(() => {
        if (prepareStartCompReady && startCompetitionReady) {
            startCompetition()
            setStartCompetitionReady(false)
            setPrepareStartCompReady(false)
        }
    }, [prepareStartCompReady, startCompetitionReady])

    //Trigger abort competition contract call
    useEffect(() => {
        if (prepareAbortCompReady && abortCompetitionReady) {
            abortCompetition()
            setPrepareAbortCompReady(false)
            setAbortCompetitionReady(false)
        }
    }, [prepareAbortCompReady, abortCompetitionReady])

    useEffect(() => {
        if (startCompError) {
            Swal.fire({
                title: "Start Comp ERROR",
                text: `ERROR ${JSON.stringify(startCompError)}`,
                icon: "error",
            })
        }
    }, [startCompError])
    //note

    return (
        <>
            {renderComp && (
                <tr>
                    <th scope="row">{competitionDetails.name}</th>
                    <td>{competitionDetails.status}</td>
                    <td>
                        <TableButtons
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
                        >
                            Start Competition
                        </TableButtons>
                    </td>
                    <td>
                        <TableButtons
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
                            disabled={!prepareAbortComp}
                        >
                            Abort Competition
                        </TableButtons>
                    </td>
                </tr>
            )}
        </>
    )
}

export default MyCompetitions
