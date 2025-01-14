import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation

const ENDPOINT = 'http://localhost:5000';  // Ou http://51.68.142.69:5000  en production

function App() {

  // Connect the client to the Socket.io server
  const [socket] = useState(() => socketIOClient(ENDPOINT, {
    transports: ['websocket'],
    withCredentials: true,
    secure: true,
    reconnectionAttempts: 5,
    timeout: 20000,
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  }));
  const history = useHistory();
  const handleSpotifyLogin = () => {
      window.location.href = 'http://localhost:5000/auth/login'; // Redirect to your auth route
  };

  useEffect(() => {
    // Créer une salle
    socket.emit('createRoom', 'Room 1', '01', 'spotify-token-leader');

    // Lors de la confirmation de création de la salle
    socket.on('roomCreated', (room) => {
      console.log('Room created:', room);
    });

    // Example: Join a room
    socket.emit('joinRoom', '01', 'player-id');

    // Listen for room joining confirmation
    socket.on('roomJoined', (room) => {
      console.log('Room joined:', room);
    });

    // Démarrer le jeu lorsque les deux joueurs sont dans la salle
    socket.on('startGame', (room) => {
      console.log('Game started:', room);
      // Logique pour démarrer la partie ici, par exemple afficher la première musique
      alert('The game is starting!');
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Jeu Des Likes</h1>
      <button onClick={handleSpotifyLogin}>Connect with Spotify</button>
    </div>
  );
}

export default App;
