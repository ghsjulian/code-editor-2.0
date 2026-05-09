/**
 * get-ace-mode.js - File Extension to Ace Mode Mapper
 * Maps file extensions to appropriate Ace editor syntax highlighting modes
 */

const ACE_MODE_MAP = {
    // Web
    html: 'ace/mode/html',
    htm: 'ace/mode/html',
    css: 'ace/mode/css',
    scss: 'ace/mode/scss',
    sass: 'ace/mode/sass',
    less: 'ace/mode/less',
    js: 'ace/mode/javascript',
    mjs: 'ace/mode/javascript',
    cjs: 'ace/mode/javascript',
    ts: 'ace/mode/typescript',
    jsx: 'ace/mode/jsx',
    tsx: 'ace/mode/tsx',
    json: 'ace/mode/json',
    
    // Backend / scripting
    php: 'ace/mode/php',
    py: 'ace/mode/python',
    rb: 'ace/mode/ruby',
    java: 'ace/mode/java',
    c: 'ace/mode/c_cpp',
    cpp: 'ace/mode/c_cpp',
    h: 'ace/mode/c_cpp',
    cs: 'ace/mode/csharp',
    go: 'ace/mode/golang',
    rs: 'ace/mode/rust',
    swift: 'ace/mode/swift',
    kt: 'ace/mode/kotlin',
    
    // Shell / config
    sh: 'ace/mode/sh',
    bash: 'ace/mode/sh',
    zsh: 'ace/mode/sh',
    yaml: 'ace/mode/yaml',
    yml: 'ace/mode/yaml',
    xml: 'ace/mode/xml',
    env: 'ace/mode/dotenv',
    ini: 'ace/mode/ini',
    toml: 'ace/mode/toml',
    
    // Database
    sql: 'ace/mode/sql',
    
    // Markup / docs
    md: 'ace/mode/markdown',
    markdown: 'ace/mode/markdown',
    txt: 'ace/mode/text',
    
    // Others
    dockerfile: 'ace/mode/dockerfile',
    makefile: 'ace/mode/makefile'
};

function getAceMode(filename) {
    if (typeof filename !== 'string' || !filename.trim()) {
        return 'ace/mode/text';
    }
    
    // Extract extension
    const lastDot = filename.lastIndexOf('.');
    if (lastDot <= 0 || lastDot === filename.length - 1) {
        return 'ace/mode/text';
    }
    
    const extension = filename.slice(lastDot + 1).toLowerCase();
    
    return ACE_MODE_MAP[extension] || 'ace/mode/text';
}

export default getAceMode;
