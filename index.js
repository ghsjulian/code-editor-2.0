const fs = require('fs').promises; const path = require('path');

async function readDirectoryTree(dirPath, isRoot = true) { 

const stats = await fs.stat(dirPath);

if (!stats.isDirectory()) {
    return {
        name: path.basename(dirPath),
        path: path.resolve(dirPath),
        type: 'file'
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
            return await readDirectoryTree(fullPath, false);
        }

        return {
            name: entry.name,
            path: path.resolve(fullPath),
            type: 'file'
        };
    })
);

return {
    name: path.basename(dirPath),
    path: path.resolve(dirPath),
    type: 'folder',
    open: isRoot,
    children
};

}

async function generateFileStructure(projectPath, outputFile = 'index.json') { try { const fileStructure = [await readDirectoryTree(projectPath)];

await fs.writeFile(
        outputFile,
        JSON.stringify(fileStructure, null, 2),
        'utf8'
    );

    console.log(`File structure saved successfully to ${outputFile}`);
} catch (error) {
    console.error('Error:', error.message);
}

}

generateFileStructure('./');
