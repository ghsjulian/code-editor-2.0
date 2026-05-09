/**
 * settings.js - Editor Settings Panel Management
 * Handles all editor configuration and preferences
 */

class SettingsManager {
    constructor() {
        this.editor = window.editorManager?.getEditor();
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        try {
            this.setupTabSwitching();
            this.setupInputListeners();
            this.setupUIControls();
            this.generateConfig();
            console.log('[+] Settings manager initialized');
        } catch (error) {
            console.error('[!] Failed to initialize settings:', error.message);
        }
    }

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.tab-btn');
        const panels = document.querySelectorAll('.settings-panel');
        const settingsCard = document.querySelector('.settings-card');
        const closeSettings = document.querySelector('#close-settings');

        // Close button
        if (closeSettings) {
            closeSettings.onclick = () => {
                if (settingsCard) settingsCard.style.display = 'none';
            };
        }

        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active state
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                // Set active state
                tab.classList.add('active');
                const targetId = tab.getAttribute('data-target');
                const activePanel = document.getElementById(targetId);

                if (activePanel) {
                    activePanel.classList.add('active');
                }
            });
        });
    }

    setupUIControls() {
        window.openSettings = () => {
            const settingsCard = document.querySelector('.settings-card');
            if (settingsCard) settingsCard.style.display = 'flex';
        };

        window.toggleExplorer = () => {
            const explorerSidebar = document.getElementById('explorer-sidebar');
            if (explorerSidebar) {
                explorerSidebar.classList.toggle('open');
            }
        };

        window.openTerminal = () => {
            const terminalX = document.querySelector('.terminal');
            if (terminalX) {
                terminalX.classList.toggle('openTerm');
                terminalX.style.display = terminalX.classList.contains('openTerm')
                    ? 'block'
                    : 'none';
            }
        };
    }

    setupInputListeners() {
        const inputs = this.getInputElements();

        Object.values(inputs).forEach(input => {
            if (!input) return;
            const eventType = input.type === 'checkbox' ? 'change' : 'input';
            input.addEventListener(eventType, () => this.generateConfig());
        });
    }

    getInputElements() {
        return {
            fontSize: document.getElementById('fontSize'),
            tabSize: document.getElementById('tabSize'),
            wrap: document.getElementById('wrap'),
            theme: document.getElementById('theme'),
            showGutter: document.getElementById('showGutter'),
            showPrintMargin: document.getElementById('showPrintMargin'),
            highlightActiveLine: document.getElementById('highlightActiveLine'),
            keyboardHandler: document.getElementById('keyboardHandler'),
            behavioursEnabled: document.getElementById('behavioursEnabled'),
            readOnly: document.getElementById('readOnly')
        };
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem('editor-settings');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.warn('Could not load settings:', error.message);
            return {};
        }
    }

    saveSettings(config) {
        try {
            localStorage.setItem('editor-settings', JSON.stringify(config));
        } catch (error) {
            console.warn('Could not save settings:', error.message);
        }
    }

    generateConfig() {
        try {
            const inputs = this.getInputElements();

            const config = {
                theme: inputs.theme?.value || 'ace/theme/monokai',
                fontSize: parseInt(inputs.fontSize?.value, 10) || 15,
                tabSize: parseInt(inputs.tabSize?.value, 10) || 4,
                wrap: inputs.wrap?.checked || false,
                showGutter: inputs.showGutter?.checked || true,
                highlightActiveLine: inputs.highlightActiveLine?.checked || true,
                keyboardHandler: inputs.keyboardHandler?.value === 'ace'
                    ? null
                    : inputs.keyboardHandler?.value || null,
                behavioursEnabled: inputs.behavioursEnabled?.checked || true,
                readOnly: inputs.readOnly?.checked || false,
                showPrintMargin: inputs.showPrintMargin?.checked || false,
                highlightSelectedWord: true,
                scrollPastEnd: 0.5,
                cursorStyle: 'smooth',
                useSoftTabs: true,
                autoScrollEditorIntoView: true,
                displayIndentGuides: true,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                liveAutocompletionDelay: 200,
                liveAutocompletionThreshold: 1,
                selectionStyle: 'text',
                useTextareaForIME: true,
                copyWithEmptySelection: true,
                minLines: 1,
                animatedScroll: true,
                scrollSpeed: 0.05
            };

            // Apply settings to editor
            if (this.editor) {
                this.editor.setOptions(config);
            }

            // Save to localStorage
            this.saveSettings(config);

            // Update preview
            this.updateJsonPreview(config);

            return config;
        } catch (error) {
            console.error('Failed to generate config:', error.message);
        }
    }

    updateJsonPreview(config) {
        const jsonPreview = document.getElementById('jsonPreview');
        if (jsonPreview) {
            const jsonString = JSON.stringify(config, null, 4);
            jsonPreview.textContent = `// Editor Configuration\nconst config = ${jsonString};`;
        }
    }
}

// Initialize when editor is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.settingsManager = new SettingsManager();
    });
} else {
    window.settingsManager = new SettingsManager();
}
