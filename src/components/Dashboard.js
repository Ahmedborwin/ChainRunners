import React, { useState, useEffect } from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// ABIs
import ChainRunners_ABI from "../config/chainRunnerAbi.json";

// Components
import JoinedCompetitions from './JoinedCompetitions';

// Hooks
import { useContractRead } from 'wagmi';

const DashboardContainer = styled("div")`
    position: relative;
    padding-left: 20px; /* Adjust as needed */
    padding-right: 20px; /* Adjust as needed */
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const DashboardTitle = styled("h2")`
    color: #ffffff;
    text-transform: uppercase;
`

const StyledButton = styled(Button)`
    background-color: #18729c;

    &:hover {
        color: #38ff7f;
    }
`

const Dashboard = ({ athlete, address }) => {
    const [athleteProfile, setAthleteProfile] = useState({});
    const [athleteWinningStats, setAthleteWinningStats] = useState({});
    const [competitionDetails, setCompetitionDetails] = useState({});

    console.log(athlete, "@@@@athlete")
    // Read athlete table
    const { data: athleteTable } = useContractRead({
        address: '0x60bE2963Cbcb7C9b7C4b9095068A6267b76cc167',
        abi: ChainRunners_ABI,
        functionName: 'athleteTable',
        args: ['0x5f2AF68dF96F3e58e1a243F4f83aD4f5D0Ca6029']
    })
    
    // Read winner statistics
    const { data: winnerStatistics } = useContractRead({
        address: '0x60bE2963Cbcb7C9b7C4b9095068A6267b76cc167',
        abi: ChainRunners_ABI,
        functionName: 'winnerStatistics',
        args: ['0x5f2AF68dF96F3e58e1a243F4f83aD4f5D0Ca6029']
    })

    // Read athlete competitions
    const { data: athleteCompetitions } = useContractRead({
        address: '0x60bE2963Cbcb7C9b7C4b9095068A6267b76cc167',
        abi: ChainRunners_ABI,
        functionName: 'listAthleteCompetitions',
        args: ['0x5f2AF68dF96F3e58e1a243F4f83aD4f5D0Ca6029']
    })

    // Read competition table
    const { data: competitionTable } = useContractRead({
        address: '0x60bE2963Cbcb7C9b7C4b9095068A6267b76cc167',
        abi: ChainRunners_ABI,
        functionName: 'competitionTable',
        args: ['1']
    })

    console.log(athleteCompetitions, "@@@@athleteCompetitions")
    const joinedCompetitions = [
        { id: 1, name: 'Morning Run Challenge' },
        { id: 2, name: 'Weekend Cycling Marathon' },
        // Add more competitions as needed
    ];

    useEffect(() => {
        if (athleteTable) {
            const newAthleteProfile = {
                username: athleteTable[0],
                stravaId: athleteTable[1],
                totalMeters: parseInt(athleteTable[2]),
                registeredAthlete: athleteTable[3]
            }
            setAthleteProfile(newAthleteProfile);
        }
    }, [athleteTable])

    useEffect(() => {
        if (winnerStatistics) {
            const newAthleteWinningStats = { 
                competitionsWon: parseInt(winnerStatistics[0]),
                intervalsWon: parseInt(winnerStatistics[1]),
                etherGained: parseInt(winnerStatistics[2]),
            }
            setAthleteWinningStats(newAthleteWinningStats);
        }
    }, [winnerStatistics])

    useEffect(() => {
        if (competitionTable) {
            const newCompetitionDetails = {
                id: parseInt(competitionTable[0]),
                name: competitionTable[1],
                status: parseInt(competitionTable[2]),
                adminAddress: competitionTable[3],
                startDate: parseInt(competitionTable[4]),
                durationDays: parseInt(competitionTable[5]),
                endDate: parseInt(competitionTable[6]),
                nextPayoutDate: parseInt(competitionTable[7]),
                payoutIntervals: parseInt(competitionTable[8]),
                startDeadline: parseInt(competitionTable[9]),
                buyInAmount: parseInt(competitionTable[10]),
                totalStakedAmount: parseInt(competitionTable[11]),
                prizeReward: parseInt(competitionTable[12]),
            }
            setCompetitionDetails(newCompetitionDetails);
        }
    }, [competitionTable])

    return (
        <DashboardContainer>

            <DashboardTitle className="text-center my-4">
                {athlete?.firstname} {athlete?.lastname}
            </DashboardTitle>

            <Card className="my-5" style={{ width: '80%' }}>
                <Card.Body>
                    <h4>Active Competitions:</h4>
                    <JoinedCompetitions joinedCompetitions={joinedCompetitions} />
                </Card.Body>
            </Card>

            <Card className="my-5" style={{ width: '80%' }}>
                <Card.Body>
                    <h4>Your Stats:</h4>
                    <p>Competitions Won: {athleteWinningStats.competitionsWon}</p>
                    <p>Income Gained: {athleteWinningStats.etherGained} MATIC</p>
                </Card.Body>
            </Card>

            <div className="text-center my-4">
                <Link to="/create-competition" className="mx-4">
                    <StyledButton>Create Competition</StyledButton>
                </Link>

                <Link to="/joined-competitions" className="mx-4">
                    <StyledButton>Join Competition</StyledButton>
                </Link>
            </div>
        </DashboardContainer>
    );
};

export default Dashboard;
