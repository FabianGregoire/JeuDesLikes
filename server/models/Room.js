const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  //roomId: { type: String, required: true, unique: true },
  roomCode: { type: String, required: true, unique: true }, // Unique room code
  leaderId: { type: String, required: true },
  players: [{ type: String }], // Liste des IDs des joueurs
  spotifyTokenLeader: { type: String },
  currentTrack: {
    title: { type: String },
    artist: { type: String },
    uri: { type: String }, // Spotify URI
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Room', RoomSchema);
