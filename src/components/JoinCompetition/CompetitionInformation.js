import React, { useState, useEffect } from "react"
import { formatEther } from "viem"
import styled from "styled-components"
import { Form, Button, Card } from "react-bootstrap"
import Swal from "sweetalert2"
import Toastify from "toastify-js"

// ABIs
import ChainRunners_ABI from "../../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../../config/chainRunnerAddress.json"

// Hooks
import { useContractWrite, usePrepareContractWrite, useContractRead } from "wagmi"
import useWalletConnected from "../../hooks/useAccount"

const FlexContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
`

const competitionStatus = {
    0: "PENDING",
    1: "IN_PROGRESS",
    2: "COMPLETED",
    3: "ABORTED",
}

const CompetitionInformation = ({ competitionId, searchText }) => {
    const [getbuyIn, setGetBuyIn] = useState(false)
    const [getCompetitionInformation, setGetCompetitionInformation] = useState(false)
    const [compId, setCompId] = useState(null)
    const [joinCompId, setJoinCompId] = useState(null)
    const [competitionDetails, setCompetitionDetails] = useState({})
    const [renderComp, setRenderComp] = useState(false)
    const [compIdReady, setCompIdReady] = useState(false)
    const [joinCompetitionIsReady, setJoinCompetitionIsReady] = useState(false)

    const [buyIn, setBuyIn] = useState(0)

    //hooks
    const { chain, wallet } = useWalletConnected()

    // Read competition table
    const { data: competitionForm } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "competitionTable",
        args: [compId],
        enabled: getCompetitionInformation,
        onError(error) {
            setGetCompetitionInformation(false)
            window.alert(error)
        },
        onSuccess(data) {
            setGetCompetitionInformation(false)
        },
    })

    const { data: readBuyIn } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "BUYIN",
        enabled: getbuyIn,
        onError(error) {
            setGetCompetitionInformation(false)
            window.alert(error)
        },
        onSuccess(data) {
            setGetCompetitionInformation(false)
            setBuyIn(readBuyIn)
        },
    })

    // Prepare contract write to join Competition
    const { config: prepareJoinCompConfig } = usePrepareContractWrite({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "joinCompetition",
        args: [joinCompId],
        value: buyIn,
        enabled: compIdReady,
        onSettled(data, error) {
            if (data) {
                console.log("Join Settled Succesfully", data)
                setJoinCompetitionIsReady(true)
            } else if (error) {
                console.log("Join Settled with error", error)
            }
        },
    })

    // join competition
    const {
        data: joinCompResponse,
        write: joinCompetition,
        isSuccess: joinCompSuccess,
        isError: joinCompError,
    } = useContractWrite(prepareJoinCompConfig)

    const handleJoin = (_compId) => {
        setJoinCompId(_compId)
        setCompIdReady(true)
    }

    //Get buyIn in Matic from chainrunners contract
    useEffect(() => {
        setGetBuyIn(true)
    }, [])

    // competitionId is passed as a prop, get Competition Info
    useEffect(() => {
        if (competitionId > 0) {
            setCompId(competitionId)
            setGetCompetitionInformation(true)
        }
    }, [competitionId])

    useEffect(() => {
        console.log("joinCompetitionIsReady", joinCompetitionIsReady)
        if (joinCompetitionIsReady && compIdReady) {
            joinCompetition()
            setCompIdReady(false) // Reset the state after the operation
            setJoinCompetitionIsReady(false)
        }
    }, [joinCompetitionIsReady, compIdReady])

    useEffect(() => {
        console.log("Join comp response", joinCompResponse)
        if (joinCompError) {
            Swal.fire({
                title: "Join Competition Error",
                text: `ERROR ${JSON.stringify(joinCompResponse)}`,
                icon: "error",
            })
        }
    }, [joinCompSuccess, joinCompError])

    // Get competition table details
    useEffect(() => {
        if (competitionForm) {
            const competitionDetails = {
                id: parseInt(competitionForm[0]),
                name: competitionForm[1],
                status: competitionStatus[competitionForm[2]],
                adminAddress: competitionForm[3],
                startDate: parseInt(competitionForm[4]),
                durationDays: parseInt(competitionForm[5]),
                endDate: parseInt(competitionForm[6]),
                nextPayoutDate: parseInt(competitionForm[7]),
                payoutIntervals: parseInt(competitionForm[8]),
                startDeadline: parseInt(competitionForm[9]),
                prizeReward: parseInt(competitionForm[12]),
            }
            setCompetitionDetails(competitionDetails)

            //check if comp status is PENDING
            if (competitionDetails.status === competitionStatus[0]) {
                setRenderComp(true)
            }

            if (searchText !== "" && searchText !== competitionDetails.name) {
                setRenderComp(false)
            }
        }
    }, [competitionForm])

    return (
        renderComp && (
            <Card className="m-4 text-center">
                <Card.Body>
                    <h5>{competitionDetails.name}</h5>
                    <hr />
                    <FlexContainer>
                        <p>ID: {competitionDetails.id}</p>
                        <p>Status: {competitionDetails.status}</p>
                        <p>Buy-in: {formatEther(buyIn)} MATIC</p>

                        <Button
                            style={{ backgroundColor: "#18729c" }}
                            onClick={() => handleJoin(competitionDetails.id)}
                        >
                            Join
                        </Button>
                    </FlexContainer>
                </Card.Body>
            </Card>
        )
    )
}

export default CompetitionInformation
