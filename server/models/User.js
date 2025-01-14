const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    spotifyId: { type: String, required: true, unique: true }, // Spotify user ID
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);