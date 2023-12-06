import { Button, Form } from "react-bootstrap";
import Navigation from "./Navigation";

// Images
import mapsImage from '../assets/images/chain.jpg';

// Redux
import { useSelector } from "react-redux/es/hooks/useSelector";

// Store
import { selectAuthDetails } from "../store/tokenExchange";

import styled from "styled-components";

const UserProfileContainer = styled("div")`
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
    color: white;
`

const LeftVerticalLine = styled("div")`
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: #0d2137; /* Orange color */
    left: 0;
    top: 0;
`;

const RightVerticalLine = styled("div")`
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: #19ddd3; /* Gold color */
    right: 0;
    top: 0;
`;

const CustomForm = styled(Form)`
    width: 80%;
    padding: 20px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    gap: 15px;
`

const LogoutButton = styled(Button)`
    background-color: #18729c;
    border-color: #0d6efd;

    &:hover {
        color: #38ff7f;
    }

    margin: 20%;
    width: 20%;
`

const UserProfile = () => {
    const data = useSelector(selectAuthDetails);

    const DEAUTHORIZE_URL = "https://www.strava.com/oauth/deauthorize";

    const handleLogout = () => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                access_token: data.access_token
            }),
        };

        // fetch(DEAUTHORIZE_URL, requestOptions)
        //     .then((response) => {
        //         if (!response.ok) {
        //             throw new Error(`Network response was not ok. Status: ${response.status}`);
        //         }
        //         return response.json();
        //     })
        //     .then(() => {
        //         // Deauthorize successful, purge the Redux store
        //         persistor.purge();
        //     })
        //     .catch((error) => {
        //         // Handle errors as needed
        //         console.error('Error while trying to deauthorize:', error);
        //     })
        //     .finally(() => {

        //     })
    }

    return (
        <UserProfileContainer>
            <Navigation account={`${data.athlete.firstname} ${data.athlete.lastname}`} />

            <LeftVerticalLine />
            <RightVerticalLine />

            <Title>Strava Account Details</Title>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <CustomForm>
                    <Form.Group controlId="firstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.athlete.firstname}
                        />
                    </Form.Group>

                    <Form.Group controlId="lastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.athlete.lastname}
                        />
                    </Form.Group>

                    <Form.Group controlId="id">
                        <Form.Label>ID</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.athlete.id}
                        />
                    </Form.Group>

                    <Form.Group controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={data.athlete.username}
                        />
                    </Form.Group>

                </CustomForm>

                <LogoutButton onClick={handleLogout}>
                    Log Out
                </LogoutButton>
            </div>
        </UserProfileContainer>
    )
}

export default UserProfile;