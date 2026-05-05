// Initialize the editor
const editor = ace.edit("editor");

// IMPORTANT: Set base path for offline loading of modes/themes/workers
ace.config.set("basePath", "ace/");

// Enable the Language Tools Extension
ace.require("ace/ext/language_tools");

editor.setOptions({
    // Visuals
    theme: "ace/theme/tomorrow_night_eighties",
    mode: "ace/mode/javascript",
    fontSize: "16px",
    showPrintMargin: false,
    showGutter: true,

    // ADVANCED FEATURES
    enableBasicAutocompletion: true, // Ctrl+Space
    enableLiveAutocompletion: true, // Shows as you type
    enableSnippets: true, // Code snippets (e.g., 'for' loop)

    // UX Improvements
    selectionStyle: "text",
    highlightActiveLine: true,
    cursorStyle: "smooth", // Makes the cursor feel modern
    behavioursEnabled: true, // Auto-close brackets/quotes
    displayIndentGuides: true,
    useSoftTabs: true,
    tabSize: 4
});

// Update Cursor Position in Status Bar (if you uncommented it)
editor.selection.on("changeCursor", function () {
    const pos = editor.getCursorPosition();
    const line = pos.row + 1;
    const col = pos.column + 1;
    const status = document.getElementById("cursor-pos");
    if (status) status.innerText = `Ln ${line}, Col ${col}`;
});



function toggleExplorer() {
    document.getElementById("explorer-sidebar").classList.toggle("open");
}

const openTerminal = () => {
    const terminalX = document.querySelector(".terminal");
    terminalX.classList.toggle("openTerm");
    terminalX.style.display = terminalX.classList.contains("openTerm")
        ? "block"
        : "none";
};




function toggleSettings() {
    alert(
        "Settings panel coming in next update.\n\nCurrent features:\n• Full folder tree\n• Long press context menu\n• Tabs & Ace Editor"
    );
}

