import getIcon from "./get-icon.js";
import {
    socket,
    deleteFile,
    createFile,
    createFolder,
    copyFile,
    copyFolder,
    moveFile,
    moveFolder,
    openFile,
    renameFile,
    renameFolder
} from "./client-socket.js";
import { getAceMode } from "./get-ace-mode.js";

var cache = null;
var paste = null;
const activeFiles = [];
var currentFile = null;
const pasteElem = document.querySelector("#paste");
const tabContainer = document.querySelector(".container");
const moreMenu = document.querySelector("#more-menu");
const moreBtn = document.querySelector(".more-menu");
const myEditor = ace.edit("editor");

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
        setFileAction(fileDiv, node);
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

const setFileAction = (element, node) => {
    const file = element.querySelector(".node-name");
    file.addEventListener("click", async () => {
        if (activeFiles.includes(node.name)) {
            document
                .getElementById("explorer-sidebar")
                .classList.toggle("open");
            return;
        }

        const mode = getAceMode(node.name);
        await openFile(node.path);
        myEditor.session.setMode(mode);
        activeFiles.push(node);
        setTab(node);
        currentFile = {
            name: node.name,
            path: node.path
        };
        document.getElementById("explorer-sidebar").classList.toggle("open");
    });
};

const openFileInput = (target, path) => {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree-node";
    const fileDiv = document.createElement("div");
    fileDiv.className = "file-item";
    const icon = getIcon("file.txtxx");
    fileDiv.innerHTML = `
        <span class="file-icon">${icon}</span> 
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
    input.addEventListener("blur", e => {
        nodeDiv.remove();
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
    input.addEventListener("blur", e => {
        nodeDiv.remove();
    });
    nodeDiv.appendChild(header);
    target.nextSibling.appendChild(nodeDiv);
    input.focus();
};

const renameFileInput = (parent, path) => {
    const filename = parent.querySelector(".node-name").textContent;
    const icon = getIcon(filename);
    parent.innerHTML = `
        <span class="file-icon">${icon}</span> 
        <span class="node-name"></span> 
        <input type="text" id="filename" value="${filename}" placeholder="Enter file name" enterkeyhint="go" autocomplete="off" />
    `;
    const input = parent.querySelector("input");
    input.addEventListener("input", e => {
        parent.querySelector(".file-icon").innerHTML = getIcon(
            input.value.trim()
        );
    });
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            const val = input.value.trim();
            if (!val) return;
            renameFile(path, val);
            parent.querySelector(".node-name").textContent = val;
            input.remove();
        }
    });
    input.focus();
};
const renameFolderInput = (parent, path) => {
    const folderename = parent.querySelector(".node-name").textContent;
    parent.innerHTML = `
        <span class="toggle-icon"></span>
        <span class="folder-icon">
       <img id="icon" src="icons/folder.png" alt="folder" />
        </span>
        <span class="node-name"><span>
        <input type="text" id="folder-name" value="${folderename}" placeholder="Folder name" enterkeyhint="go" autocomplete="off"/>
    `;

    const input = parent.querySelector("input");
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            const val = input.value.trim();
            if (!val) return;
            renameFolder(path, val);
            parent.querySelector(".node-name").textContent = val;
            input.remove();
        }
    });
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
        // const actionType = event.target.id;
        const actionType = event.target.closest("li").id;
        console.log(actionType);
        if (!actionType) return;

        const nodeElem = parent.querySelector(".node-name");
        const currentPath = nodeElem.id;
        const currentName = nodeElem.textContent.trim();
        const isFolder = nodeElem.getAttribute("type") === "folder";

        if (actionType === "new-file") openFileInput(parent, path);
        else if (actionType === "new-folder") openFolderInput(parent, path);
        else if (actionType === "rename") {
            if (isFolder) {
                renameFolderInput(parent, path);
            } else {
                renameFileInput(parent, path);
            }
        } else if (actionType === "delete") {
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
const setTab = node => {
    const list = document.createElement("div");
    const p = document.createElement("p");
    const span = document.createElement("span");

    list.className = "list";
    p.textContent = node.name;
    p.setAttribute("path", node.path);
    span.textContent = "x";
    const icon = getIcon(node.name);
    list.innerHTML = icon;

    list.appendChild(p);
    list.appendChild(span);
    tabContainer.appendChild(list);
    setActiveTab(p);

    span.onclick = e => {
        const index = activeFiles.findIndex(
            file => file === node.name || file.name === node.name
        );
        if (index !== -1) {
            activeFiles.splice(index, 1);
            list.remove();
            myEditor.setValue("", -1);
            if (activeFiles.length === 0) {
                const defaultFile = "untitled.txt";
                activeFiles.push(defaultFile);
                tabContainer.innerHTML = "";
                setTab(defaultFile);
                const mode = getAceMode(defaultFile);
                myEditor.session.setMode(mode);
            } else {
                tabContainer.innerHTML = "";
                activeFiles.forEach(async f => {
                    setTab(f);
                    await openFile(f.name);
                    const mode = getAceMode(f.name);
                    myEditor.session.setMode(mode);
                    formatEditorCode(f.name);
                    currentFile = {
                        name: f.name,
                        path: f.path
                    };
                });
            }
        }
    };
    p.onclick = async e => {
        setActiveTab(e.target);
        const name = e.target.textContent;
        const mode = getAceMode(name);
        myEditor.session.setMode(mode);
        if (name === "untitled.txt") {
            myEditor.setValue("", -1);
            return;
        }
        await openFile(name);
        formatEditorCode(name);
        currentFile = {
            name: name,
            path: e.target.getAttribute("path") || node.path || null
        };
    };
};

const setActiveTab = element => {
    const parent = element.parentElement;
    if (parent) {
        document.querySelectorAll(".list.active").forEach(el => {
            el.classList.remove("active");
        });
        parent.classList.add("active");
    }
};

/*----------- CREATING FOR TERMINAL -----------*/
const terminal = document.getElementById("terminal");
let commandHistory = [];
let historyIndex = -1;

function createPrompt() {
    const promptLine = document.createElement("div");
    promptLine.className = "prompt-line";
    promptLine.innerHTML = `
        <span class="prompt">
          <span class="prompt-host">localhost</span>:<span class="prompt-user">ghs</span>--<span class="prompt-symbol">#</span>
        </span>
        <input type="text" autofocus spellcheck="false" autocomplete="off">
    `;
    const input = promptLine.querySelector("input");
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            const command = input.value.trim();
            input.disabled = true; // Lock input immediately to prevent spamming
            if (command) {
                commandHistory.unshift(command);
                historyIndex = -1;
                processCommand(command);
            } else {
                createPrompt();
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (commandHistory.length > 0) {
                historyIndex = Math.min(
                    historyIndex + 1,
                    commandHistory.length - 1
                );
                input.value = commandHistory[historyIndex];
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                input.value = "";
            }
        }
    });
    terminal.appendChild(promptLine);
    input.focus();
    terminal.scrollTop = terminal.scrollHeight;
}

function processCommand(cmd) {
    const lowerCmd = cmd.toLowerCase().trim();
    if (lowerCmd === "clear" || lowerCmd === "cls") {
        terminal.innerHTML = `<div class="welcome">Terminal cleared.<br></div>`;
        createPrompt();
        return;
    }
    const output = document.createElement("div");
    terminal.scrollTop = terminal.scrollHeight;
    socket.emit("terminal:input", cmd + "\n");
    socket.on("terminal:output", data => {
        output.className = "output";
        output.innerHTML = data.toString() || "";
        if (output.innerHTML !== "") {
            terminal.appendChild(output);
        }
        createPrompt();
    });
    createPrompt();
}

/*-------------> CODE FORMATOR <--------------*/

const getParserByExt = ext => {
    switch (ext) {
        case "js":
        case "jsx":
            return "babel";
        case "ts":
        case "tsx":
            return "typescript";
        case "html":
        case "htm":
            return "html";
        case "css":
            return "css";
        case "json":
            return "json";
        default:
            return null;
    }
};
const formatEditorCode = async filename => {
    if (!myEditor || !filename) return;
    const code = myEditor.getValue();
    const ext = filename.split(".").pop().toLowerCase();
    const parser = getParserByExt(ext);
    if (!parser) {
        console.log("⚠️ No Formator For : ", ext);
        return;
    }
    try {
        const formatted = await prettier.format(code, {
    parser: parser,
    plugins: prettierPlugins,

    // =========================
    // INDENTATION
    // =========================
    tabWidth: 4,
    useTabs: false,

    // =========================
    // SYNTAX STYLE
    // =========================
    semi: true,
    singleQuote: false,
    jsxSingleQuote: false,

    // =========================
    // TRAILING STYLE (VERY IMPORTANT for git diff clean code)
    // =========================
    trailingComma: "all",

    // =========================
    // OBJECT / ARRAY STYLE
    // =========================
    bracketSpacing: true,

    // =========================
    // STRING / LINE WRAPPING
    // =========================
    printWidth: 100,

    // =========================
    // HTML / JSX BEHAVIOR
    // =========================
    htmlWhitespaceSensitivity: "css",
    jsxBracketSameLine: false,

    // =========================
    // FILE CONTROL
    // =========================
    requirePragma: false,
    insertPragma: false,

    // =========================
    // ADVANCED CONSISTENCY
    // =========================
    arrowParens: "always", // always (x) => {} instead of x => {}
    endOfLine: "lf"        // consistent cross-platform
});
        /*
        const formatted = await prettier.format(code, {
            parser: parser,
            plugins: prettierPlugins,
            tabWidth: 4,
            useTabs: false,
            semi: true,
            singleQuote: false,
            doubleQuote : true
        });
        */
        // preserve cursor
        const cursor = myEditor.getCursorPosition();
        myEditor.setValue(formatted, -1);
        myEditor.moveCursorToPosition(cursor);
        console.log("✅ Code Formated !");
    } catch (err) {
        console.error("Formatting error : ", err);
    }
};

/*-------- MORE MENU --------*/
moreBtn.onclick = () => {
    moreMenu.style.display = "block";
};
document.addEventListener("click", e => {
    const target = e.target.closest(".more-menu");
    const menuItem = e.target.closest("#more-menu li");

    if (moreBtn && !moreBtn.contains(target)) {
        moreMenu.style.display = "none";
    }
    // Here i will add action menu
    if (!menuItem) return;
    menuItem.onclick = e => {
        const targetList = e.target.closest("li");
        const actionType = targetList.id;

        switch (actionType) {
            case "save-file":
                if (!currentFile) return;
                formatEditorCode(currentFile?.name);
                break;
            case "select-text":
                // code
                break;

            default:
            // code
        }
    };
});

window.onload = () => {
    socket.on("file-data", fileData => {
        myEditor.setValue(fileData, -1);
    });
    getFiles(document.getElementById("fileTree"));
    if (activeFiles.length == 0) {
        activeFiles.push({ name: "untitled.txt", path: null });
        setTab({ name: "untitled.txt", path: null });
    }
    createPrompt();
};
