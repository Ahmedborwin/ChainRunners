import React from 'react';
import { Button } from 'react-bootstrap';

// Router
import { Link } from 'react-router-dom';

// Components
import JoinedCompetitions from './JoinedCompetitions';

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
        <div>
            <h2>Your Dashboard</h2>

            <h4>Active Competitions:</h4>
            <JoinedCompetitions joinedCompetitions={joinedCompetitions} />

            <div>
                <h4>Your Stats:</h4>
                <p>Competitions Won: {userStats.competitionsWon}</p>
                <p>Money Earned: {userStats.moneyEarned}</p>
            </div>


            <div>
                <Link to="/create-competition">
                    <Button variant="primary">Create Competition</Button>
                </Link>

                <Link to="/joined-competitions">
                    <Button variant="success">Join Competition</Button>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;