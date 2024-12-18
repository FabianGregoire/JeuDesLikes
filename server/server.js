const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Route principale pour tester le serveur
app.get('/api', (req, res) => {
  res.json({ message: 'Bienvenue dans le backend du Jeu des Likes !' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
