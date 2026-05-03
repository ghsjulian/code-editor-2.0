const { Server } = require("socket.io");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const createSocket = httpServer => {
    const io = new Server(httpServer, {
        cors: { origin: "*" }
    });

    io.on("connection", socket => {
        console.log(`New connection: ${socket.id}`);

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
            socket.emit("terminal:output", data.toString());
        });

        shell.stderr.on("data", data => {
            socket.emit("terminal:output", data.toString());
        });

        // Creating New File ---
        socket.on("create-file", async filepath => {
            try {
                if (await fs.existsSync(path.join(filepath))) {
                    console.log("File Exist");
                    return;
                }
                await fs.writeFileSync(path.join(filepath), "", "utf8");
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
                console.log(`Folder created: ${fullPath}`);
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
                console.log(`File deleted: ${fullPath}`);
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
                console.log(`Folder deleted: ${fullPath}`);
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
                console.log(`File copied: ${srcPath} → ${destPath}`);
            } catch (error) {
                console.error(`Error copying file: ${error.message}`);
            }
        });
        // Copy Folder ----
        socket.on("copy-folder", data => {
            try {
                const { source, destination } = data;
                console.log(data);

                const srcPath = path.resolve(source.path);
                const destPath = path.resolve(destination);

                if (!fs.existsSync(srcPath)) {
                    console.log(`Source not found: ${srcPath}`);
                    return;
                }

                const stats = fs.statSync(srcPath);

                if (!stats.isDirectory()) {
                    console.log(`Source is not a folder: ${srcPath}`);
                    return;
                }

                // Prevent copying a folder into itself
                if (destPath.startsWith(srcPath + path.sep)) {
                    console.log(
                        `Cannot copy a folder into itself: ${destPath}`
                    );
                    return;
                }

                fs.cpSync(srcPath, destPath, {
                    recursive: true,
                    force: true,
                    errorOnExist: false
                });

                console.log(
                    `Folder copied successfully: ${srcPath} → ${destPath}`
                );
            } catch (error) {
                console.error(`Error copying folder: ${error.message}`);
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
                console.log(`File moved: ${srcPath} → ${destPath}`);
            } catch (error) {
                console.error(`Error moving file: ${error.message}`);
            }
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
            console.log("Socket disconnected, shell killed.");
        });

        // If the shell exits on its own, let the user know
        shell.on("close", code => {
            console.log(`Shell exited with code ${code}`);
        });
    });
};

module.exports = createSocket;
