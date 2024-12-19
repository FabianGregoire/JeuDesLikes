const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Salle = require('./models/salle'); // Importer le modèle Salle

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const path = require('path');
// Afficher le chemin absolu de l'emplacement actuel du fichier .env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('TEST_VAR:', process.env.TEST_VAR);

if (!process.env.MONGO_URI) {
  console.error("La variable d'environnement MONGO_URI n'est pas définie !");
  process.exit(1); // Arrêter l'exécution du serveur si l'URI n'est pas définie
}

// Connecter MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.log('Erreur de connexion à MongoDB:', err));

// Fonction pour créer une salle
async function createSalle(name, leaderId) {
  const salle = new Salle({
    name: name,
    leader: leaderId,
    players: [leaderId],  // Ajouter le leader dans la liste des joueurs
  });
  await salle.save();
  return salle;
}

// Gérer les connexions avec Socket.io
io.on('connection', (socket) => {
  console.log('Un joueur est connecté :', socket.id);

  // Lorsque le leader crée une salle
  socket.on('createSalle', async (name, leaderId) => {
    const salle = await createSalle(name, leaderId);
    socket.emit('salleCreated', salle); // Émettre la salle créée
    console.log(`Salle ${name} créée avec le leader ${leaderId}`);
  });

  // Lorsque quelqu'un rejoint une salle
  socket.on('joinSalle', async (salleId, playerId) => {
    const salle = await Salle.findById(salleId);
    if (salle) {
      salle.players.push(playerId); // Ajouter le joueur à la salle
      await salle.save();
      socket.emit('salleJoined', salle); // Confirmer l'ajout à la salle
      console.log(`Joueur ${playerId} a rejoint la salle ${salleId}`);
    } else {
      socket.emit('error', 'Salle non trouvée');
    }
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('Un joueur a quitté la connexion');
  });
});

// Démarrer le serveur
server.listen(5000, () => {
  console.log('Serveur démarré sur http://localhost:5000');
});
