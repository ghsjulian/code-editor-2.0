/**
 * output.js - Code Output Handler
 * Displays execution results in iframe
 */

class OutputManager {
    constructor() {
        this.iframe = document.getElementById('output-result');
        this.outputContainer = document.getElementById('ghs-code-output');
        this.closeBtn = document.getElementById('close-output');
        
        if (window.socketClient) {
            this.init();
        }
    }

    init() {
        this.setupSocketListeners();
        this.setupUIControls();
        console.log('[+] Output manager initialized');
    }

    setupSocketListeners() {
        if (window.socketClient) {
            window.socketClient.socket.on('run-output', (data) => {
                this.displayOutput(data);
            });
        }
    }

    setupUIControls() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.closeOutput();
            });
        }
    }

    displayOutput(data) {
        try {
            if (!this.iframe) {
                console.warn('Output iframe not found');
                return;
            }

            // Show container
            if (this.outputContainer) {
                this.outputContainer.style.display = 'block';
            }

            // Write to iframe
            const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            
            if (typeof data === 'string') {
                iframeDoc.open();
                iframeDoc.write(data);
                iframeDoc.close();
            } else if (typeof data === 'object') {
                const html = JSON.stringify(data, null, 2);
                iframeDoc.open();
                iframeDoc.write(`<pre>${html}</pre>`);
                iframeDoc.close();
            }
        } catch (error) {
            console.error('[!] Failed to display output:', error.message);
        }
    }

    closeOutput() {
        if (this.outputContainer) {
            this.outputContainer.style.display = 'none';
        }
    }

    clearOutput() {
        if (this.iframe && this.iframe.contentDocument) {
            this.iframe.contentDocument.body.innerHTML = '';
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.outputManager = new OutputManager();
    });
} else {
    window.outputManager = new OutputManager();
}
