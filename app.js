const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set up Handlebars as view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store active users and rooms
const activeUsers = new Map();
const chatRooms = new Map();

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  res.render('chat', { roomId });
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a chat room
  socket.on('join-room', (data) => {
    const { roomId, username } = data;
    socket.join(roomId);
    
    // Store user info
    activeUsers.set(socket.id, { username, roomId });
    
    // Initialize room if it doesn't exist
    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, { users: new Set(), messages: [] });
    }
    
    const room = chatRooms.get(roomId);
    room.users.add(socket.id);
    
    // Notify others about new user
    socket.to(roomId).emit('user-joined', {
      message: `${username} joined the chat`,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Send existing messages to new user
    socket.emit('previous-messages', room.messages);
    
    // Update user count
    io.to(roomId).emit('user-count', room.users.size);
  });

  // Handle new messages
  socket.on('new-message', (data) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      const messageData = {
        username: user.username,
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now()
      };
      
      // Store message in room
      const room = chatRooms.get(user.roomId);
      if (room) {
        room.messages.push(messageData);
        // Keep only last 100 messages
        if (room.messages.length > 100) {
          room.messages.shift();
        }
      }
      
      // Broadcast to all users in the room
      io.to(user.roomId).emit('message', messageData);
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.to(user.roomId).emit('user-typing', {
        username: user.username,
        isTyping: data.isTyping
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      const room = chatRooms.get(user.roomId);
      if (room) {
        room.users.delete(socket.id);
        
        // Notify others about user leaving
        socket.to(user.roomId).emit('user-left', {
          message: `${user.username} left the chat`,
          timestamp: new Date().toLocaleTimeString()
        });
        
        // Update user count
        io.to(user.roomId).emit('user-count', room.users.size);
        
        // Clean up empty rooms
        if (room.users.size === 0) {
          chatRooms.delete(user.roomId);
        }
      }
      
      activeUsers.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat server running on port ${PORT}`);
});