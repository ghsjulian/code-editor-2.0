export const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("\n[+] CODE SERVER CONNECTED \n");
});

export const createFile = path => {
    if (!path) return;
    socket.emit("create-file", path);
};
export const createFolder = path => {
    if (!path) return;
    socket.emit("create-folder", path);
};
export const deleteFile = (type, path) => {
    if (!path) return;
    if (type === "folder") {
        socket.emit("delete-folder", path);
    } else {
        socket.emit("delete-file", path);
    }
};
export const copyFile = data => {
    if (!data) return;
    socket.emit("copy-file", data);
};
export const copyFolder = data => {
    if (!data) return;
    socket.emit("copy-folder", data);
};
export const moveFile = async data => {
    if (!data) return;
    socket.emit("move-file", data);
    return true;
};
export const moveFolder = async data => {
    if (!data) return;
    socket.emit("move-folder", data);
    return true;
};
