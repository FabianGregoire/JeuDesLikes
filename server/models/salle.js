// models/salle.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Définir le schéma de la salle
const salleSchema = new Schema({
  name: { type: String, required: true },  // Nom de la salle
  players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],  // Liste des joueurs
  leader: { type: Schema.Types.ObjectId, ref: 'Player' },  // Joueur leader
  createdAt: { type: Date, default: Date.now },  // Date de création
});

// Créer le modèle à partir du schéma
const Salle = mongoose.model('Salle', salleSchema);
module.exports = Salle;