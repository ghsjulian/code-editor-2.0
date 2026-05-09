require("dotenv").config();
const path = require("node:path");
const express = require("express");
const { createServer } = require("node:http");
const cors = require("cors");
const createSocket = require("./socket/socket");
const readDir = require("./functions/read-dir");

const app = express();
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);
const io = require("socket.io")(httpServer);
const targetPath = process.argv[2] || "./projects";

app.use(
    cors({
        origin: ["http://localhost:8158", "http://localhost:3000"],
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        maxAge: 86400
    })
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/files", async (req, res) => {
    try {
        const resolvedPath = path.resolve(targetPath);
        const fileStructure = await readDir(resolvedPath);
        fileStructure.open = true;
        return res.status(200).json(fileStructure);
    } catch (error) {
        console.log("\n[!] Error in reading directory - ", error.message);
        process.exit(1);
        return res.status(404).json({
            status: false,
            success: false,
            message: "No files found"
        });
    }
});

// Route For Code Output
app.get("/run-code", async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "output.html"));
});

createSocket(httpServer);
httpServer.listen(PORT, () => {
    console.clear();
    console.log("\n+--------------------------------------+");
    console.log(`\n[+] Code Server Started`);
    console.log(`\n[+] Open http://localhost:${PORT}`);
    console.log("\n[+] Developed By : Ghs Julian");
    console.log("\n+--------------------------------------+\n\n");
});
