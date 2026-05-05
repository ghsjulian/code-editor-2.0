const terminalX = document.querySelector(".terminal");
const terminal = document.getElementById("terminal");
let commandHistory = [];
let historyIndex = -1;


function createPrompt() {
    const promptLine = document.createElement("div");
    promptLine.className = "prompt-line";

    promptLine.innerHTML = `
        <span class="prompt">
          <span class="prompt-host">localhost</span>:<span class="prompt-user">ghs</span>--<span class="prompt-symbol">#</span>
        </span>
        <input type="text" autofocus spellcheck="false" autocomplete="off">
    `;

    const input = promptLine.querySelector("input");

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            const command = input.value.trim();
            input.disabled = true; // Lock input immediately to prevent spamming

            if (command) {
                commandHistory.unshift(command);
                historyIndex = -1;
                processCommand(command);
            } else {
                // If empty command, just generate a new prompt
                createPrompt();
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (commandHistory.length > 0) {
                historyIndex = Math.min(
                    historyIndex + 1,
                    commandHistory.length - 1
                );
                input.value = commandHistory[historyIndex];
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                input.value = "";
            }
        }
    });

    terminal.appendChild(promptLine);
    input.focus();
    terminal.scrollTop = terminal.scrollHeight;
}

function processCommand(cmd) {
    const lowerCmd = cmd.toLowerCase().trim();

    // It's usually best to handle terminal-clearing purely on the client side
    if (lowerCmd === "clear" || lowerCmd === "cls") {
        terminal.innerHTML = `<div class="welcome">Terminal cleared.<br></div>`;
        createPrompt();
        return;
    }

    // Show a temporary loading indicator (optional but good for UX)
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "output";
    loadingDiv.style.color = "#8be9fd";
    loadingDiv.textContent = "Executing...";
    terminal.appendChild(loadingDiv);
    terminal.scrollTop = terminal.scrollHeight;

    // Send the command to the backend using a Socket.io callback (acknowledgement)
    socket.emit("execute-command", cmd, serverResponse => {
        // Remove the loading indicator once the response arrives
        terminal.removeChild(loadingDiv);

        const output = document.createElement("div");
        output.className = "output";

        // Render the backend response. (Ensure backend sanitizes output to prevent XSS)
        output.innerHTML = serverResponse;

        if (output.innerHTML !== "") {
            terminal.appendChild(output);
        }

        // Generate the new prompt AFTER the server response has been printed
        createPrompt();
    });
}

// Initialize
createPrompt();
