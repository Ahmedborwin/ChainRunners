import React, { useState, useEffect } from "react"

import styled from "styled-components"

// Components
import { Form } from "react-bootstrap"
import Greeter from "../Greeter"
import CreateCompetitionButton from "./CreateCompetitionButton"

// ABIs
import ChainRunners_ABI from "../../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../../config/chainRunnerAddress.json"

// Hooks
import { usePrepareContractWrite } from "wagmi"
import useWalletConnected from "../../hooks/useAccount"

// Images
import mapsImage from "../../assets/images/chain.jpg"

// Redux
import { useSelector } from "react-redux"

// Store
import { selectAuthDetails } from "../../store/tokenExchange"
import { parseEther } from "viem"

const CompetitionContainer = styled("div")`
    position: relative;
    background-image: url(${mapsImage});
    background-size: cover;
    background-position: center;
    min-height: 100vh;
`

const CustomForm = styled(Form)`
    width: 500px;
    padding: 20px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    gap: 15px;
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
        args: [competitionName, parseInt(durationDays), parseInt(payoutIntervals)],
        enabled: createCompetitionReady,
        account: address,
        value: parseEther(buyIn.toString()),
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
        if (competitionName && buyIn && durationDays && payoutIntervals) {
            handleCreateCompetition()
        }
    }, [competitionName, buyIn, durationDays, payoutIntervals])

    return (
        <CompetitionContainer>
            <Greeter />

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    marginTop: "2%",
                }}
            >
                <CustomForm>
                    <h2 className="my-2 text-center">Enter competition details</h2>
                    <hr />
                    <Form.Group controlId="competitionName">
                        <Form.Label>
                            <strong>Name</strong>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Competition Name"
                            value={competitionName}
                            onChange={(e) => setCompetitionName(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="buyIn">
                        <Form.Label>
                            <strong>Buy-In (ETH)</strong>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter Buy-In Amount"
                            value={buyIn}
                            onChange={(e) => setBuyIn(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="durationDays">
                        <Form.Label>
                            <strong>Duration (Days)</strong>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter competition duration"
                            value={durationDays}
                            onChange={(e) => setDurationDays(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="payoutIntervals">
                        <Form.Label>
                            <strong>Payout Intervals (Days)</strong>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter Payout Intervals"
                            value={payoutIntervals}
                            onChange={(e) => setPayoutIntervals(e.target.value)}
                        />
                    </Form.Group>
                    <hr />
                    <CreateCompetitionButton config={config} />
                </CustomForm>
            </div>
        </CompetitionContainer>
    )
}

export default CompetitionCreation
