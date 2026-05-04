import getIcon from "./get-icon.js";
import {
    socket,
    deleteFile,
    createFile,
    createFolder,
    copyFile,
    copyFolder,
    moveFile,
    moveFolder
} from "./client-socket.js";

var cache = null;
var paste = null;
const pasteElem = document.querySelector("#paste");

const renderFiles = async (treeContainer, path) => {
    try {
        const request = await fetch("http://localhost:3000/files", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const response = await request.json();

        const findNode = (node, targetPath) => {
            if (node.path === targetPath) return node;
            if (node.children) {
                for (let child of node.children) {
                    const found = findNode(child, targetPath);
                    if (found) return found;
                }
            }
            return null;
        };

        const targetNode = findNode(response, path);
        treeContainer.innerHTML = "";
        if (targetNode && targetNode.children) {
            targetNode.children.forEach(child => {
                createTreeNode(child, treeContainer);
            });
        }
    } catch (error) {
        console.log("Error fetching files - ", error.message);
    }
};

const getFiles = async treeContainer => {
    try {
        const request = await fetch("http://localhost:3000/files", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const response = await request.json();
        treeContainer.innerHTML = "";
        [response].forEach(node => {
            createTreeNode(node, treeContainer);
        });
    } catch (error) {
        console.log("Error fetching files - ", error.message);
    }
};

function createTreeNode(node, parentElement) {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree-node";

    if (node.type === "folder") {
        const header = document.createElement("div");
        header.className = `node-header ${node.open ? "expanded" : ""}`;
        header.innerHTML = `  
            <span class="toggle-icon">${node.open ? "" : ""}</span>  
            <span class="folder-icon">  
            ${node.open ? '<img id="icon" src="icons/folder-open.png" alt="folder" />' : '<img id="icon" src="icons/folder.png" alt="folder" />'}  
            </span>  
            <span id="${node.path}" type="${node.type}" class="node-name">${node.name}</span>  
        `;

        const content = document.createElement("div");
        content.className = "node-content";

        header.addEventListener("click", () => {
            const isExpanded = header.classList.contains("expanded");
            header.classList.toggle("expanded");
            const img = header.querySelector("#icon");
            img.src = isExpanded ? "icons/folder.png" : "icons/folder-open.png";
            const icon = header.querySelector(".toggle-icon");
            icon.textContent = isExpanded ? "" : "";
        });

        setupContextMenuEvents(header, node.path);
        nodeDiv.appendChild(header);
        nodeDiv.appendChild(content);

        if (node.children) {
            node.children.forEach(child => createTreeNode(child, content));
        }
    } else {
        const fileDiv = document.createElement("div");
        fileDiv.className = "file-item";
        fileDiv.innerHTML = `  
            <span class="file-icon">${getIcon(node.name)}</span>  
            <span id="${node.path}" class="node-name">${node.name}</span>  
        `;
        setupContextMenuEvents(fileDiv, node.path);
        nodeDiv.appendChild(fileDiv);
    }
    parentElement.appendChild(nodeDiv);
}

function setupContextMenuEvents(element, path) {
    let pressTimer;
    element.addEventListener("touchstart", e => {
        pressTimer = setTimeout(() => showContextMenu(e, path, element), 600);
    });
    element.addEventListener("touchmove", () => clearTimeout(pressTimer));
    element.addEventListener("touchend", () => clearTimeout(pressTimer));
    element.addEventListener("contextmenu", e => {
        e.preventDefault();
        showContextMenu(e, path, element);
    });
}

const openFileInput = (target, path) => {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree-node";
    const fileDiv = document.createElement("div");
    fileDiv.className = "file-item";
    fileDiv.innerHTML = `
        <span class="file-icon">📑</span> 
        <span class="node-name"></span> 
        <input type="text" id="filename" placeholder="Enter file name" enterkeyhint="go" autocomplete="off" />
    `;
    const input = fileDiv.querySelector("input");
    input.addEventListener("input", e => {
        fileDiv.querySelector(".file-icon").innerHTML = getIcon(
            input.value.trim()
        );
    });
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            const val = input.value.trim();
            if (!val) return;
            createFile(path + "/" + val);
            input.remove();
            getFiles(document.getElementById("fileTree")); // Refresh full tree
        }
    });
    nodeDiv.appendChild(fileDiv);
    target.nextSibling.appendChild(nodeDiv);
    input.focus();
};

const openFolderInput = (target, path) => {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree-node";
    const header = document.createElement("div");
    header.className = "node-header expanded";
    header.innerHTML = `
        <span class="toggle-icon"></span>
        <span class="folder-icon">
       <img id="icon" src="icons/folder.png" alt="folder" />
        </span>
        <input type="text" id="filename" placeholder="Folder name" enterkeyhint="go" autocomplete="off"/>
    `;
    const input = header.querySelector("input");
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            const val = input.value.trim();
            if (!val) return;
            createFolder(path + "/" + val + "/");
            input.remove();
            getFiles(document.getElementById("fileTree"));
        }
    });
    nodeDiv.appendChild(header);
    target.nextSibling.appendChild(nodeDiv);
    input.focus();
};

function showContextMenu(e, path, parent) {
    const menu = document.getElementById("context-menu");
    menu.style.display = "block";
    const clickX = e.touches ? e.touches[0].pageX : e.pageX;
    const clickY = e.touches ? e.touches[0].pageY : e.pageY;
    menu.style.left = clickX - 90 + "px";
    menu.style.top = clickY - 90 + "px";

    menu.onclick = async event => {
        const actionType = event.target.id;
        if (!actionType) return;

        const nodeElem = parent.querySelector(".node-name");
        const currentPath = nodeElem.id;
        const currentName = nodeElem.textContent.trim();
        const isFolder = nodeElem.getAttribute("type") === "folder";

        if (actionType === "new-file") openFileInput(parent, path);
        else if (actionType === "new-folder") openFolderInput(parent, path);
        else if (actionType === "delete") {
            deleteFile(isFolder ? "folder" : "file", currentPath);
            parent.parentElement.remove();
        } else if (actionType === "copy" || actionType === "move") {
            cache = {
                path: currentPath,
                name: currentName,
                isFolder,
                type: actionType.toUpperCase(),
                element: parent
            };
            paste = {
                path: currentPath,
                name: currentName,
                isFolder,
                type: actionType.toUpperCase(),
                element: parent,
                status: true
            };
            pasteElem.style.display = "flex";
            pasteElem.innerHTML = `<img
                                src="icons/files.png"
                                id="menu-icon"
                                alt="New Folder"
                                title="New Folder"
                            /><span>Paste (${paste.type})</span>
                            `;
        } else if (actionType === "paste") {
            const destFolderPath = currentPath; // The folder we are pasting INTO
            if (!cache || !isFolder) return;

            // FIX: Destination must include the original filename for fs.copyFileSync to work
            const fullDestPath = `${destFolderPath}/${cache.name}`;
            const data = { source: cache.path, destination: fullDestPath };

            if (cache.type === "COPY") {
                if (cache.isFolder)
                    copyFolder({
                        source: cache.path,
                        destination: destFolderPath
                    });
                else copyFile(data);
            } else {
                if (cache.isFolder)
                    moveFolder({
                        source: cache.path,
                        destination: destFolderPath
                    });
                else moveFile(data);
                cache.element.parentElement.remove();
            }

            setTimeout(
                () => renderFiles(parent.nextSibling, destFolderPath),
                300
            );
            cache = null;
            paste = null;
            pasteElem.style.display = "none";
            pasteElem.textContent = `Paste`;
        }
        menu.style.display = "none";
    };
}

document.addEventListener("click", e => {
    const menu = document.getElementById("context-menu");
    if (menu && !menu.contains(e.target)) menu.style.display = "none";
});

window.onload = () => getFiles(document.getElementById("fileTree"));
