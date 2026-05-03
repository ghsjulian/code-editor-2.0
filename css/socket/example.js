const { Server } = require('socket.io'); const jwt = require('jsonwebtoken'); const { spawn } = require('child_process');

function createCommandSocket(httpServer, options = {}) { const { jwtSecret = process.env.JWT_SECRET || 'change-this-secret', allowedOrigins = ['*'], allowedCommands = ['pwd', 'ls', 'dir', 'whoami', 'node', 'npm'], namespace = '/terminal' } = options;

const io = new Server(httpServer, { cors: { origin: allowedOrigins, credentials: true } });

const terminal = io.of(namespace);

terminal.use((socket, next) => { try { const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

if (!token) {
    return next(new Error('Authentication required'));
  }

  const decoded = jwt.verify(token, jwtSecret);
  socket.user = decoded;
  next();
} catch (error) {
  next(new Error('Invalid or expired token'));
}

});

terminal.on('connection', (socket) => { console.log(Authenticated user: ${socket.user?.id || 'unknown'} (${socket.id}));

socket.emit('terminal:ready', {
  message: 'Secure terminal connected',
  user: socket.user
});

socket.on('terminal:execute', ({ command, args = [] }) => {
  if (!command || typeof command !== 'string') {
    return socket.emit('terminal:error', {
      message: 'Invalid command'
    });
  }

  if (!allowedCommands.includes(command)) {
    return socket.emit('terminal:error', {
      message: `Command '${command}' is not allowed`
    });
  }

  const child = spawn(command, args, {
    shell: false,
    cwd: process.cwd(),
    env: process.env
  });

  child.stdout.on('data', (data) => {
    socket.emit('terminal:output', {
      type: 'stdout',
      data: data.toString()
    });
  });

  child.stderr.on('data', (data) => {
    socket.emit('terminal:output', {
      type: 'stderr',
      data: data.toString()
    });
  });

  child.on('close', (code) => {
    socket.emit('terminal:complete', {
      command,
      code
    });
  });

  child.on('error', (error) => {
    socket.emit('terminal:error', {
      message: error.message
    });
  });
});

socket.on('disconnect', (reason) => {
  console.log(`Disconnected: ${socket.id} (${reason})`);
});

});

return io; }

module.exports = createCommandSocket;

// client.js const { io } = require('socket.io-client');

class RemoteTerminalClient { constructor(serverUrl, token) { this.socket = io(${serverUrl}/terminal, { auth: { token }, transports: ['websocket'] });

this.registerEvents();

}

registerEvents() { this.socket.on('connect', () => { console.log(Connected: ${this.socket.id}); });

this.socket.on('disconnect', (reason) => {
  console.log(`Disconnected: ${reason}`);
});

this.socket.on('command:output', (data) => {
  process.stdout.write(data.output);
});

this.socket.on('command:error', (error) => {
  console.error('Error:', error.message);
});

this.socket.on('command:complete', (data) => {
  console.log(`

Process exited with code ${data.code}`); }); }

run(command, args = []) { this.socket.emit('command:run', { command, args }); }

disconnect() { this.socket.disconnect(); } }

module.exports = RemoteTerminalClient;

/* Usage Example const RemoteTerminalClient = require('./client');

const client = new RemoteTerminalClient( 'http://localhost:3000', 'YOUR_JWT_TOKEN' );

client.run('node', ['-v']); client.run('npm', ['-v']); */
