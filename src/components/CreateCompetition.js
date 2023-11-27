import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

// Import your image
import mapsImage from '../assets/images/maps.jpg';

const styles = {
    container: {
        backgroundImage: `url(${mapsImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '80vh', // Adjust this to fit your layout
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    form: {
        // Add other styles for your form
        // For example:
        width: '300px',
        padding: '20px',
        borderRadius: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Adjust the opacity as needed
        display: 'flex',
        flexDirection: 'column',
        gap: '15px', // Add spacing between form groups
    },
    createButton: {
        backgroundColor: '#fc4c02', // Orange color
        borderColor: '#fc4c02', // Matching border color
    },
};

const CompetitionCreation = () => {
    const [competitionName, setCompetitionName] = useState("");
    const [buyIn, setBuyIn] = useState(0);
    const [durationDays, setDurationDays] = useState(0);
    const [payoutIntervals, setPayoutIntervals] = useState(0);

    const handleCreateCompetition = () => {
        // TODO: Implement the logic to create a competition
        // You might want to use a state management library (e.g., Redux) or API calls here
        console.log('Competition created:', competitionName, buyIn, durationDays, payoutIntervals);
    };

    return (
        <div style={styles.container}>
            <h2>Create a New Competition</h2>
            <Form style={styles.form}>
                <Form.Group controlId="competitionName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter Competition Name" />
                </Form.Group>

                <Form.Group controlId="buyIn">
                    <Form.Label>Buy-In</Form.Label>
                    <Form.Control type="number" placeholder="Enter Buy-In Amount" />
                </Form.Group>

                <Form.Group controlId="durationDays">
                    <Form.Label>Duration (Days)</Form.Label>
                    <Form.Control type="number" placeholder="Enter competition duration" />
                </Form.Group>

                <Form.Group controlId="payoutIntervals">
                    <Form.Label>Payout Intervals (Days)</Form.Label>
                    <Form.Control type="number" placeholder="Enter Payout Intervals" />
                </Form.Group>

                <Button variant="primary" style={styles.createButton} onClick={handleCreateCompetition}>
                    Create Competition
                </Button>
            </Form>
        </div>
    );
};

export default CompetitionCreation;
