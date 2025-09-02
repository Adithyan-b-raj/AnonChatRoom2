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

// Store active users and messages for single room
const activeUsers = new Map();
const messages = [];

// Routes
app.get('/', (req, res) => {
  res.render('chat');
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join the chat
  socket.on('join-chat', (data) => {
    const { username } = data;
    
    // Store user info
    activeUsers.set(socket.id, { username });
    
    // Notify others about new user
    socket.broadcast.emit('user-joined', {
      message: `${username} joined the chat`,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Send existing messages to new user
    socket.emit('previous-messages', messages);
    
    // Update user count
    io.emit('user-count', activeUsers.size);
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
      
      // Store message
      messages.push(messageData);
      // Keep only last 100 messages
      if (messages.length > 100) {
        messages.shift();
      }
      
      // Broadcast to all users
      io.emit('message', messageData);
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.broadcast.emit('user-typing', {
        username: user.username,
        isTyping: data.isTyping
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      // Notify others about user leaving
      socket.broadcast.emit('user-left', {
        message: `${user.username} left the chat`,
        timestamp: new Date().toLocaleTimeString()
      });
      
      activeUsers.delete(socket.id);
      
      // Update user count
      io.emit('user-count', activeUsers.size);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat server running on port ${PORT}`);
});