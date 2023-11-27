import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// Components
import JoinedCompetitions from './JoinedCompetitions';

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

const Dashboard = () => {
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
                    <Button style={{ backgroundColor: "#fc4c02" }}>Create Competition</Button>
                </Link>

                <Link to="/joined-competitions" className="mx-4">
                    <Button style={{ backgroundColor: "#ffd700" }}>Join Competition</Button>
                </Link>
            </div>
        </DashboardContainer>
    );
};

export default Dashboard;
