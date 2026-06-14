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
      let finalRoom = room;
      if (room === 'admin') finalRoom = 'admin-room';
      else if (room === 'cashier') finalRoom = 'cashier-room';
      else if (room === 'kitchen') finalRoom = 'kitchen-room';

      console.log(`👤 Client ${socket.id} joined room: ${finalRoom}`);
      socket.join(finalRoom);
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
