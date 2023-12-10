import React, { useState, useEffect } from "react"
import { Form, Button, Card } from "react-bootstrap"
import styled from "styled-components"

// Components
import Greeter from "./Greeter"
import Navigation from "./Navigation"

// ABIs
import ChainRunners_ABI from "../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../config/chainRunnerAddress.json"

// Hooks
import { useContractRead } from "wagmi"
import useWalletConnected from "../hooks/useAccount"

// Images
import mapsImage from "../assets/images/chain.jpg"

// Redux
import { useSelector } from "react-redux"

// Store
import { selectAuthDetails } from "../store/tokenExchange"

import CompetitionInformation from "./CompetitionInformation"

const Container = styled("div")`
    position: relative;
    background-image: url(${mapsImage});
    background-size: cover;
    background-position: center;
    min-height: 100vh;
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

const JoinNewCompetition = () => {
    const [searchText, setSearchText] = useState("")
    const [compIdArray, setCompIdArray] = useState([])
    const [showCompetitions, setShowCompetitions] = useState(false)

    const userData = useSelector(selectAuthDetails)
    const { chain, wallet } = useWalletConnected()

    //read chainrunners for competitionId's
    const { data: competitionCount } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "competitionId",

        onError(error) {
            window.alert(error)
        },
        onSuccess(data) {
            console.log("Last Comp Id:", data)
        },
        onSettled(data, error) {
            console.log("Settled", { data, error })
        },
    })

    //create array of compID's
    useEffect(() => {
        if (competitionCount > 1) {
            //create array of compID's
            const _compIdArray = []
            for (let i = 1; i <= competitionCount; i++) {
                _compIdArray.push(i)
            }
            setCompIdArray(_compIdArray)
        }
    }, [competitionCount])

    const handleSearch = () => {
        // TODO: Implement the logic to search for competitions
        // call chainrunner to get array of competition ID that can be joined
        // use array of compId's to return only pending competitions....
        if (compIdArray.length > 0) {
            setShowCompetitions(true)
        }
    }

    return (
        <Container>
            <Navigation account={`${userData.athlete.firstname} ${userData.athlete.lastname}`} />

            <LeftVerticalLine />
            <RightVerticalLine />

            <Greeter />

            <h2 className="text-center mt-4 mb-4">Join a New Competition</h2>

            <Form className="m-4">
                <Form.Group controlId="searchText">
                    <Form.Control
                        type="text"
                        placeholder="Search for a competition"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </Form.Group>
                <Button style={{ backgroundColor: "#18729c" }} onClick={handleSearch}>
                    Search
                </Button>
            </Form>

            {showCompetitions && (
                <div>
                    <h4 className="m-2">Search Results:</h4>
                    {compIdArray.map((competitionId, index) => (
                        <CompetitionInformation key={index} competitionId={competitionId} />
                    ))}
                </div>
            )}
        </Container>
    )
}

export default JoinNewCompetition
