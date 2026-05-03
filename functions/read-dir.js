const path = require("path");
const fs = require("fs").promises;

const readDir = async (currentPath) => {
    const dirPath = path.resolve(currentPath);
    const stats = await fs.stat(dirPath);

    if (!stats.isDirectory()) {
        return {
            name: path.basename(dirPath),
            path: dirPath,
            type: "file"
        };
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    entries.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
    });

    const children = await Promise.all(
        entries.map(async (entry) => {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                return await readDir(fullPath);
            }

            return {
                name: entry.name,
                path: fullPath,
                type: "file"
            };
        })
    );

    return {
        name: path.basename(dirPath),
        path: dirPath,
        type: "folder",
        open: false,
        children
    };
};

module.exports = readDir;