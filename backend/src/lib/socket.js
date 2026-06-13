const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow connections from frontend
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Allow clients to join specific rooms (e.g. 'kitchen', 'cashier')
    socket.on('join', (room) => {
      console.log(`👤 Client ${socket.id} joined room: ${room}`);
      socket.join(room);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  return io;
};

module.exports = {
  initSocket,
  getIo
};
