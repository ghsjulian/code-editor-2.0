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
    if (settingsCard) settingsCard.style.display = "flex";
};

if (closeSettings) {
    closeSettings.onclick = e => {
        if (settingsCard) settingsCard.style.display = "none";
    };
}

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        // Deactivate active indicators
        tabs.forEach(t => t.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));

        // Set current selected targets
        tab.classList.add("active");
        const targetId = tab.getAttribute("data-target");
        const activePanel = document.getElementById(targetId);

        if (activePanel) {
            activePanel.classList.add("active");
        }
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
    if (!data) return;

    if (inputs.fontSize) inputs.fontSize.value = data.fontSize;
    if (inputs.tabSize) inputs.tabSize.value = data.tabSize;
    if (inputs.wrap) inputs.wrap.checked = data.wrap;
    if (inputs.theme) inputs.theme.value = data.theme;
    if (inputs.showGutter) inputs.showGutter.checked = data.showGutter;
    if (inputs.showPrintMargin)
        inputs.showPrintMargin.checked = data.showPrintMargin;
    if (inputs.highlightActiveLine)
        inputs.highlightActiveLine.checked = data.highlightActiveLine;
    if (inputs.keyboardHandler)
        inputs.keyboardHandler.value = data.keyboardHandler || "ace";
    if (inputs.behavioursEnabled)
        inputs.behavioursEnabled.checked = data.behavioursEnabled;
    if (inputs.readOnly) inputs.readOnly.checked = data.readOnly;
};

// Main compiler function logic
const generateConfig = eventOrInit => {
    let config = null;

    // Safely attempt to parse existing config
    try {
        const storedConfig = localStorage.getItem("editor");
        if (storedConfig) {
            config = JSON.parse(storedConfig);
        }
    } catch (err) {
        console.error("Failed to parse localStorage config:", err);
    }

    // Determine if the function was triggered by a live input change
    const isInputEvent = eventOrInit instanceof Event;

    // Rebuild config if missing OR if a user just changed an input
    if (!config || isInputEvent) {
        config = {
            theme: inputs.theme?.value || "ace/theme/monokai",
            //lineHeight: 30,
            fontSize: parseInt(inputs.fontSize?.value, 10) || 15,
            tabSize: parseInt(inputs.tabSize?.value, 10) || 4,
            wrap: inputs.wrap?.checked || false,
            showGutter: inputs.showGutter?.checked || false,
            highlightActiveLine: inputs.highlightActiveLine?.checked || false,
            keyboardHandler:
                inputs.keyboardHandler?.value === "ace"
                    ? null
                    : inputs.keyboardHandler?.value || null,
            behavioursEnabled: inputs.behavioursEnabled?.checked || false,
            readOnly: inputs.readOnly?.checked || false,
            showPrintMargin: inputs.showPrintMargin?.checked || false,
            highlightSelectedWord: true,
            scrollPastEnd: 0.5,
            // Cursor / feel
            cursorStyle: "smooth",
            // cursorBlinking: true,
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

        // Safely save back to localStorage
        try {
            localStorage.setItem("editor", JSON.stringify(config));
        } catch (err) {
            console.warn("Could not save to localStorage:", err);
        }
    }

    updateSettings(config);
    editor.setOptions(config);

    if (jsonPreview) {
        jsonPreview.textContent = `// Pass this object to editor.setOptions(config);\nconst editorConfig = ${JSON.stringify(config, null, 4)};`;
    }
};

// Add Event Listeners for Live Configuration Syncing
Object.values(inputs).forEach(input => {
    if (!input) return; // Guard against missing DOM elements
    const eventType = input.type === "checkbox" ? "change" : "input";
    input.addEventListener(eventType, generateConfig);
});

function toggleExplorer() {
    const explorerSidebar = document.getElementById("explorer-sidebar");
    if (explorerSidebar) {
        explorerSidebar.classList.toggle("open");
    }
}

const openTerminal = () => {
    const terminalX = document.querySelector(".terminal");
    if (terminalX) {
        terminalX.classList.toggle("openTerm");
        terminalX.style.display = terminalX.classList.contains("openTerm")
            ? "block"
            : "none";
    }
};

// Initialize state on render
generateConfig();
