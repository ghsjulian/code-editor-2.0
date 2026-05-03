// Sample folder structure
const fileStructure = [
    {
        name: "my-project",
        path: "/storage/emulated/0/htdocs/code",
        type: "folder",
        open: true,
        children: [
            {
                name: "css",
                path: "/storage/emulated/0/htdocs/code/css",
                type: "folder",
                open: false,
                children: [
                    {
                        name: "index.css",
                        path: "/storage/emulated/0/htdocs/code/css/index.css",
                        type: "file"
                    }
                ]
            },
            {
                name: "js",
                path: "/storage/emulated/0/htdocs/code/js",
                type: "folder",
                open: false,
                children: [
                    {
                        name: "ace.js",
                        path: "/storage/emulated/0/htdocs/code/js/ace.js",
                        type: "file"
                    },
                    {
                        name: "ext-language_tools.js",
                        path: "/storage/emulated/0/htdocs/code/js/ext-language_tools.js",
                        type: "file"
                    },
                    {
                        name: "index.js",
                        path: "/storage/emulated/0/htdocs/code/js/index.js",
                        type: "file"
                    },
                    {
                        name: "mode-javascript.js",
                        path: "/storage/emulated/0/htdocs/code/js/mode-javascript.js",
                        type: "file"
                    },
                    {
                        name: "theme-monokai.js",
                        path: "/storage/emulated/0/htdocs/code/js/theme-monokai.js",
                        type: "file"
                    },
                    {
                        name: "tree.js",
                        path: "/storage/emulated/0/htdocs/code/js/tree.js",
                        type: "file"
                    }
                ]
            },
            {
                name: "a.html",
                path: "/storage/emulated/0/htdocs/code/a.html",
                type: "file"
            },
            {
                name: "b.html",
                path: "/storage/emulated/0/htdocs/code/b.html",
                type: "file"
            },
            {
                name: "c.html",
                path: "/storage/emulated/0/htdocs/code/c.html",
                type: "file"
            },
            {
                name: "d.html",
                path: "/storage/emulated/0/htdocs/code/d.html",
                type: "file"
            },
            {
                name: "index.html",
                path: "/storage/emulated/0/htdocs/code/index.html",
                type: "file"
            },
            {
                name: "index.js",
                path: "/storage/emulated/0/htdocs/code/index.js",
                type: "file"
            },
            {
                name: "package.json",
                path: "/storage/emulated/0/htdocs/code/package.json",
                type: "file"
            }
        ]
    }
];

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
          <span class="folder-icon">📁</span>
          <span class="node-name">${node.name}</span>
        `;

        const content = document.createElement("div");
        content.className = "node-content";

        // Click to toggle folder
        header.addEventListener("click", () => {
            const isExpanded = header.classList.contains("expanded");
            header.classList.toggle("expanded");

            const icon = header.querySelector(".toggle-icon");
            icon.textContent = isExpanded ? "▶" : "▼";
        });
        let pressTimer;
        header.addEventListener("touchstart", e => {
            pressTimer = setTimeout(() => {
                showContextMenu(e, node.path);
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

        fileDiv.innerHTML = `
          <span class="file-icon">📄</span>
          <span path="${node.path}" class="node-name">${node.name}</span>
        `;
        let pressTimer;
        fileDiv.addEventListener("touchstart", e => {
            pressTimer = setTimeout(() => {
                showContextMenu(e, node.path);
            }, 600);
        });
        fileDiv.addEventListener("touchend", () => clearTimeout(pressTimer));
        fileDiv.addEventListener("touchmove", () => clearTimeout(pressTimer));
        nodeDiv.appendChild(fileDiv);
    }

    parentElement.appendChild(nodeDiv);
}
function showContextMenu(e, path) {
    const menu = document.getElementById("context-menu");
    menu.style.display = "block";
    menu.style.left = (e.touches ? e.touches[0].pageX : e.pageX) + "px";
    menu.style.top = (e.touches ? e.touches[0].pageY : e.pageY) + "px";

    menu.onclick = e => {
        const target = e.target
        const type = target.getAttribute("id")
        console.log(type)
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

const action = e => {
    console.log(e.target);
};
// Load the tree when page is ready
window.onload = initTree;
