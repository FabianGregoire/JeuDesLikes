import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from './UserContext'; // Import the user context

function Room({ socket }) { // Receive socket as a prop
    const { roomCode } = useParams();
    const { user } = useUser(); // Get user info from context

    useEffect(() => {
        if (socket) {
            //socket.emit('joinRoom', roomCode); // Join the room when the component mounts

            // Cleanup function to disconnect the socket when the component unmounts
            return () => {
                socket.emit('leaveRoom', roomCode); // Optionally emit a leave event
            };
        }
    }, [roomCode, socket]);

    return (
        <div>
            <h2>Room Code: {roomCode}</h2>
            {user && (
                <p>Welcome, {user.displayName} (Spotify ID: {user.spotifyId})</p>
            )}
            {/* Other room-related UI */}
        </div>
    );
}

export default Room;