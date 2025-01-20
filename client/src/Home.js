import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Import the user context
import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000'; // Or your production endpoint

function Home({ setSocket }) { // Receive setSocket as a prop
    const location = useLocation();
    const { setUser } = useUser(); // Get the setUser function from context
    const navigate = useNavigate(); // Initialize useNavigate
    
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const spotifyId = query.get('spotifyId');
        const displayName = query.get('displayName');

        if (spotifyId && displayName) {
            // Set the user info in context
            setUser({ spotifyId, displayName });

            // Establish the socket connection after authentication
            const socket = socketIOClient(ENDPOINT, {
                transports: ['websocket'],
                withCredentials: true,
                secure: true,
                reconnectionAttempts: 5,
                timeout: 20000,
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
            });
            setSocket(socket); // Set the socket in the parent component
            // Redirect to the room creation page or another appropriate page
            navigate('/create-room'); // Change this to your desired route
       
        }
    }, [location, setUser, setSocket]);

    const handleSpotifyLogin = () => {
        window.location.href = 'http://localhost:5000/auth/login'; // Redirect to your auth route
    };

    return (
        <div>
            <h1>Jeu Des Likes</h1>
            <button onClick={handleSpotifyLogin}>Connect with Spotify</button>
        </div>
    );
}

export default Home;