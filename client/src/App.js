import React, { useEffect } from 'react';
import io from 'socket.io-client';

function App() {
  useEffect(() => {
    // Connecter le client à ton serveur Socket.io
    const socket = io('http://51.68.142.69:5000');

    // Créer une salle (exemple)
    socket.emit('createSalle', 'Salle 1', 'leader-id');

    // Écouter les événements côté client
    socket.on('salleCreated', (salle) => {
      console.log('Salle créée:', salle);
    });

    // Rejoindre une salle (exemple)
    socket.emit('joinSalle', 'salle-id', 'player-id');

    socket.on('salleJoined', (salle) => {
      console.log('Salle rejointe:', salle);
    });

    // Nettoyer à la déconnexion
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Bienvenue dans le Jeu des Likes</h1>
    </div>
  );
}

export default App;
