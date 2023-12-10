import React, { useState, useEffect } from "react"
import { formatEther, parseEther } from "viem"
import styled from "styled-components"
import { Form, Button, Card } from "react-bootstrap"

// ABIs
import ChainRunners_ABI from "../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../config/chainRunnerAddress.json"

// Hooks
import { useContractWrite, usePrepareContractWrite, useContractRead } from "wagmi"
import useWalletConnected from "../hooks/useAccount"

const CompetitionCard = styled.div`
    border: 1px solid #ccc;
    padding: 10px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const GridContainer = styled.div`
    width: 100%; /* Full width */
    margin: 0 auto;
    max-height: 400px; /* Set your desired maximum container height */
    overflow-y: auto; /* Enable vertical scrolling for the container */
    display: flex; /* Use flexbox instead of grid */
    flex-direction: column; /* Stack items vertically */
    gap: 20px; /* Adjust the gap between cards */
    padding: 20px; /* Add padding to the container */
`

const FlexContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between; /* Or 'space-between' if you want to spread the items out */
    gap: 10px; /* Adjust the gap between items */
`

const CompetitionInformation = ({ competitionId }) => {
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
    const { data, write: joinCompetition, isSuccess } = useContractWrite(prepareJoinCompConfig)

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

    //set state for retreived comp table
    useEffect(() => {
        if (competitionForm) {
            const status = {
                0: "PENDING",
                1: "IN_PROGRESS",
                2: "COMPLETED",
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
            setCompetitionDetails(competitionDetails)
            setBuyIn(competitionForm[10])
            //check if comp status is pending
            if (competitionDetails.status == "PENDING") {
                setRenderComp(true)
            }
        }
    }, [competitionForm])

    return (
        <GridContainer className="competition-grid">
            {renderComp && (
                <Card className="m-4">
                    <Card.Body>
                        <h5>{competitionDetails.name}</h5>
                        <FlexContainer>
                            <p>ID: {competitionDetails.id}</p>
                            <p>Status: {competitionDetails.status}</p>
                            <p>Buyin{formatEther(competitionDetails.buyInAmount)} ETH</p>

                            <Button
                                style={{ backgroundColor: "#18729c" }}
                                onClick={() => handleJoin(competitionDetails.id)}
                            >
                                Join
                            </Button>
                        </FlexContainer>
                    </Card.Body>
                </Card>
            )}
        </GridContainer>
    )
}

export default CompetitionInformation
