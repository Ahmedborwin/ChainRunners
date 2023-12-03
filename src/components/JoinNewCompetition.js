import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
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

const Container = styled("div")`
  position: relative;
  background-image: url(${mapsImage});
  background-size: cover;
  background-position: center;
  min-height: 100vh;
`;

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

const JoinNewCompetition = () => {
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const { data } = useSelector(selectUserData);

    const handleSearch = () => {
        // TODO: Implement the logic to search for competitions
        // You might want to use a state management library (e.g., Redux) or API calls here
        // For now, let's assume searchResults is an array of competition objects
        const sampleSearchResults = [
            { id: 1, name: 'Morning Run Challenge' },
            { id: 2, name: 'Weekend Cycling Marathon' },
        ];
        setSearchResults(sampleSearchResults);
    };

    const handleJoin = (competitionId) => {
        // TODO: Implement the logic to join the selected competition
        console.log('Joining competition with ID:', competitionId);
    };

    return (
        <Container>
            <Navigation account={`${data.athlete.firstname} ${data.athlete.lastname}`} />

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

            {searchResults.length > 0 && (
                <div>
                    <h4 className='m-2'>Search Results:</h4>
                    {searchResults.map((competition) => (
                        <Card key={competition.id} className="m-4">
                            <Card.Body>
                                <h5>{competition.name}</h5>
                                <Button style={{ backgroundColor: "#18729c" }} onClick={() => handleJoin(competition.id)}>
                                    Join
                                </Button>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </Container>
    );
};

export default JoinNewCompetition;