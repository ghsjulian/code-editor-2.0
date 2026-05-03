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

// Initialize cache variable
var cache = null;

const renderFiles = async (treeContainer, path) => {
    try {
        const request = await fetch("http://localhost:3000/files", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const response = await request.json();
        
        // Recursive search to find nested folders (Crucial fix for deep nesting)
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

// Create tree node
function createTreeNode(node, parentElement) {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree-node";

    if (node.type === "folder") {
        // Folder  
        const header = document.createElement("div");
        header.className = `node-header ${node.open ? "expanded" : ""}`;

        header.innerHTML = `  
            <span class="toggle-icon">${node.open ? "▼" : "▶"}</span>  
            <span class="folder-icon">  
            ${node.open ? '<img id="icon" src="icons/folder-open.png" alt="folder" />' : '<img id="icon" src="icons/folder.png" alt="folder" />'}  
            </span>  
            <span id="${node.path}" type="${node.type}" class="node-name">${node.name}</span>  
        `;

        const content = document.createElement("div");
        content.className = "node-content";

        // Click to toggle folder  
        header.addEventListener("click", () => {
            const isExpanded = header.classList.contains("expanded");
            header.classList.toggle("expanded");
            const img = header.querySelector("#icon");
            img.src = isExpanded ? "icons/folder.png" : "icons/folder-open.png";
            const icon = header.querySelector(".toggle-icon");
            icon.textContent = isExpanded ? "▶" : "▼";
        });

        // Mobile touch & Desktop right-click
        let pressTimer;
        header.addEventListener("touchstart", e => {
            pressTimer = setTimeout(() => {
                showContextMenu(e, node.path, header);
            }, 600);
        });
        header.addEventListener("touchmove", () => clearTimeout(pressTimer));
        header.addEventListener("touchend", () => clearTimeout(pressTimer));
        
        header.addEventListener("contextmenu", e => {
            e.preventDefault();
            showContextMenu(e, node.path, header);
        });

        nodeDiv.appendChild(header);
        nodeDiv.appendChild(content);

        // Render children recursively  
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                createTreeNode(child, content);
            });
        }
    } else {
        // File  
        const fileDiv = document.createElement("div");
        fileDiv.className = "file-item";
        const icon = getIcon(node.name);
        fileDiv.innerHTML = `  
            <span class="file-icon">${icon}</span>  
            <span id="${node.path}" class="node-name">${node.name}</span>  
        `;

        // Mobile touch & Desktop right-click
        let pressTimer;
        fileDiv.addEventListener("touchstart", e => {
            pressTimer = setTimeout(() => {
                showContextMenu(e, node.path, fileDiv);
            }, 600);
        });
        fileDiv.addEventListener("touchmove", () => clearTimeout(pressTimer));
        fileDiv.addEventListener("touchend", () => clearTimeout(pressTimer));

        fileDiv.addEventListener("contextmenu", e => {
            e.preventDefault();
            showContextMenu(e, node.path, fileDiv);
        });

        nodeDiv.appendChild(fileDiv);
    }

    parentElement.appendChild(nodeDiv);
}

const openFileInput = (target, path) => {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree-node";

    const fileDiv = document.createElement("div");
    fileDiv.className = "file-item";
    fileDiv.innerHTML = `
        <span class="file-icon">📑</span> 
        <span id="${path}/" class="node-name"></span> 
        <input type="text" id="filename" placeholder="Enter file name" enterkeyhint="go" autocomplete="off" />
    `;

    const input = fileDiv.querySelector("input");

    input.addEventListener("input", () => {
        const val = input.value.trim();
        fileDiv.querySelector(".file-icon").innerHTML = getIcon(val);
    });

    input.addEventListener("keydown", e => {
        if (e.key !== "Enter") return;

        const val = input.value.trim();
        if (!val) return;

        const files = target.parentElement.querySelectorAll(
            ".node-content .node-name"
        );

        const fileExists = [...files].some(
            file =>
                file !== fileDiv.querySelector(".node-name") &&
                file.textContent.trim() === val
        );

        if (fileExists) {
            nodeDiv.remove();
            alert(val + " File Exist !");
            return;
        }

        const nodeName = fileDiv.querySelector(".node-name");
        nodeName.textContent = val;
        nodeName.setAttribute("id", path + "/" + val);

        input.remove();
        createFile(path + "/" + val);
    });

    let pressTimer;
    fileDiv.addEventListener("touchstart", e => {
        pressTimer = setTimeout(() => {
            const fileName = input.value.trim() || fileDiv.querySelector(".node-name").textContent.trim();
            if (fileName) {
                showContextMenu(e, path + "/" + fileName, fileDiv);
            }
        }, 600);
    });
    fileDiv.addEventListener("touchmove", () => clearTimeout(pressTimer));
    fileDiv.addEventListener("touchend", () => clearTimeout(pressTimer));
    
    fileDiv.addEventListener("contextmenu", e => {
        e.preventDefault();
        const fileName = input.value.trim() || fileDiv.querySelector(".node-name").textContent.trim();
        if (fileName) {
            showContextMenu(e, path + "/" + fileName, fileDiv);
        }
    });

    nodeDiv.appendChild(fileDiv);
    target.nextSibling.appendChild(nodeDiv);
    input.focus();

    input.addEventListener("blur", () => {
        if (!input.value.trim()) {
            nodeDiv.remove();
        }
    });
};

const openFolderInput = (target, path) => {
    let isExpanded = true;
    
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree-node";

    const header = document.createElement("div");
    const node = document.createElement("div");

    header.className = "node-header expanded";
    node.className = "node-content";

    header.innerHTML = `  
        <span class="toggle-icon">${isExpanded ? "▼" : "▶"}</span>  
        <span class="folder-icon">  
            ${
                isExpanded
                    ? '<img id="icon" src="icons/folder-open.png" alt="folder" />'
                    : '<img id="icon" src="icons/folder.png" alt="folder" />'
            }  
        </span>  
        <span class="node-name"></span>  
        <input type="text" id="filename" placeholder="Enter file name" enterkeyhint="go" autocomplete="off"/>  
    `;

    header.addEventListener("click", () => {
        const expanded = header.classList.contains("expanded");
        header.classList.toggle("expanded");
        const img = header.querySelector("#icon");
        img.src = expanded ? "icons/folder.png" : "icons/folder-open.png";
        const icon = header.querySelector(".toggle-icon");
        icon.textContent = expanded ? "▶" : "▼";
    });

    const input = header.querySelector("input");

    input.addEventListener("keydown", e => {
        if (e.key !== "Enter") return;

        const val = input.value.trim();
        if (!val) return;

        const folders = target.parentElement.querySelectorAll(
            '.node-content .node-name[type="folder"]'
        );

        for (const folder of folders) {
            if (folder.textContent.trim().toLowerCase() === val.toLowerCase()) {
                nodeDiv.remove();
                alert(`${val} Folder Exist !`);
                return;
            }
        }

        const nodeName = header.querySelector(".node-name");
        nodeName.textContent = val;
        nodeName.setAttribute("type", "folder");
        nodeName.setAttribute("id", `${path}/${val}`);

        input.remove();
        createFolder(`${path}/${val}/`);
    });

    let pressTimer;
    header.addEventListener("touchstart", e => {
        pressTimer = setTimeout(() => {
            const folderName = input.value.trim() || header.querySelector(".node-name").textContent.trim();
            showContextMenu(e, `${path}/${folderName}`, header);
        }, 600);
    });
    header.addEventListener("touchmove", () => clearTimeout(pressTimer));
    header.addEventListener("touchend", () => clearTimeout(pressTimer));

    header.addEventListener("contextmenu", e => {
        e.preventDefault();
        const folderName = input.value.trim() || header.querySelector(".node-name").textContent.trim();
        showContextMenu(e, `${path}/${folderName}`, header);
    });

    node.innerHTML = `<div class="tree-node"></div>`;

    nodeDiv.appendChild(header);
    nodeDiv.appendChild(node);
    target.nextSibling.appendChild(nodeDiv);

    input.addEventListener("blur", () => {
        if (input.value.trim()) return;
        nodeDiv.remove();
    });

    input.focus();
};

const appendCopyFile = (parent, data) => {
    const currentPath = parent.querySelector(".node-name").getAttribute("id");
    
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree-node";
    
    const fileDiv = document.createElement("div");
    fileDiv.className = "file-item";
    const icon = getIcon(data.name);
    
    fileDiv.innerHTML = `
        <span class="file-icon">${icon}</span> 
        <span id="${currentPath}/${data.name}" class="node-name">${data.name}</span>
    `;

    const files = parent.parentElement.querySelectorAll(".node-content .node-name");
    const fileExists = [...files].some(
        file => file !== fileDiv.querySelector(".node-name") && file.textContent.trim() === data.name
    );

    if (fileExists) {
        nodeDiv.remove();
        alert(data.name + " File Exist !");
        return;
    }

    let pressTimer;
    fileDiv.addEventListener("touchstart", e => {
        pressTimer = setTimeout(() => {
            const fileName = data.name || fileDiv.querySelector(".node-name").textContent.trim();
            if (fileName) showContextMenu(e, currentPath + "/" + data.name, fileDiv);
        }, 600);
    });
    fileDiv.addEventListener("touchmove", () => clearTimeout(pressTimer));
    fileDiv.addEventListener("touchend", () => clearTimeout(pressTimer));
    
    fileDiv.addEventListener("contextmenu", e => {
        e.preventDefault();
        const fileName = data.name || fileDiv.querySelector(".node-name").textContent.trim();
        if (fileName) showContextMenu(e, currentPath + "/" + data.name, fileDiv);
    });

    nodeDiv.appendChild(fileDiv);
    parent.nextSibling.appendChild(nodeDiv);
};

function showContextMenu(e, path, parent) {
    const menu = document.getElementById("context-menu");
    menu.style.display = "block";
    
    // Slight offset to prevent mobile ghost-clicks auto-triggering buttons
    menu.style.left = (e.touches ? e.touches[0].pageX : e.pageX) + 10 + "px";
    menu.style.top = (e.touches ? e.touches[0].pageY : e.pageY) + 10 + "px";

    menu.onclick = async event => {
        const target = event.target;
        const type = target.getAttribute("id");
        
        if (!type) return; 

        if (type === "new-file") {
            openFileInput(parent, path);
        } else if (type === "new-folder") {
            openFolderInput(parent, path);
        } else if (type === "delete") {
            let ftype = parent.querySelector(".node-name").getAttribute("type") || null;
            deleteFile(
                ftype,
                parent.querySelector(".node-name").getAttribute("id")
            );
            parent.parentElement.remove(); 
        } else if (type === "copy") {
            let copyPath = parent.querySelector(".node-name").getAttribute("id");
            let name = parent.querySelector(".node-name").textContent.trim();
            cache = { element: parent, path: copyPath, name, type: "COPY" };
        } else if (type === "move") {
            let movePath = parent.querySelector(".node-name").getAttribute("id");
            let name = parent.querySelector(".node-name").textContent.trim();
            cache = { element: parent, path: movePath, name, type: "MOVE" };
        } else if (type === "rename") {
            // Functionality to be added
        } else if (type === "paste") {
            let pastePath = parent.querySelector(".node-name").getAttribute("id");
            let targetType = parent.querySelector(".node-name").getAttribute("type") || null;
            
            if (!cache) return;
            
            if (targetType !== "folder") {
                alert("Please paste inside a folder!");
                return;
            }

            // Clean payload to prevent Socket.io circular JSON crash
            const payload = { path: cache.path, name: cache.name, type: cache.type };
            let sourceIsFolder = cache.element.querySelector(".node-name").getAttribute("type") === "folder";

            if (cache.type === "COPY") {
                if (sourceIsFolder) {
                    await copyFolder({ source: payload, destination: pastePath });
                    await renderFiles(parent.nextSibling, pastePath);
                } else {
                    await copyFile({ source: payload.path, destination: pastePath });
                    appendCopyFile(parent, payload);
                }
            } else if (cache.type === "MOVE") {
                if (sourceIsFolder) {
                    await moveFolder({ source: payload, destination: pastePath });
                    await renderFiles(parent.nextSibling, pastePath);
                } else {
                    await moveFile({ source: payload, destination: pastePath });
                    appendCopyFile(parent, payload); 
                }
                cache.element.parentElement.remove(); // Clean up old location
            }
            cache = null;
        }
        menu.style.display = "none"; 
    };
}

// Initialize the tree
function initTree() {
    const treeContainer = document.getElementById("fileTree");
    treeContainer.innerHTML = "";

    if (typeof fileStructure !== 'undefined') {
        fileStructure.forEach(node => {
            createTreeNode(node, treeContainer);
        });
    }
}

// Ensure context menu closes when clicking elsewhere
document.addEventListener("click", (e) => {
    const menu = document.getElementById("context-menu");
    if (menu.style.display === "block" && !menu.contains(e.target)) {
        menu.style.display = "none";
    }
});

// Load the tree when page is ready
window.onload = () => {
    const treeContainer = document.getElementById("fileTree");
    getFiles(treeContainer);
};