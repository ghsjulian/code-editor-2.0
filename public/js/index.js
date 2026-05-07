// Initialize the editor
const editor = ace.edit("editor");

// IMPORTANT: Set base path for offline loading of modes/themes/workers
ace.config.set("basePath", "ace/");

// Enable the Language Tools Extension
ace.require("ace/ext/language_tools");

/*
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
*/
// editor.setTheme("ace/theme/one_dark");
editor.setOptions({
    // =========================
    // THEME + MODE (CORE)
    // =========================
    // theme: "ace/theme/tomorrow_night_eighties",
    theme: "ace/theme/tomorrow_night_eighties",
    mode: "ace/mode/javascript",

    // =========================
    // VISUAL EXPERIENCE
    // =========================
    fontSize: "17px",
    lineHeight: 30,
    showPrintMargin: false,
    showGutter: true,
    highlightActiveLine: true,
    highlightSelectedWord: true,
    wrap: false,
    scrollPastEnd: 0.5,

    // Cursor / feel
    cursorStyle: "smooth",
    cursorBlinking: true,

    // =========================
    // INDENTATION / FORMAT FEEL
    // =========================
    tabSize: 4,
    useSoftTabs: true,
    behavioursEnabled: true, // auto brackets, quotes, etc
    autoScrollEditorIntoView: true,
    displayIndentGuides: true,

    // =========================
    // AUTOCOMPLETE SYSTEM
    // =========================
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,

    // more aggressive autocomplete behavior
    liveAutocompletionDelay: 200,
    liveAutocompletionThreshold: 1,

    // =========================
    // ADVANCED EDITING FEATURES
    // =========================
    selectionStyle: "text",
    useTextareaForIME: true,
    copyWithEmptySelection: true,

    // =========================
    // PERFORMANCE (important for big files)
    // =========================
    //maxLines: Infinity,
    minLines: 1,

    // =========================
    // FIND / REPLACE POWER
    // =========================
    animatedScroll: true,
    scrollSpeed: 0.05,

    // =========================
    // KEYBOARD EXPERIENCE
    // =========================
    useSoftTabs: true
});
// Update Cursor Position in Status Bar (if you uncommented it)
editor.selection.on("changeCursor", function () {
    const pos = editor.getCursorPosition();
    const line = pos.row + 1;
    const col = pos.column + 1;
    const status = document.getElementById("cursor-pos");
    if (status) status.innerText = `Ln ${line}, Col ${col}`;
});

