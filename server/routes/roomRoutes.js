const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { v4: uuidv4 } = require('uuid'); // Pour générer des roomId uniques

// Endpoint pour créer une salle
router.post('/create', async (req, res) => {
  try {
    const { leaderId, spotifyTokenLeader } = req.body;

    // Créer une nouvelle salle
    const newRoom = new Room({
      roomId: uuidv4(),
      leaderId,
      players: [leaderId], // Le leader est le premier joueur
      spotifyTokenLeader,
    });

    await newRoom.save();
    return res.status(201).json(newRoom);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la création de la salle.' });
  }
});

// Endpoint pour rejoindre une salle
router.post('/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { playerId } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Salle introuvable.' });
    }

    // Limiter le nombre de joueurs à 2 (ou plus tard)
    if (room.players.length >= 2) {
      return res.status(403).json({ message: 'La salle est déjà pleine.' });
    }

    // Ajouter le joueur à la salle
    room.players.push(playerId);
    await room.save();

    return res.status(200).json(room);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la tentative de rejoindre la salle.' });
  }
});

// Endpoint pour récupérer les informations d'une salle
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Salle introuvable.' });
    }

    return res.status(200).json(room);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des informations de la salle.' });
  }
});

module.exports = router;
