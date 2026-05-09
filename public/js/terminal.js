/**
 * terminal.js - Terminal Emulator
 * In-browser terminal with command history and execution
 */

class TerminalEmulator {
    constructor() {
        this.terminalElement = document.querySelector('.terminal');
        this.terminalBody = document.getElementById('terminal');
        this.commandHistory = [];
        this.historyIndex = -1;
        
        if (this.terminalBody && window.socketClient) {
            this.init();
        }
    }

    init() {
        this.setupSocketListeners();
        this.createPrompt();
        console.log('[+] Terminal emulator initialized');
    }

    setupSocketListeners() {
        if (window.socketClient) {
            window.socketClient.onTerminalOutput((data) => {
                this.displayOutput(data);
            });
        }
    }

    createPrompt() {
        const promptLine = document.createElement('div');
        promptLine.className = 'prompt-line';

        const hostname = window.location.hostname || 'localhost';
        const username = 'user';

        promptLine.innerHTML = `
            <span class="prompt">
                <span class="prompt-host">${hostname}</span>:
                <span class="prompt-user">${username}</span>
                <span class="prompt-symbol">#</span>
            </span>
            <input type="text" autofocus spellcheck="false" autocomplete="off" class="terminal-input">
        `;

        const input = promptLine.querySelector('.terminal-input');
        this.setupInputHandlers(input, promptLine);

        this.terminalBody.appendChild(promptLine);
        input.focus();
        this.terminalBody.scrollTop = this.terminalBody.scrollHeight;
    }

    setupInputHandlers(input, promptLine) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleCommand(input, promptLine);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.showPreviousCommand(input);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.showNextCommand(input);
            }
        });
    }

    handleCommand(input, promptLine) {
        const command = input.value.trim();
        input.disabled = true;

        if (!command) {
            this.createPrompt();
            return;
        }

        // Add to history
        this.commandHistory.unshift(command);
        this.historyIndex = -1;

        // Handle local commands
        if (this.handleLocalCommand(command)) {
            this.createPrompt();
            return;
        }

        // Send to server
        this.executeRemoteCommand(command);
    }

    handleLocalCommand(command) {
        const lowerCmd = command.toLowerCase().trim();

        if (lowerCmd === 'clear' || lowerCmd === 'cls') {
            this.terminalBody.innerHTML = '<div class="welcome">Terminal cleared</div>';
            return true;
        }

        if (lowerCmd === 'help') {
            this.displayOutput('Available commands: clear, help, exit\n');
            return true;
        }

        if (lowerCmd === 'exit') {
            this.displayOutput('Use the close button to exit terminal\n');
            return true;
        }

        return false;
    }

    executeRemoteCommand(command) {
        if (!window.socketClient) {
            this.displayOutput('Error: Socket not connected\n');
            this.createPrompt();
            return;
        }

        // Show executing status
        const statusDiv = document.createElement('div');
        statusDiv.className = 'output';
        statusDiv.style.color = '#8be9fd';
        statusDiv.textContent = 'Executing...';
        this.terminalBody.appendChild(statusDiv);

        // Execute command
        window.socketClient.executeCommand(command, () => {
            statusDiv.remove();
            this.createPrompt();
        });
    }

    displayOutput(output) {
        if (!output) return;

        const outputDiv = document.createElement('div');
        outputDiv.className = 'output';
        
        // Sanitize output to prevent XSS
        outputDiv.textContent = output;
        
        this.terminalBody.appendChild(outputDiv);
        this.terminalBody.scrollTop = this.terminalBody.scrollHeight;
    }

    showPreviousCommand(input) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex = Math.min(
            this.historyIndex + 1,
            this.commandHistory.length - 1
        );
        input.value = this.commandHistory[this.historyIndex];
    }

    showNextCommand(input) {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            input.value = this.commandHistory[this.historyIndex];
        } else {
            this.historyIndex = -1;
            input.value = '';
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.terminalEmulator = new TerminalEmulator();
    });
} else {
    window.terminalEmulator = new TerminalEmulator();
}
