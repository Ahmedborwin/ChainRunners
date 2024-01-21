import React, { useState } from "react"
import { Form, Button } from "react-bootstrap"
import styled from "styled-components"

import Swal from "sweetalert2"

//Address and ABI
import ChainRunners_ABI from "../../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../../config/chainRunnerAddress.json"

// Components
import Greeter from "../Greeter"
import ShowCompetitions from "./ShowCompetitions"

// Images
import mapsImage from "../../assets/images/chain.jpg"

// Redux
import { useSelector } from "react-redux"

// Store
import { selectAuthDetails } from "../../store/tokenExchange"

//hooks
import { useContractEvent } from "wagmi"
import useWalletConnected from "../../hooks/useAccount"

const Container = styled("div")`
    position: relative;
    background-image: url(${mapsImage});
    background-size: cover;
    background-position: center;
    min-height: 100vh;
`

const CustomForm = styled(Form)`
    width: 30vw;
    padding: 20px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.9);
    gap: 15px;
`

const JoinNewCompetition = () => {
    const [searchText, setSearchText] = useState("")
    const [showCompetitions, setShowCompetitions] = useState(false)

    const handleSearch = () => {
        setShowCompetitions(true)
    }

    const { chain } = useWalletConnected()

    useContractEvent({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        eventName: "athleteJoinedCompetition",
        listener(log) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Competition Joined!",
                showConfirmButton: false,
                timer: 1500,
            }).then(() => {
                window.location.href = "/"
            })
        },
    })

    return (
        <Container>
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
                <CustomForm className="m-4 text-center">
                    <h2 className="text-center">Join New Competition</h2>
                    <Form.Group controlId="searchText">
                        <Form.Control
                            type="text"
                            placeholder="Search for a competition"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Form.Group>
                    <hr />
                    <Button style={{ backgroundColor: "#18729c" }} onClick={handleSearch}>
                        Search
                    </Button>
                </CustomForm>

                <ShowCompetitions showCompetitions={showCompetitions} searchText={searchText} />
            </div>
        </Container>
    )
}

export default JoinNewCompetition
