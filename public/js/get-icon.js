const getIcon = (filename = "") => {
    if (typeof filename !== "string" || !filename.trim()) {
        return '<img id="icon" src="icons/file.png">';
    }
    const cleanName = filename.trim();
    const lastDotIndex = cleanName.lastIndexOf(".");
    let extension = "";
    // Extract extension safely
    if (lastDotIndex > 0 && lastDotIndex < cleanName.length - 1) {
        extension = cleanName.slice(lastDotIndex + 1).toLowerCase();
    }
    // File type mapping
    const iconMap = {
        // Web
        html: "html",
        htm: "html",
        css: "css",
        scss: "scss",
        sass: "sass",
        less: "less",
        js: "js",
        mjs: "javascript",
        cjs: "javascript",
        jsx: "js",
        ts: "ts",
        tsx: "tsx",

        // Backend
        json: "json",
        xml: "xml",
        yaml: "yaml",
        yml: "yaml",
        toml: "config",
        env: "config",

        // Programming
        py: "py",
        java: "java",
        c: "c",
        cpp: "cpp",
        cxx: "cpp",
        h: "h",
        cs: "cs",
        php: "php",
        rb: "rb",
        go: "go",
        rs: "rs",
        swift: "swift",
        kt: "kt",
        dart: "dart",

        // Shell
        sh: "sh",
        bash: "shell",
        zsh: "zsh",
        fish: "shell",
        bat: "bat",
        cmd: "terminal",
        ps1: "powershell",

        // Documents
        txt: "txt",
        md: "md",
        pdf: "pdf",
        doc: "doc",
        docx: "docx",
        xls: "xls",
        xlsx: "xlsx",
        csv: "csv",
        ppt: "ppt",
        pptx: "pptx",

        // Images
        png: "img",
        jpg: "img",
        jpeg: "img",
        gif: "img",
        svg: "img",
        webp: "img",
        ico: "img",
        bmp: "img",
        tif: "img",
        tiff: "img",

        // Audio
        mp3: "mp3",
        wav: "wav",
        flac: "flac",
        aac: "aac",
        ogg: "oog",
        m4a: "m4a",

        // Video
        mp4: "mp4",
        mkv: "mkv",
        avi: "avi",
        mov: "mov",
        webm: "webm",
        flv: "flv",
        wmv: "wmv",

        // Archives
        zip: "zip",
        rar: "zip",
        "7z": "zip",
        tar: "zip",
        gz: "zip",
        bz2: "zip",
        xz: "zip",

        // Database
        sql: "sql",
        sqlite: "database",
        db: "db",
        mongo: "mongo",

        // Misc
        gitignore: "git",
        dockerfile: "docker",
        lock: "lock",
        log: "log"
    };
    // Special filenames without standard extensions
    const specialFiles = {
        "package.json": "nodejs",
        "package-lock.json": "npm",
        "yarn.lock": "yarn",
        "pnpm-lock.yaml": "pnpm",
        dockerfile: "docker",
        ".gitignore": "git",
        ".gitattributes": "git",
        ".env": "config",
        readme: "markdown",
        "readme.md": "markdown",
        license: "text",
        makefile: "terminal"
    };

    const lowerName = cleanName.toLowerCase();

    let iconName = "file";

    if (specialFiles[lowerName]) {
        iconName = specialFiles[lowerName];
    } else if (extension && iconMap[extension]) {
        iconName = iconMap[extension];
    }

    return `<img id="icon" src="icons/${iconName}.png" class="file-icon">`;
};

export default getIcon;
