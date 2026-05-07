const { Server } = require("socket.io");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const createSocket = httpServer => {
    const io = new Server(httpServer, {
        cors: { origin: "*" }
    });

    io.on("connection", socket => {
        console.log(`\n[+] New connection : ${socket.id}\n`);

        // FIX: Use 'sh' if 'bash' fails, and handle spawn errors
        // In Termux, sometimes 'bash' needs a full path or just 'sh'
        const shell = spawn("sh");

        // Check if spawn actually worked
        shell.on("error", err => {
            console.error("Failed to start shell:", err);
            socket.emit(
                "terminal:output",
                "Error: Could not start shell process.\n"
            );
        });

        shell.stdout.on("data", data => {
            socket.emit("terminal:output", data.toString() || "");
        });

        shell.stderr.on("data", data => {
            socket.emit("terminal:output", data.toString());
        });

        // Save File ---
        socket.on("save-file", async file => {
            try {
                const { path: path, content } = file;
                // Check file exists
                console.log(file)
                if (!(await fs.existsSync(path))) {
                    console.log("File does not exist");
                    return;
                }
                // Replace old content with new content
                await fs.writeFileSync(path, content, "utf8");
                console.log("\n[+] File saved successfully\n");
            } catch (error) {
                console.log("Error saving file - ", error.message);
            }
        });
        // Creating New File ---
        socket.on("create-file", async filepath => {
            try {
                if (await fs.existsSync(path.join(filepath))) {
                    console.log("File Exist");
                    return;
                }
                await fs.writeFileSync(path.join(filepath), "", "utf8");
                console.log("\n[+] File created successfully\n");
            } catch (error) {
                console.log("Error creating file - ", error.message);
            }
        });
        // Creating New Folder ---
        socket.on("create-folder", filepath => {
            try {
                const fullPath = path.resolve(filepath);
                // Check if path already exists
                if (fs.existsSync(fullPath)) {
                    const stats = fs.statSync(fullPath);
                    if (stats.isDirectory()) {
                        console.log(`Folder already exists: ${fullPath}`);
                        return;
                    }
                }
                // Create the folder
                fs.mkdirSync(fullPath, { recursive: true });
                console.log(`\n[+] Folder created successfully\n`);
            } catch (error) {
                console.error("Error creating folder:", error.message);
            }
        });
        // Deleting File ---
        socket.on("delete-file", filepath => {
            try {
                const fullPath = path.resolve(filepath);
                if (!fs.existsSync(fullPath)) {
                    console.log(`File not found: ${fullPath}`);
                    return;
                }
                const stats = fs.statSync(fullPath);
                if (!stats.isFile()) {
                    console.log(`Not a file: ${fullPath}`);
                    return;
                }
                fs.unlinkSync(fullPath);
                console.log(`\n[+] File deleted successfully\n`);
            } catch (error) {
                console.error(`Error deleting file: ${error.message}`);
            }
        });
        // Deletiing Folder ----
        socket.on("delete-folder", folderPath => {
            try {
                const fullPath = path.resolve(folderPath);
                if (!fs.existsSync(fullPath)) {
                    console.log(`Folder not found: ${fullPath}`);
                    return;
                }
                const stats = fs.statSync(fullPath);
                if (!stats.isDirectory()) {
                    console.log(`Not a folder: ${fullPath}`);
                    return;
                }
                fs.rmSync(fullPath, { recursive: true, force: true });
                console.log(`\n[+] Folder deleted successfully\n`);
            } catch (error) {
                console.error(`Error deleting folder: ${error.message}`);
            }
        });
        // Copy File ----
        socket.on("copy-file", data => {
            try {
                const { source, destination } = data;
                const srcPath = path.resolve(source);
                const destPath = path.resolve(destination);
                if (!fs.existsSync(srcPath)) {
                    console.log(`Source file not found: ${srcPath}`);
                    return;
                }
                const stats = fs.statSync(srcPath);
                if (!stats.isFile()) {
                    console.log(`Not a file: ${srcPath}`);
                    return;
                }
                fs.copyFileSync(srcPath, destPath);
                console.log(`\n[+] File copied successfully\n`);
            } catch (error) {
                console.error(`Error copying file: ${error.message}`);
            }
        });
        // Copy Folder ----
        socket.on("copy-folder", data => {
            try {
                const { source, destination } = data;
                const srcPath = path.resolve(source);
                const destPath = path.resolve(destination);
                if (!fs.existsSync(srcPath)) {
                    console.log(`Source folder not found: ${srcPath}`);
                    return;
                }
                const stats = fs.statSync(srcPath);
                if (!stats.isDirectory()) {
                    console.log(`Source is not a folder: ${srcPath}`);
                    return;
                }
                const folderName = path.basename(srcPath);
                const finalDestPath = path.join(destPath, folderName);
                // Prevent copying into itself
                if (finalDestPath.startsWith(srcPath + path.sep)) {
                    console.log(
                        `Cannot copy a folder into itself: ${finalDestPath}`
                    );
                    return;
                }
                fs.cpSync(srcPath, finalDestPath, {
                    recursive: true,
                    force: true,
                    errorOnExist: false
                });
                console.log(`\n[+] Folder copied successfully\n`);
            } catch (error) {
                console.error(`Error copying folder: ${error.message}`);
            }
        });
        // Move Folder
        socket.on("move-folder", async data => {
            try {
                const { source, destination } = data;
                const srcPath = path.resolve(source);
                const destPath = path.resolve(destination);
                if (!(await fs.existsSync(srcPath))) {
                    console.log(`Source folder not found: ${srcPath}`);
                    return;
                }
                const stats = await fs.statSync(srcPath);
                if (!(await stats.isDirectory())) {
                    console.log(`Source is not a folder: ${srcPath}`);
                    return;
                }
                const folderName = path.basename(srcPath);
                const finalDestPath = path.join(destPath, folderName);
                // Prevent moving a folder into itself
                if (finalDestPath.startsWith(srcPath + path.sep)) {
                    console.log(
                        `Cannot move a folder into itself: ${finalDestPath}`
                    );
                    return;
                }
                await fs.renameSync(srcPath, finalDestPath);
                console.log(`\n[+] Folder moved successfully\n`);
            } catch (error) {
                console.error(`Error moving folder: ${error.message}`);
            }
        });
        // Move File ----
        socket.on("move-file", data => {
            try {
                const { source, destination } = data;
                const srcPath = path.resolve(source);
                const destPath = path.resolve(destination);

                if (!fs.existsSync(srcPath)) {
                    console.log(`Source file not found: ${srcPath}`);
                    return;
                }
                const stats = fs.statSync(srcPath);
                if (!stats.isFile()) {
                    console.log(`Not a file: ${srcPath}`);
                    return;
                }
                fs.renameSync(srcPath, destPath);
                console.log(`\n[+] File moved successfully\n`);
            } catch (error) {
                console.error(`Error moving file: ${error.message}`);
            }
        });
        // Rename File ----
        socket.on("rename-file", data => {
            try {
                const { path: oldPath, name: newName } = data;
                if (!fs.existsSync(oldPath)) {
                    console.log(`File not found: ${oldPath}`);
                    return;
                }
                const stats = fs.statSync(oldPath);
                if (!stats.isFile()) {
                    console.log(`Not a file: ${oldPath}`);
                    return;
                }
                // Get directory of old file
                const dir = path.dirname(oldPath);
                // Create new full path
                const newPath = path.join(dir, newName);
                // Rename file
                fs.renameSync(oldPath, newPath);
                console.log(`\n[+] File renamed successfully\n`);
            } catch (err) {
                console.error("Rename error:", err);
            }
        });

        // Rename Folder ----
        socket.on("rename-folder", data => {
            try {
                const { path: oldPath, name: newName } = data;
                if (!fs.existsSync(oldPath)) {
                    console.log(`Folder not found: ${oldPath}`);
                    return;
                }
                const stats = fs.statSync(oldPath);
                if (!stats.isDirectory()) {
                    console.log(`Not a folder: ${oldPath}`);
                    return;
                }
                // Get parent directory
                const parentDir = path.dirname(oldPath);
                // New folder path
                const newPath = path.join(parentDir, newName);
                // Optional: prevent overwrite
                if (fs.existsSync(newPath)) {
                    console.log(`Target folder already exists: ${newPath}`);
                    return;
                }
                // Rename (works for folders too)
                fs.renameSync(oldPath, newPath);
                console.log(`\n[+] Folder renamed successfully\n`);
            } catch (err) {
                console.error("Rename folder error:", err);
            }
        });
        // Open File In Editor ----
        socket.on("open-file", async fpath => {
            const filePath = path.resolve(fpath);
            if (!fs.existsSync(filePath)) {
                console.log(`Source file not found: ${filePath}`);
                return;
            }
            const stats = fs.statSync(filePath);
            if (!stats.isFile()) {
                console.log(`Not a file: ${filePath}`);
                return;
            }
            const fileData = await fs.readFileSync(filePath, "utf8");
            socket.emit("file-data", fileData);
        });
        socket.on("terminal:input", input => {
            // Check if process is still alive and stream is open
            if (shell && shell.stdin && shell.stdin.writable) {
                shell.stdin.write(input);
            } else {
                console.log("Shell is not writable. State:", shell.exitCode);
                socket.emit(
                    "terminal:output",
                    "\n[System: Shell process is dead. Reconnecting...]\n"
                );
            }
        });

        socket.on("disconnect", () => {
            shell.kill();
            console.log("\n[!] Socket disconnected & shell killed\n");
        });

        // If the shell exits on its own, let the user know
        shell.on("close", code => {
            console.log(`\n[!] Shell exited with code ${code}\n`);
        });
    });
};

module.exports = createSocket;
