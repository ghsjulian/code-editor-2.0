export const getAceMode = filename => {
    if (typeof filename !== "string") return "ace/mode/text";
    const ext = filename.includes(".")
        ? filename.split(".").pop().toLowerCase()
        : "";
    const modeMap = {
        // Web
        html: "ace/mode/html",
        htm: "ace/mode/html",
        css: "ace/mode/css",
        scss: "ace/mode/scss",
        sass: "ace/mode/sass",
        less: "ace/mode/less",
        js: "ace/mode/javascript",
        mjs: "ace/mode/javascript",
        cjs: "ace/mode/javascript",
        ts: "ace/mode/typescript",
        jsx: "ace/mode/jsx",
        tsx: "ace/mode/tsx",
        json: "ace/mode/json",
        // Backend / scripting
        php: "ace/mode/php",
        py: "ace/mode/python",
        rb: "ace/mode/ruby",
        java: "ace/mode/java",
        c: "ace/mode/c_cpp",
        cpp: "ace/mode/c_cpp",
        h: "ace/mode/c_cpp",
        cs: "ace/mode/csharp",
        go: "ace/mode/golang",
        rs: "ace/mode/rust",
        swift: "ace/mode/swift",
        kt: "ace/mode/kotlin",
        // Shell / config
        sh: "ace/mode/sh",
        bash: "ace/mode/sh",
        zsh: "ace/mode/sh",
        yaml: "ace/mode/yaml",
        yml: "ace/mode/yaml",
        xml: "ace/mode/xml",
        env: "ace/mode/dotenv",
        ini: "ace/mode/ini",
        toml: "ace/mode/toml",
        // Database
        sql: "ace/mode/sql",
        // Markup / docs
        md: "ace/mode/markdown",
        markdown: "ace/mode/markdown",
        txt: "ace/mode/text",
        // Others
        dockerfile: "ace/mode/dockerfile",
        makefile: "ace/mode/makefile"
    };
    return modeMap[ext] || "ace/mode/text";
};
