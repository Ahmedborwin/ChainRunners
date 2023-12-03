import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// Components
import JoinedCompetitions from './JoinedCompetitions';

// Hooks
import useLoadBlockchainData from '../hooks/useLoadBlockchainData';
import useGetAthleteTable from '../hooks/useGetAthleteTable';
import useGetAthleteLiveCompetitions from '../hooks/useGetAthleteLiveCompetitions';

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

const StyledButton = styled(Button)`
    background-color: #18729c;

    &:hover {
        color: #38ff7f;
    }
`

const Dashboard = () => {
    const { chainRunner, account, signer } = useLoadBlockchainData();
    const athleteTable = useGetAthleteTable();
    const athleteLiveCompetitions = useGetAthleteLiveCompetitions();
    
    const joinedCompetitions = [
        { id: 1, name: 'Morning Run Challenge' },
        { id: 2, name: 'Weekend Cycling Marathon' },
        // Add more competitions as needed
    ];

    const userStats = {
        competitionsWon: 3,
        moneyEarned: '$150',
    };

    return (
        <DashboardContainer>

            <h2 className="text-center my-4">Your Dashboard</h2>

            <Card className="my-5" style={{ width: '80%' }}>
                <Card.Body>
                    <h4>Active Competitions:</h4>
                    <JoinedCompetitions joinedCompetitions={joinedCompetitions} />
                </Card.Body>
            </Card>

            <Card className="my-5" style={{ width: '80%' }}>
                <Card.Body>
                    <h4>Your Stats:</h4>
                    <p>Competitions Won: {userStats.competitionsWon}</p>
                    <p>Money Earned: {userStats.moneyEarned}</p>
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
