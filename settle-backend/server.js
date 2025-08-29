import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import http from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/database.js';
import { app } from './src/app.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', (userEmail) => {
    if (userEmail) {
      socket.join(userEmail);
      console.log(`User with email ${userEmail} joined their room.`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

connectDB()
  .then(() => {
    const port = process.env.PORT || 8000;
    
    server.listen(port, () => {
        console.log(`Server is running on: http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log('MongoDB connection failed:', error.message);
    process.exit(1);
  });