/**
 * client-socket.js - Socket.IO Client Communication
 * Handles all client-side socket events for file operations
 */

class SocketClient {
    constructor() {
        this.socket = this.initSocket();
        this.setupEventListeners();
    }

    initSocket() {
        const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
        const host = window.location.hostname;
        const port = window.location.port || (protocol === 'https' ? 443 : 80);
        const url = `${protocol}://${host}:${port}`;

        const socket = io(url, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        return socket;
    }

    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('[+] Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('[!] Socket disconnected:', reason);
        });

        this.socket.on('error', (error) => {
            console.error('[!] Socket error:', error);
        });

        this.socket.on('file-data', (data) => {
            console.log('[+] File data received');
            // Handle file data from backend
        });
    }

    // File Operations
    createFile(path) {
        if (!path) {
            console.warn('Path is required');
            return;
        }
        this.socket.emit('create-file', path);
    }

    createFolder(path) {
        if (!path) {
            console.warn('Path is required');
            return;
        }
        this.socket.emit('create-folder', path);
    }

    deleteFile(path) {
        if (!path) {
            console.warn('Path is required');
            return;
        }
        this.socket.emit('delete-file', path);
    }

    deleteFolder(path) {
        if (!path) {
            console.warn('Path is required');
            return;
        }
        this.socket.emit('delete-folder', path);
    }

    copyFile(data) {
        if (!data?.source || !data?.destination) {
            console.warn('Source and destination are required');
            return;
        }
        this.socket.emit('copy-file', data);
    }

    copyFolder(data) {
        if (!data?.source || !data?.destination) {
            console.warn('Source and destination are required');
            return;
        }
        this.socket.emit('copy-folder', data);
    }

    moveFile(data) {
        if (!data?.source || !data?.destination) {
            console.warn('Source and destination are required');
            return;
        }
        this.socket.emit('move-file', data);
    }

    moveFolder(data) {
        if (!data?.source || !data?.destination) {
            console.warn('Source and destination are required');
            return;
        }
        this.socket.emit('move-folder', data);
    }

    openFile(path) {
        if (!path) {
            console.warn('Path is required');
            return;
        }
        this.socket.emit('open-file', path);
    }

    renameFile(path, name) {
        if (!path || !name) {
            console.warn('Path and name are required');
            return;
        }
        this.socket.emit('rename-file', { path, name });
    }

    renameFolder(path, name) {
        if (!path || !name) {
            console.warn('Path and name are required');
            return;
        }
        this.socket.emit('rename-folder', { path, name });
    }

    saveFile(fileData) {
        if (!fileData) {
            console.warn('File data is required');
            return;
        }
        this.socket.emit('save-file', fileData);
    }

    runCode(data) {
        if (!data) {
            console.warn('Code data is required');
            return;
        }
        this.socket.emit('run-code', data);
    }

    executeCommand(command, callback) {
        if (!command) {
            console.warn('Command is required');
            return;
        }
        this.socket.emit('terminal:input', command);
    }

    onTerminalOutput(callback) {
        this.socket.on('terminal:output', callback);
    }

    offTerminalOutput(callback) {
        this.socket.off('terminal:output', callback);
    }
}

// Export for use
window.socketClient = new SocketClient();
