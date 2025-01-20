import React, { useState } from 'react';
import { useUser } from './UserContext'; // Import the user context
import { useNavigate } from 'react-router-dom'; // Import useNavigate


function CreateRoom({ socket }) { // Receive socket as a prop
    const [roomCode, setRoomCode] = useState('');
    const { user } = useUser(); // Get user info from context
    const navigate = useNavigate(); // Initialize useNavigate

    const handleCreateRoom = () => {
        if (socket) {
            // Emit a socket event to create a room
            socket.emit('createRoom', { creator: user.spotifyId }); // Send the creator's Spotify ID
            console.log('Creating room...');

            socket.on('roomCreated', (newRoomCode) => {
                console.log(`Room created with code: ${newRoomCode}`);
                setRoomCode(newRoomCode);
                handleJoinRoom(newRoomCode);
                //navigate(`/room/${newRoomCode}`); // Redirect to the room page
            });
        }
    };

    const handleJoinRoom = (newRoomCode) => {
        if (socket && newRoomCode) {
            // Emit a socket event to join a room
            socket.emit('joinRoom', { roomCode: newRoomCode}); // Send the room code and user's Spotify ID
            console.log(`Joining room with code: ${newRoomCode}`);

            // Listen for confirmation of joining the room
            socket.on('roomJoined', () => {
                navigate(`/room/${newRoomCode}`); // Redirect to the room page
            });
        } else {
            console.error('Room code is required to join a room.');
        }
    };

    return (
        <div>
            <h2>Create or Join a Room</h2>
            <div>
                <button onClick={handleCreateRoom}>Create Room</button>
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Enter room code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                />
                <button onClick={handleJoinRoom(roomCode)}>Join Room</button>
            </div>
        </div>
    );
}

export default CreateRoom;