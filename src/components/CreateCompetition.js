import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import styled from 'styled-components';

// Components
import Greeter from './Greeter';
import Navigation from './Navigation';

// Images
import mapsImage from '../assets/images/chain.jpg';

// Redux
import { useSelector } from 'react-redux';

// Store
import { selectUserData } from '../store/reducers/tokenExchangeReducer';

const CompetitionContainer = styled("div")`
    position: relative;
    background-image: url(${mapsImage});
    background-size: cover;
    background-position: center;
    min-height: 100vh;
`;

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
`;

const RightVerticalLine = styled("div")`
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: #ffd700; /* Gold color */
    right: 0;
    top: 0;
`;

const CompetitionCreation = () => {
    const [competitionName, setCompetitionName] = useState("");
    const [buyIn, setBuyIn] = useState(0.01);
    const [durationDays, setDurationDays] = useState(28);
    const [payoutIntervals, setPayoutIntervals] = useState(7);

    const { data } = useSelector(selectUserData);

    const handleCreateCompetition = () => {
        // TODO: Implement the logic to create a competition
        // You might want to use a state management library (e.g., Redux) or API calls here
        console.log('Competition created:', competitionName, buyIn, durationDays, payoutIntervals);
    };

    return (
        <CompetitionContainer>
            <Navigation account={`${data.athlete.firstname} ${data.athlete.lastname}`} />

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
                        <Form.Label>Buy-In</Form.Label>
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

                    <CreateButton variant="primary" onClick={handleCreateCompetition}>
                        Create Competition
                    </CreateButton>
                </CustomForm>
            </div>

        </CompetitionContainer>
    );
};

export default CompetitionCreation;
