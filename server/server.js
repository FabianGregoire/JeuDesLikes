const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // Import uuid for generating unique room IDs
const Room = require('./models/Room'); // Import the Room model
const User = require('./models/User'); // Import the Room model
const roomRoutes = require('./routes/roomRoutes'); // Import the room routes
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);
// Configuration CORS pour Socket.io
const io = socketIo(server, {
  cors: {
      origin: function (origin, callback) {
          if (!origin || allowedOrigins.indexOf(origin) !== -1) {
              callback(null, true);
          } else {
              callback(new Error('Not allowed by CORS'));
          }
      },
      methods: ["GET", "POST"],
      credentials: true
  }
});

const allowedOrigins = [
  'http://localhost:3000',  // Pour développement local
  'http://51.68.142.69:5000' // Pour production
];

// Configuration CORS pour Express
app.use(cors({
  origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  methods: ["GET", "POST"],
  credentials: true
}));

// Routes
app.use('/api/rooms', roomRoutes);

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Spotify API credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Step 1: Redirect to Spotify for authentication
app.get('/auth/login', (req, res) => {
    const scope = 'user-library-read user-read-private'; // Add any other scopes you need
    res.redirect(`https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
    })}`);
});

// Step 2: Handle the callback from Spotify
app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;

    // Exchange the authorization code for an access token
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token, refresh_token } = response.data;

        // Fetch the user's Spotify ID and display name
        const userInfoResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const spotifyId = userInfoResponse.data.id; // Get the Spotify user ID
        const displayName = userInfoResponse.data.display_name; // Get the user's display name

        // Store the tokens in the database
        await User.findOneAndUpdate(
            { spotifyId },
            { accessToken: access_token, refreshToken: refresh_token },
            { upsert: true, new: true } // Create a new user if not found
        );

        // Redirect to the React application with the user's info
        res.redirect(`http://localhost:3000?spotifyId=${spotifyId}&displayName=${encodeURIComponent(displayName)}`);
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).send('Authentication failed');
    }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));


// Function to create a room
/*async function createRoom(name, leaderId, spotifyTokenLeader) {
  const roomId = uuidv4(); // Generate a unique roomId
  const room = new Room({
    roomId: roomId,
    leaderId: leaderId,
    players: [leaderId], // Add the leader to the list of players
    spotifyTokenLeader: spotifyTokenLeader,
  });
  await room.save();
  return room;
}*/

// Socket.io connections
io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  // When the leader creates a room
  socket.on('createRoom', async ({ creator }) => {
    try {
      const roomCode = Math.random().toString(36).substring(2, 8); // Generate a random room code
      const newRoom = new Room({
         roomCode: roomCode,
         leaderId: creator
      });
      await newRoom.save(); // Save the room to the database
      
      // Emit the roomCreated event to the socket that created the room
      socket.emit('roomCreated', roomCode);

      console.log(`Room created successfully with code: ${roomCode}`);
    } catch (err) {
      console.error('Error creating room:', err);
      socket.emit('error', 'Failed to create room');
    }
  });

  // When a player joins a room
  socket.on('joinRoom', async ({roomCode}) => {
    try {
      const room = await Room.findOne({ roomCode });
      if (room) {
        // Add the player to the room
        socket.join(roomCode); // Join the room
        room.players.push(socket.id); // Add player to the room
        await room.save(); // Save the updated room
        socket.emit('roomJoined', roomCode); // Notify the player
        console.log(`Player "${socket.id}" joined room "${roomCode}"`);

        // Check if the room has 2 players to start the game
        if (room.players.length === 2) {
          io.to(room).emit('startGame', room);
          console.log(`Game started in room "${roomCode}" with players "${room.players.join(', ')}"`);
        }
      } else {
        socket.emit('error', 'Room not found');
      }
    } catch (err) {
      console.error('Error joining room:', err);
      socket.emit('error', 'Failed to join room');
    }
  });

  // When a player disconnects
  socket.on('disconnect', () => {
    console.log('A player disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on http://0.0.0.0:${PORT}`);
});
