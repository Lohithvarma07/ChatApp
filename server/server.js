require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const convRoutes = require('./routes/conversations');
const { verifySocketJWT } = require('./utils/authMiddleware');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// health
app.get('/', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

// REST routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/conversations', convRoutes);

// Socket.IO
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
});

const onlineUsers = new Map(); // userId -> Set(socketId)
function presenceSnapshot() {
  const obj = {};
  for (const [uid, set] of onlineUsers.entries()) {
    if (set && set.size > 0) obj[String(uid)] = true;
  }
  return obj;
}

io.use(async (socket, next) => {
  try {
    await verifySocketJWT(socket); // sets socket.data.userId
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const { userId } = socket.data;

  // presence tracking
  const set = onlineUsers.get(userId) || new Set();
  set.add(socket.id);
  onlineUsers.set(userId, set);
  io.emit('user:online', { userId, online: true });
  socket.emit('presence:all', presenceSnapshot());
  // typing
  socket.on('typing:start', ({ to, conversationId }) => {
    const targets = onlineUsers.get(to);
    if (targets) targets.forEach((sid) => io.to(sid).emit('typing:start', { from: userId, conversationId }));
  });
  socket.on('typing:stop', ({ to, conversationId }) => {
    const targets = onlineUsers.get(to);
    if (targets) targets.forEach((sid) => io.to(sid).emit('typing:stop', { from: userId, conversationId }));
  });

  // message send
  socket.on('message:send', async ({ conversationId, to, text }) => {
    try {
      if (!conversationId || !to || !text?.trim()) return;

      const message = new Message({
        conversation: conversationId,
        from: userId,
        to,
        text,
        status: 'sent',
        createdAt: new Date(),
      });

      await message.save();

      // deliver to recipient
      const recSockets = onlineUsers.get(to);
      if (recSockets && recSockets.size > 0) {
        recSockets.forEach((sid) => io.to(sid).emit('message:new', message));

        // delivered
        message.status = 'delivered';
        await message.save();

         socket.emit('message:delivered', {
        messageId: String(message._id),
        conversationId: String(message.conversation),
      });
      }

      // echo to sender
      socket.emit('message:sent', message);
    } catch (err) {
      console.error('message:send error', err);
    }
  });

  // mark read
  socket.on('message:read', async ({ messageId }) => {
    try {
      const msg = await Message.findById(messageId);
      if (!msg) return;
      msg.status = 'read';
      await msg.save();

      const senderSockets = onlineUsers.get(String(msg.from));
      if (senderSockets) {
      senderSockets.forEach((sid) =>
        io.to(sid).emit('message:read', {
          messageId: String(msg._id),
          conversationId: String(msg.conversation),
        })
      );
    }
  } catch (err) {
    console.error('message:read error', err);
  }
});

  // disconnect
  socket.on('disconnect', () => {
    const current = onlineUsers.get(userId);
    if (current) {
      current.delete(socket.id);
      if (current.size === 0) {
        onlineUsers.delete(userId);
        io.emit('user:online', { userId, online: false });
      } else {
        onlineUsers.set(userId, current);
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
