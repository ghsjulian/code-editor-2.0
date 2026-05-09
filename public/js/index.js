/**
 * index.js - Ace Editor Configuration
 * Main editor initialization with optimized settings for production
 */

class EditorManager {
    constructor() {
        this.editor = null;
        this.init();
    }

    init() {
        try {
            // Initialize the editor
            this.editor = ace.edit('editor');
            
            // Set base path for offline loading
            ace.config.set('basePath', 'ace/');
            
            // Enable Language Tools Extension
            ace.require('ace/ext/language_tools');
            
            // Configure editor options
            this.configureEditor();
            
            // Setup event listeners
            this.setupListeners();
            
            console.log('[+] Editor initialized successfully');
        } catch (error) {
            console.error('[!] Failed to initialize editor:', error.message);
        }
    }

    configureEditor() {
        const config = {
            // =========================
            // THEME + MODE (CORE)
            // =========================
            theme: 'ace/theme/tomorrow_night_eighties',
            mode: 'ace/mode/javascript',

            // =========================
            // VISUAL EXPERIENCE
            // =========================
            fontSize: 15,
            lineHeight: 1.5,
            showPrintMargin: false,
            showGutter: true,
            highlightActiveLine: true,
            highlightSelectedWord: true,
            wrap: false,
            scrollPastEnd: 0.5,

            // Cursor / feel
            cursorStyle: 'smooth',
            cursorBlinking: true,

            // =========================
            // INDENTATION / FORMAT FEEL
            // =========================
            tabSize: 4,
            useSoftTabs: true,
            behavioursEnabled: true,
            autoScrollEditorIntoView: true,
            displayIndentGuides: true,

            // =========================
            // AUTOCOMPLETE SYSTEM
            // =========================
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            liveAutocompletionDelay: 200,
            liveAutocompletionThreshold: 1,

            // =========================
            // ADVANCED EDITING FEATURES
            // =========================
            selectionStyle: 'text',
            useTextareaForIME: true,
            copyWithEmptySelection: true,

            // =========================
            // PERFORMANCE
            // =========================
            minLines: 1,
            maxLines: Infinity,

            // =========================
            // FIND / REPLACE
            // =========================
            animatedScroll: true,
            scrollSpeed: 0.05
        };
        
        this.editor.setOptions(config);
    }

    setupListeners() {
        // Update cursor position in status bar
        if (this.editor && this.editor.selection) {
            this.editor.selection.on('changeCursor', () => {
                this.updateCursorPosition();
            });
        }
    }

    updateCursorPosition() {
        try {
            const pos = this.editor.getCursorPosition();
            const line = pos.row + 1;
            const col = pos.column + 1;
            const statusEl = document.getElementById('cursor-pos');
            
            if (statusEl) {
                statusEl.textContent = `Ln ${line}, Col ${col}`;
            }
        } catch (error) {
            console.warn('Could not update cursor position:', error.message);
        }
    }

    getEditor() {
        return this.editor;
    }
}

// Initialize on document ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.editorManager = new EditorManager();
    });
} else {
    window.editorManager = new EditorManager();
}
