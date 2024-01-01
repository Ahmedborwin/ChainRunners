import React, { useState, useEffect } from "react"
import { formatEther } from "viem"
import styled from "styled-components"
import { Form, Button, Card } from "react-bootstrap"

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

const CompetitionInformation = ({ competitionId }) => {
    const [getbuyIn, setGetBuyIn] = useState(false)
    const [getCompetitionInformation, setGetCompetitionInformation] = useState(false)
    const [compId, setCompId] = useState(null)
    const [joinCompId, setJoinCompId] = useState(null)
    const [competitionDetails, setCompetitionDetails] = useState({})
    const [renderComp, setRenderComp] = useState(false)
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
        enabled: joinCompetitionIsReady,
        onError(error) {
            window.alert(error)
            setJoinCompetitionIsReady(false) // Reset the state after the operation
        },
        onSuccess(data) {
            console.log("Join COMP success", data)
            setJoinCompetitionIsReady(false) // Reset the state after the operation
        },
    })

    // join competition
    const { write: joinCompetition } = useContractWrite(prepareJoinCompConfig)

    const handleJoin = (_compId) => {
        setJoinCompId(_compId)
        setJoinCompetitionIsReady(true)
    }

    useEffect(() => {
        if (joinCompetitionIsReady && joinCompId && prepareJoinCompConfig) {
            joinCompetition()
            setJoinCompetitionIsReady(false)
        }
    }, [joinCompetitionIsReady, joinCompId, prepareJoinCompConfig])

    useEffect(() => {
        if (competitionId > 0) {
            setCompId(competitionId)
            setGetCompetitionInformation(true)
        }
    }, [competitionId])

    useEffect(() => {
        setGetBuyIn(true)
    }, [])

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
