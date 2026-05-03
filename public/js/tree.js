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
        treeContainer.innerHTML = "";
        response?.children?.forEach((child, index) => {
            if (child.path === path) {
                [child].forEach(node => {
                    createTreeNode(node, treeContainer);
                });
            }
        });
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
        treeContainer;
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
        let pressTimer;
        header.addEventListener("touchstart", e => {
            pressTimer = setTimeout(() => {
                showContextMenu(e, node.path, header);
            }, 600);
        });
        header.addEventListener("touchend", () => clearTimeout(pressTimer));
        header.addEventListener("touchmove", () => clearTimeout(pressTimer));

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

        let pressTimer;
        fileDiv.addEventListener("touchstart", e => {
            pressTimer = setTimeout(() => {
                showContextMenu(e, node.path, fileDiv);
            }, 600);
        });
        fileDiv.addEventListener("touchend", () => clearTimeout(pressTimer));
        fileDiv.addEventListener("touchmove", () => clearTimeout(pressTimer));
        nodeDiv.appendChild(fileDiv);
    }

    parentElement.appendChild(nodeDiv);
}
const openFileInput = (target, path) => {
    const fileDiv = document.createElement("div");
    fileDiv.className = "file-item";
    fileDiv.innerHTML = `
          <span class="file-icon">📑</span>
          <span id="${path}/" class="node-name"></span>
          <input
    type="text"
    id="filename"
    placeholder="Enter file name"
    enterkeyhint="go"
    autocomplete="off"
/>
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
            fileDiv.remove();
            alert(val + " File Exist !");
            return;
        }

        const nodeName = fileDiv.querySelector(".node-name");
        nodeName.textContent = val;
        nodeName.setAttribute("id", path + "/" + val);

        input.remove();

        // Send socket event for creating new file
        createFile(path + "/" + val);
    });

    let pressTimer;

    fileDiv.addEventListener("touchstart", e => {
        pressTimer = setTimeout(() => {
            const fileName =
                input.value.trim() ||
                fileDiv.querySelector(".node-name").textContent.trim();
            if (fileName) {
                showContextMenu(e, path + "/" + fileName, fileDiv);
            }
        }, 600);
    });

    fileDiv.addEventListener("touchend", () => clearTimeout(pressTimer));
    fileDiv.addEventListener("touchmove", () => clearTimeout(pressTimer));

    target.nextSibling.appendChild(fileDiv);
    input.focus();

    input.addEventListener("blur", () => {
        if (!input.value.trim()) {
            fileDiv.remove();
        }
    });
};
const openFolderInput = (target, path) => {
    let isExpanded = true;
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
                header.remove();
                node.remove();
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
            const folderName =
                input.value.trim() ||
                header.querySelector(".node-name").textContent.trim();
            showContextMenu(e, `${path}/${folderName}`, header);
        }, 600);
    });

    header.addEventListener("touchend", () => clearTimeout(pressTimer));
    header.addEventListener("touchmove", () => clearTimeout(pressTimer));

    node.innerHTML = `<div class="tree-node"></div>`;

    target.nextSibling.appendChild(header);
    target.nextSibling.appendChild(node);

    input.addEventListener("blur", () => {
        if (input.value.trim()) return;
        header.remove();
        node.remove();
    });

    input.focus();
};

const appendCopyFile = (parent, data) => {
    const currentPath = parent.querySelector(".node-name").getAttribute("id");
    const fileDiv = document.createElement("div");
    fileDiv.className = "file-item";
    const icon = getIcon(data.name);
    fileDiv.innerHTML = `
          <span class="file-icon">${icon}</span>
          <span id="${data.path}" class="node-name">${data.name}</span>
        `;

    const files = parent.parentElement.querySelectorAll(
        ".node-content .node-name"
    );
    const fileExists = [...files].some(
        file =>
            file !== fileDiv.querySelector(".node-name") &&
            file.textContent.trim() === data.name
    );

    if (fileExists) {
        fileDiv.remove();
        alert(data.name + " File Exist !");
        return;
    }

    const nodeName = fileDiv.querySelector(".node-name");
    nodeName.textContent = data.name;
    nodeName.setAttribute("id", currentPath + "/" + data.name);

    let pressTimer;
    fileDiv.addEventListener("touchstart", e => {
        pressTimer = setTimeout(() => {
            const fileName =
                data.name ||
                fileDiv.querySelector(".node-name").textContent.trim();
            if (fileName) {
                showContextMenu(e, currentPath + "/" + data.name, fileDiv);
            }
        }, 600);
    });

    fileDiv.addEventListener("touchend", () => clearTimeout(pressTimer));
    fileDiv.addEventListener("touchmove", () => clearTimeout(pressTimer));

    parent.nextSibling.appendChild(fileDiv);
};
const appendCopyFolder = (parent, data) => {
    let isExpanded = true;
    const currentPath = parent.querySelector(".node-name").getAttribute("id");
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
        <span id="${currentPath}/${data.name}" class="node-name">${data.name}</span>
    `;

    header.addEventListener("click", () => {
        const expanded = header.classList.contains("expanded");
        header.classList.toggle("expanded");

        const img = header.querySelector("#icon");
        img.src = expanded ? "icons/folder.png" : "icons/folder-open.png";

        const icon = header.querySelector(".toggle-icon");
        icon.textContent = expanded ? "▶" : "▼";
    });
    const folders = parent.parentElement.querySelectorAll(
        '.node-content .node-name[type="folder"]'
    );
    for (const folder of folders) {
        if (
            folder.textContent.trim().toLowerCase() === data.name.toLowerCase()
        ) {
            header.remove();
            node.remove();
            alert(`${data.name} Folder Exist !`);
            return;
        }
    }

    const nodeName = header.querySelector(".node-name");
    nodeName.textContent = data.name;
    nodeName.setAttribute("type", "folder");
    nodeName.setAttribute("id", `${currentPath}/${data.name}`);

    let pressTimer;
    header.addEventListener("touchstart", e => {
        pressTimer = setTimeout(() => {
            const folderName =
                data.name.trim() ||
                header.querySelector(".node-name").textContent.trim();
            showContextMenu(e, `${currentPath}/${data.name}`, header);
        }, 600);
    });

    header.addEventListener("touchend", () => clearTimeout(pressTimer));
    header.addEventListener("touchmove", () => clearTimeout(pressTimer));
    node.innerHTML = `<div class="tree-node"></div>`;

    parent.nextSibling.appendChild(header);
    parent.nextSibling.appendChild(node);
};

function showContextMenu(e, path, parent) {
    const menu = document.getElementById("context-menu");
    menu.style.display = "block";
    menu.style.left = (e.touches ? e.touches[0].pageX : e.pageX) - 90 + "px";
    menu.style.top = (e.touches ? e.touches[0].pageY : e.pageY) - 90 + "px";

    menu.onclick = async e => {
        const target = e.target;
        const type = target.getAttribute("id");
        if (type === "new-file") {
            openFileInput(parent, path);
        } else if (type === "new-folder") {
            openFolderInput(parent, path);
        } else if (type === "delete") {
            let ftype =
                parent.querySelector(".node-name").getAttribute("type") || null;
            deleteFile(
                ftype,
                parent.querySelector(".node-name").getAttribute("id")
            );
            parent.remove();
        } else if (type === "copy") {
            let path = parent.querySelector(".node-name").getAttribute("id");
            let name = parent.querySelector(".node-name").textContent.trim();
            cache = { path, name, type: "COPY" };
        } else if (type === "move") {
            let path = parent.querySelector(".node-name").getAttribute("id");
            let name = parent.querySelector(".node-name").textContent.trim();
            cache = { element: parent, path, name, type: "MOVE" };
        } else if (type === "rename") {
        } else if (type === "paste") {
            let path = parent.querySelector(".node-name").getAttribute("id");
            let ftype =
                parent.querySelector(".node-name").getAttribute("type") || null;
            if (!cache) return;
            if (cache.type === "COPY") {
                if (ftype === "folder") {
                    /*await copyFolder({
                        source: cache,
                        destination: path
                    });*/
                    console.log("ftype",ftype)
                    await renderFiles(parent.nextSibling, cache?.path);
                    return;
                } else {
                    appendCopyFile(parent, cache);
                }
                cache = null;
            } else if (cache.type === "MOVE") {
                if (ftype === "folder") {
                    await renderFiles(parent.nextSibling, cache?.path);
                    await moveFolder({
                        source: cache,
                        destination: path
                    });
                    cache.element.remove();
                    cache = null;
                } else {
                    console.log(cache);
                    await moveFile({
                        source: cache,
                        destination: path
                    });
                    // cache.element.remove();
                    cache = null;
                }
            }
        } else {
            return;
        }
    };
}

// Initialize the tree
function initTree() {
    const treeContainer = document.getElementById("fileTree");
    treeContainer.innerHTML = "";

    fileStructure.forEach(node => {
        createTreeNode(node, treeContainer);
    });
}

document.onclick = () => {
    const menu = document.getElementById("context-menu");
    menu.style.display = "none";
};
// Load the tree when page is ready///
window.onload = () => {
    const treeContainer = document.getElementById("fileTree");
    getFiles(treeContainer);
};
