// Import necessary React components and hooks
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { tokenExchangeSuccess, tokenExchangeFailure } from '../store/actions';

const CLIENT_ID = '117193';
const CLIENT_SECRET = '3346a21a1dcbebb5baa4dc7b780177338d398160';
const REDIRECT_URI = 'http://localhost:3000'; // Replace with your actual redirect URI
const SCOPE = 'read,activity:read_all';

// Set up the authorization URL
const STRAVA_AUTH_URL = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`;

// Set up the token exchange URL
const TOKEN_EXCHANGE_URL = 'https://www.strava.com/oauth/token';

// Styles (you can use a separate CSS file if needed)
const styles = {
    body: {
        fontFamily: 'Arial, sans-serif',
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f4',
    },
    container: {
        textAlign: 'center',
    },
    h1: {
        color: '#333',
    },
    loginBtn: {
        padding: '10px 20px',
        backgroundColor: '#fc4c02',
        color: '#fff',
        fontSize: '16px',
        cursor: 'pointer',
        border: 'none',
        borderRadius: '5px',
    },
};

// Define the StravaAccountCreation component
const StravaAccountCreation = ({ userAccountDetails }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    // Function to handle the button click and redirect to the Strava authorization page
    const redirectToStravaAuthorization = () => {
        // Redirect the user to Strava authorization page
        window.location.href = STRAVA_AUTH_URL;
    };

    const handleTokenExchange = (code) => {
        setIsLoading(true);

        // Set up the request parameters
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI
            }),
        };

        fetch(TOKEN_EXCHANGE_URL, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok. Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                dispatch(tokenExchangeSuccess(data));
                // Handle the response data as needed
                console.log('Token exchange successful:', data);
            })
            .catch((error) => {
                dispatch(tokenExchangeFailure(error));
                // Handle errors as needed
                console.error('Token exchange error:', error);
            })
            .finally(() => {
                // Do cleanup or additional actions if needed
                setIsLoading(false);
            });

    };

    useEffect(() => {
        if (userAccountDetails && Object.keys(userAccountDetails) == 0) {
            const urlParams = new URLSearchParams(window.location.search);
            const authorizationCode = urlParams.get('code');

            if (authorizationCode) {
                // Now you have the authorization code, proceed to token exchange
                handleTokenExchange(authorizationCode);
            } else {
                console.error('Authorization code not found in URL parameters.');
            }
        }
    }, [userAccountDetails]);

    return (
        <div style={styles.body}>
            <div style={styles.container}>
                <h1 style={styles.h1}>Create Your Strava Account</h1>
                <p>Connect with Strava to start tracking your activities!</p>
                <button style={styles.loginBtn} onClick={redirectToStravaAuthorization} disabled={isLoading}>
                    {isLoading ? 'Connecting...' : 'Connect with Strava'}
                </button>
            </div>
        </div>
    );
};

export default StravaAccountCreation;
