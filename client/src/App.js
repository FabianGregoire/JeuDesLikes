import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home'; // Import the Home component
import Room from './Room'; // Import the Room component
import { UserProvider, useUser } from './UserContext'; // Import UserProvider and useUser
import CreateRoom from './CreateRoom';

const ENDPOINT = 'http://localhost:5000';  // Ou http://51.68.142.69:5000  en production

function App() {

  // Connect the client to the Socket.io server
  const [socket, setSocket] = useState(null);
  /*const [socket] = useState(() => socketIOClient(ENDPOINT, {
    transports: ['websocket'],
    withCredentials: true,
    secure: true,
    reconnectionAttempts: 5,
    timeout: 20000,
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  }));*/

  return (
    <UserProvider>
        <Router>
            <Routes>
                <Route path="/" element={<Home setSocket={setSocket} />} /> {/* Pass setSocket to Home */}
                <Route path="/create-room" element={<CreateRoom socket={socket} />} />
                <Route path="/room/:roomCode" element={<Room socket={socket} />} /> {/* Pass socket to Room */}
            </Routes>
        </Router>
    </UserProvider>
  );
}

export default App;
