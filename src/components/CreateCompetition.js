import React, { useState, useEffect } from "react"

import styled from "styled-components"

// Components
import { Form, Button } from "react-bootstrap"
import Greeter from "./Greeter"
import Navigation from "./Navigation"

// ABIs
import ChainRunners_ABI from "../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../config/chainRunnerAddress.json"

// Hooks
import { useContractWrite, usePrepareContractWrite } from "wagmi"
import useWalletConnected from "../hooks/useAccount"

// Images
import mapsImage from "../assets/images/chain.jpg"

// Redux
import { useSelector } from "react-redux"

// Store
import { selectAuthDetails } from "../store/tokenExchange"
import { parseEther } from "viem"

const CompetitionContainer = styled("div")`
    position: relative;
    background-image: url(${mapsImage});
    background-size: cover;
    background-position: center;
    min-height: 100vh;
`

const Title = styled("h2")`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 4%;
`
const CustomForm = styled(Form)`
    width: 300px;
    padding: 20px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    gap: 15px;
`

const CreateButton = styled(Button)`
    background-color: #18729c;
    border-color: #0d6efd;

    &:hover {
        color: #38ff7f;
    }
`

const LeftVerticalLine = styled("div")`
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: #fc4c02; /* Orange color */
    left: 0;
    top: 0;
`

const RightVerticalLine = styled("div")`
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: #ffd700; /* Gold color */
    right: 0;
    top: 0;
`

const CompetitionCreation = () => {
    const [competitionName, setCompetitionName] = useState("")
    const [buyIn, setBuyIn] = useState(0.01)
    const [durationDays, setDurationDays] = useState(28)
    const [payoutIntervals, setPayoutIntervals] = useState(7)
    const [createCompetitionReady, setCreateCompetitionReady] = useState(false)

    const userData = useSelector(selectAuthDetails)
    const { chain, address } = useWalletConnected()

    // Prepare contract write
    const { config } = usePrepareContractWrite({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "createCompetition",
        args: [
            competitionName,
            parseEther(buyIn.toString()),
            parseInt(durationDays),
            parseInt(payoutIntervals),
        ],
        enabled: createCompetitionReady,
        account: address,
        value: parseEther("0.01"),
        onError(error) {
            window.alert(error)
            setCreateCompetitionReady(false)
        },
        onSuccess(data) {
            setCreateCompetitionReady(false)
            console.log(data)
        },
        onSettled(data, error) {
            console.log("Settled", { data, error })
        },
    })

    // Write contract
    // Use the useContractWrite hook with the config from usePrepareContractWrite
    const { data: createCompData, isSuccess, write } = useContractWrite(config)

    // Event handler for creating the competition
    const handleCreateCompetition = () => {
        if (competitionName && buyIn && durationDays && payoutIntervals) {
            console.log("READY TO CREATE")
            setCreateCompetitionReady(true)
        } else {
            window.alert("complete form buddy")
        }
    }
    useEffect(() => {
        if (isSuccess) {
            console.log(isSuccess)
        }
    }, [isSuccess])

    useEffect(() => {
        if (competitionName && buyIn && durationDays && payoutIntervals) {
            handleCreateCompetition()
        }
    }, [competitionName, buyIn, durationDays, payoutIntervals])

    return (
        <CompetitionContainer>
            <Navigation account={`${userData.athlete.firstname} ${userData.athlete.lastname}`} />

            <LeftVerticalLine />
            <RightVerticalLine />

            <Greeter />

            <Title>Create a New Competition</Title>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <CustomForm>
                    <Form.Group controlId="competitionName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Competition Name"
                            value={competitionName}
                            onChange={(e) => setCompetitionName(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="buyIn">
                        <Form.Label>Buy-In (ETH)</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter Buy-In Amount"
                            value={buyIn}
                            onChange={(e) => setBuyIn(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="durationDays">
                        <Form.Label>Duration (Days)</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter competition duration"
                            value={durationDays}
                            onChange={(e) => setDurationDays(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="payoutIntervals">
                        <Form.Label>Payout Intervals (Days)</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter Payout Intervals"
                            value={payoutIntervals}
                            onChange={(e) => setPayoutIntervals(e.target.value)}
                        />
                    </Form.Group>

                    <CreateButton disabled={!write} onClick={() => write()}>
                        Create Competition
                    </CreateButton>
                </CustomForm>
            </div>
        </CompetitionContainer>
    )
}

export default CompetitionCreation
