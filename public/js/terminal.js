const terminalX = document.querySelector(".terminal");
const terminal = document.getElementById("terminal");
let commandHistory = [];
let historyIndex = -1;

const openTerminal = () => {
    terminalX.classList.toggle("openTerm");
    if (terminalX.classList.contains("openTerm")) {
        terminalX.style.display = "block";
    } else {
        terminalX.style.display = "none";
    }
};

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

            if (command) {
                commandHistory.unshift(command);
                historyIndex = -1;

                // Display command
                const commandOutput = document.createElement("div");
                commandOutput.innerHTML = `
              <span class="prompt">
                <span class="prompt-host">localhost</span>:<span class="prompt-user">ghs</span>--<span class="prompt-symbol">#</span>
              </span>
              <span style="color:#ffffff;">${command}</span>
            `;
                terminal.appendChild(commandOutput);

                // Process command
                processCommand(command);
            }

            // Create new prompt
            input.disabled = true;
            createPrompt();
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

    // Scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;
}

function processCommand(cmd) {
    const output = document.createElement("div");
    output.className = "output";

    const lowerCmd = cmd.toLowerCase().trim();

    switch (lowerCmd) {
        case "help":
            output.innerHTML = `
            Available commands:<br>
            • <span style="color:#50fa7b;">clear</span> - Clear terminal<br>
            • <span style="color:#50fa7b;">whoami</span> - Show current user<br>
            • <span style="color:#50fa7b;">date</span> - Show current date & time<br>
            • <span style="color:#50fa7b;">neofetch</span> - Show system info<br>
            • <span style="color:#50fa7b;">ls</span> - List files<br>
            • <span style="color:#50fa7b;">pwd</span> - Print working directory<br>
            • <span style="color:#50fa7b;">echo [text]</span> - Print text<br>
            • <span style="color:#ff79c6;">help</span> - Show this help
          `;
            break;

        case "clear":
            terminal.innerHTML = `<div class="welcome">Terminal cleared.<br></div>`;
            createPrompt();
            return;

        case "whoami":
            output.textContent = "ghs";
            break;

        case "date":
            output.textContent = new Date().toString();
            break;

        case "pwd":
            output.textContent = "/home/ghs";
            break;

        case "ls":
            output.innerHTML = `
            <span style="color:#8be9fd;">Desktop</span>  <span style="color:#8be9fd;">Documents</span>  <span style="color:#8be9fd;">Downloads</span><br>
            projects/  scripts/  <span style="color:#ff79c6;">.bashrc</span>  <span style="color:#ff79c6;">.zshrc</span>
          `;
            break;

        case "neofetch":
            output.innerHTML = `
            <span style="color:#50fa7b;">       ███████╗ █████╗  ██████╗ ███████╗</span><br>
            <span style="color:#50fa7b;">       ██╔════╝██╔══██╗██╔════╝ ██╔════╝</span><br>
            <span style="color:#50fa7b;">       █████╗  ███████║██║  ███╗█████╗  </span><br>
            <span style="color:#50fa7b;">       ██╔══╝  ██╔══██║██║   ██║██╔══╝  </span><br>
            <span style="color:#50fa7b;">       ██║     ██║  ██║╚██████╔╝███████╗</span><br>
            <span style="color:#50fa7b;">       ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝</span><br><br>
            <span style="color:#ff79c6;">OS:</span> Arch Linux x86_64<br>
            <span style="color:#ff79c6;">Host:</span> GHS Custom Terminal<br>
            <span style="color:#ff79c6;">Kernel:</span> 6.8.0-ghs<br>
            <span style="color:#ff79c6;">Uptime:</span> 42 mins<br>
            <span style="color:#ff79c6;">Shell:</span> ghs-terminal<br>
            <span style="color:#ff79c6;">User:</span> ghs
          `;
            break;

        default:
            if (lowerCmd.startsWith("echo ")) {
                output.textContent = cmd.substring(5);
            } else if (lowerCmd) {
                output.innerHTML = `zsh: command not found: <span style="color:#ff5555;">${cmd}</span>`;
            }
    }

    if (output.innerHTML !== "") {
        terminal.appendChild(output);
    }
}

// Initialize
    createPrompt();
