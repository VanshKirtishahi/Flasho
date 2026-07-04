require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/adminRoutes');
const User = require('./models/User');
const franchiseDashboardRoutes = require('./routes/franchiseDashboard');
const workerRoutes = require('./routes/workerRoutes');
const app = express();
const server = http.createServer(app);

// 🟢 Initialize Socket.io
const io = new Server(server, {
  cors: { 
    origin: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  }
});

// 🟢 BULLETPROOF CORS CONFIGURATION
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'], // Add your React port here
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true
}));

app.use(express.json());

// Make io accessible in your routes (api.js)
app.set('io', io);

// 🟢 Socket.io Real-Time Tracking Logic
io.on('connection', (socket) => {
  console.log('Client connected to socket:', socket.id);

  // Worker joins their personal room to receive private job alerts
  socket.on('join_worker_room', (workerMongoId) => {
    socket.join(workerMongoId);
    console.log(`Worker ${workerMongoId} joined room`);
  });

  // Worker continuously updates their location
  socket.on('update_location', async (data) => {
    try {
      const { workerId, latitude, longitude } = data;
      await User.findByIdAndUpdate(workerId, {
        live_location: { type: 'Point', coordinates: [longitude, latitude] },
        is_online: true
      });
    } catch (err) {
      console.error("Location update error:", err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from socket');
  });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);
app.use('/api/franchiseDashboard', franchiseDashboardRoutes);
app.use('/api/worker', workerRoutes);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));