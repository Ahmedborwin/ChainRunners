import React, { useState, useEffect } from "react"
import { Button, Card } from "react-bootstrap"
import { Link } from "react-router-dom"
import styled from "styled-components"
import { formatEther } from "viem"

// ABIs
import ChainRunners_ABI from "../../config/chainRunnerAbi.json"
import ChainRunnersAddresses from "../../config/chainRunnerAddress.json"

// Components
import CompetitionHeaders from "./CompetitionHeaders"
import Greeter from "../Greeter"
import MyCompetitions from "./MyCompetitions"

// Hooks
import { useContractRead } from "wagmi"
import useWalletConnected from "../../hooks/useAccount"

const StyledButton = styled(Button)`
    background-color: #0e76fd;
    font-weight: bold;

    &:hover {
        color: #38ff7f;
    }
`

const StyledLink = styled(Link)`
    text-decoration: none;
`

const StyledButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin: 20px;
`

const DashboardContainer = styled("div")`
    position: relative;
    padding-left: 20px; /* Adjust as needed */
    padding-right: 20px; /* Adjust as needed */
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const DashboardTitle = styled("h2")`
    color: #ffffff;
    background: #0d2137;
    text-transform: uppercase;
    font-size: 2.5rem; /* Increase font size for prominence */
    margin-bottom: 20px; /* Add some spacing at the bottom */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 10);
    border-radius: 12px;
`

const StyledCard = styled(Card)`
    width: 700px;
    margin: 20px;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Darker shadow for a tech feel */
    background-color: #ffffff; /* Dark background color */
    color: black; /* White text for contrast */
`

const Dashboard = ({ athlete }) => {
    const [athleteProfile, setAthleteProfile] = useState({})
    const [athleteWinningStats, setAthleteWinningStats] = useState({})
    const [competitionDetails, setCompetitionDetails] = useState({})
    const [compIdArray, setCompIdArray] = useState([])

    const { chain, address } = useWalletConnected()

    // Read athlete table
    const { data: athleteTable } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "athleteTable",
        args: [address],
    })

    // Read winner statistics
    const { data: winnerStatistics } = useContractRead({
        address: ChainRunnersAddresses[chain.id],
        abi: ChainRunners_ABI,
        functionName: "winnerStatistics",
        args: [address],
        onSettled(data, error) {
            console.log("Settled winner stats read", { data, error })
        },
    })

    // // Read athlete competitions
    // const { data: athleteCompetitions } = useContractRead({
    //     address: ChainRunnersAddresses[chain.id],
    //     abi: ChainRunners_ABI,
    //     functionName: "listAthleteCompetitions",
    //     args: [address],
    // })

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

    useEffect(() => {
        if (athleteTable) {
            const newAthleteProfile = {
                username: athleteTable[0],
                stravaId: athleteTable[1],
                totalMeters: parseInt(athleteTable[2]),
                registeredAthlete: athleteTable[3],
            }
            setAthleteProfile(newAthleteProfile)
        }
    }, [athleteTable])

    useEffect(() => {
        if (winnerStatistics) {
            const newAthleteWinningStats = {
                competitionsWon: parseInt(winnerStatistics[0]),
                intervalsWon: parseInt(winnerStatistics[1]),
                etherGained: null,
            }
            let athletesWinnings
            if (winnerStatistics[2] == 0) {
                athletesWinnings = winnerStatistics[2]
            } else {
                athletesWinnings = formatEther(winnerStatistics[2])
            }
            newAthleteWinningStats.etherGained = athletesWinnings
            setAthleteWinningStats(newAthleteWinningStats)
        }
    }, [winnerStatistics])

    useEffect(() => {
        if (competitionCount > 0) {
            //create array of compID's
            console.log("competitionCount", competitionCount)
            const _compIdArray = []
            for (let i = 1; i <= competitionCount; i++) {
                _compIdArray.push(i)
            }
            setCompIdArray(_compIdArray)
        }
    }, [competitionCount])

    return (
        <>
            <Greeter />
            <DashboardContainer>
                <DashboardTitle className="text-center my-4">
                    {athlete?.firstname} {athlete?.lastname}'s Dashboard
                </DashboardTitle>

                <StyledCard>
                    <Card.Body>
                        <h4>Your Competitions:</h4>
                        <CompetitionHeaders />
                        {compIdArray.length > 0 &&
                            compIdArray.map((compId, index) => (
                                <MyCompetitions key={index} competitionId={compId} />
                            ))}
                    </Card.Body>
                </StyledCard>

                <StyledCard>
                    <Card.Body>
                        <h4>Your Stats:</h4>
                        <hr />
                        <p>
                            <strong>Competitions Won</strong>: {athleteWinningStats.competitionsWon}
                        </p>
                        <p>
                            <strong>Income Gained</strong>: {athleteWinningStats.etherGained} MATIC
                        </p>
                    </Card.Body>
                </StyledCard>

                <StyledButtonContainer>
                    <StyledLink to="/create-competition" className="mx-4">
                        <StyledButton>Create Competition</StyledButton>
                    </StyledLink>

                    <StyledLink to="/join-competition" className="mx-4">
                        <StyledButton>Join Competition</StyledButton>
                    </StyledLink>
                </StyledButtonContainer>
            </DashboardContainer>
        </>
    )
}

export default Dashboard
