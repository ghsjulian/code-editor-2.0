// Initialize the editor
const editor = ace.edit("editor");
// IMPORTANT: Set base path for offline loading of modes/themes/workers
ace.config.set("basePath", "ace/");
// Enable the Language Tools Extension
ace.require("ace/ext/language_tools");

// Tab switching logic
const tabs = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".settings-panel");
const settingsCard = document.querySelector(".settings-card");
const closeSettings = document.querySelector("#close-settings");

const openSettings = e => {
    settingsCard.style.display = "flex";
};
closeSettings.onclick = e => {
    settingsCard.style.display = "none";
};
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        // Deactivate active indicators
        tabs.forEach(t => t.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));

        // Set current selected targets
        tab.classList.add("active");
        const activePanel = document.getElementById(
            tab.getAttribute("data-target")
        );
        activePanel.classList.add("active");
    });
});

// Elements tracking
const inputs = {
    fontSize: document.getElementById("fontSize"),
    tabSize: document.getElementById("tabSize"),
    wrap: document.getElementById("wrap"),
    theme: document.getElementById("theme"),
    showGutter: document.getElementById("showGutter"),
    showPrintMargin: document.getElementById("showPrintMargin"),
    highlightActiveLine: document.getElementById("highlightActiveLine"),
    keyboardHandler: document.getElementById("keyboardHandler"),
    behavioursEnabled: document.getElementById("behavioursEnabled"),
    readOnly: document.getElementById("readOnly")
};

const jsonPreview = document.getElementById("jsonPreview");

const updateSettings = data => {
    document.getElementById("fontSize").value = data.fontSize;
    document.getElementById("tabSize").value = data.tabSize;
    document.getElementById("wrap").checked = data.wrap;
    document.getElementById("theme").value = data.theme;
    document.getElementById("showGutter").checked = data.showGutter;
    document.getElementById("showPrintMargin").checked = data.showPrintMargin;
    document.getElementById("highlightActiveLine").checked =
        data.highlightActiveLine;
    document.getElementById("keyboardHandler").value = data.keyboardHandler;
    document.getElementById("behavioursEnabled").checked =
        data.behavioursEnabled;
    document.getElementById("readOnly").checked = data.readOnly;
};
// Main compiler function logic
const generateConfig = () => {
    var config = JSON.parse(localStorage.getItem("editor")) || null;
    if (!config) {
        config = {
            theme: inputs.theme.value,
            lineHeight: 30,
            fontSize: parseInt(inputs.fontSize.value) || 15,
            tabSize: parseInt(inputs.tabSize.value) || 4,
            wrap: inputs.wrap.checked,
            showGutter: inputs.showGutter.checked,
            highlightActiveLine: inputs.highlightActiveLine.checked,
            keyboardHandler:
                inputs.keyboardHandler.value === "ace"
                    ? null
                    : inputs.keyboardHandler.value,
            behavioursEnabled: inputs.behavioursEnabled.checked,
            readOnly: inputs.readOnly.checked,
            showPrintMargin: inputs.showPrintMargin.checked,
            highlightSelectedWord: true,
            scrollPastEnd: 0.5,
            // Cursor / feel
            cursorStyle: "smooth",
            cursorBlinking: true,
            useSoftTabs: true,
            autoScrollEditorIntoView: true,
            displayIndentGuides: true,
            // AUTOCOMPLETE SYSTEM
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            // more aggressive autocomplete behavior
            liveAutocompletionDelay: 200,
            liveAutocompletionThreshold: 1,
            selectionStyle: "text",
            useTextareaForIME: true,
            copyWithEmptySelection: true,
            //maxLines: Infinity,
            minLines: 1,
            animatedScroll: true,
            scrollSpeed: 0.05
        };
        localStorage.setItem("editor", JSON.stringify(config));
    }
    updateSettings(config);
    editor.setOptions(config);
    jsonPreview.textContent = `// Pass this object to editor.setOptions(config);\nconst editorConfig = ${JSON.stringify(config, null, 4)};`;
};

// Add Event Listeners for Live Configuration Syncing
Object.values(inputs).forEach(input => {
    const eventType = input.type === "checkbox" ? "change" : "input";
    input.addEventListener(eventType, generateConfig);
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

// Initialize state on render
generateConfig();
