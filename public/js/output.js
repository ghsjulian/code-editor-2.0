 const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("[+] OUTPUT CLIENT CONNECTED!");
});

socket.on("run-output", data => {
    console.log("Running Code : ", data);
});
