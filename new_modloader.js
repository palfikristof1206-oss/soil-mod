console.log("🔥 MODLOADER V8 BOOTING...");

// =============================
// V8 INFO
// =============================

window.ModLoader = {
    name: "Sandboxels Mod Loader",
    version: "V8",
    authors: ["Sussy baka"],
    features: [
        "Author List",
        "Feature List",
        "Toggle Button",
        "Console Panel",
        "Registry Sync",
        "Category Sync",
        "Auto Reload",
        "LocalStorage Save",
        "Palette Refresh",
        "Mod List UI"
    ],
    mods: {},
    loaded: [],
    errors: []
};

window.MODS = window.MODS || [];
const STORAGE_KEY = "sandboxels_mods_v8";

// =============================
// ELEMENT INIT
// =============================

window.elements = window.elements || {};
window.elements.__registry = window.elements.__registry || {};
window.elements.__categories = window.elements.__categories || {};

// =============================
// SAVE / LOAD
// =============================

function saveMods() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MODS));
    console.log("💾 Saved", MODS.length, "mods");
}

function loadSavedMods() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(data)) {
            MODS.length = 0;
            MODS.push(...data);
            console.log("📦 Restored", data.length, "mods");
        }
    } catch (err) {
        console.error("Load failed", err);
    }
}

// =============================
// REGISTER ELEMENT
// =============================

window.registerElement = function (name, data) {
    if (!name || !data) return;

    window.elements[name] = data;

    const category = data.category || "uncategorized";

    window.elements.__registry[name] = {
        registered: true,
        timestamp: Date.now(),
        category
    };

    if (!window.elements.__categories[category]) {
        window.elements.__categories[category] = [];
    }

    if (!window.elements.__categories[category].includes(name)) {
        window.elements.__categories[category].push(name);
    }

    console.log("🧱 REGISTERED:", name);
};

// =============================
// REFRESH UI
// =============================

function refreshUI() {
    try {
        window.rebuildPalette?.();
        window.updatePalette?.();
        window.dispatchEvent(new Event("resize"));
    } catch (err) {
        console.error("Refresh fail", err);
    }
}

// =============================
// CONSOLE HOOK
// =============================

function setupConsole() {
    const oldLog = console.log;
    const oldWarn = console.warn;
    const oldError = console.error;

    function write(type, args) {
        const box = document.getElementById("console");
        if (!box) return;

        const text = `[${type}] ` + args.join(" ");
        box.textContent += text + "\n";
        box.scrollTop = box.scrollHeight;
    }

    console.log = (...args) => {
        oldLog(...args);
        write("LOG", args);
    };

    console.warn = (...args) => {
        oldWarn(...args);
        write("WARN", args);
    };

    console.error = (...args) => {
        oldError(...args);
        write("ERROR", args);
    };
}

// =============================
// FETCH MOD
// =============================

async function fetchMod(url) {
    console.log("🌐 Fetching:", url);

    const res = await fetch(url);
    if (!res.ok) throw new Error("Fetch failed: " + res.status);

    return await res.text();
}

// =============================
// COMPILER
// =============================

function compileMod(code) {
    return code;
}

// =============================
// RUN MOD
// =============================

function runMod(code, id) {
    try {
        const fn = new Function(
            "window",
            "elements",
            "registerElement",
            code
        );

        fn(window, window.elements, window.registerElement);

        console.log("✅ Loaded:", id);
        return true;
    } catch (err) {
        console.error("❌ Mod Error:", id, err);
        window.ModLoader.errors.push({ id, error: err });
        return false;
    }
}

// =============================
// LOAD MOD
// =============================

async function loadMod(url) {
    try {
        const code = await fetchMod(url);
        const id = url.split("/").pop();

        const ok = runMod(code, id);

        if (ok) {
            window.ModLoader.mods[id] = { url, code, loaded: Date.now() };

            if (!window.ModLoader.loaded.includes(id)) {
                window.ModLoader.loaded.push(id);
            }
        }

        refreshUI();
        updateUI();
    } catch (err) {
        console.error("Load Fail:", url, err);
    }
}

// =============================
// LOAD ALL
// =============================

async function loadAll() {
    console.log("🚀 Loading all mods...");
    for (const url of MODS) {
        await loadMod(url);
    }
    console.log("✅ All mods loaded");
}

// =============================
// FORCE SYNC
// =============================

function forceRegistryCommit() {
    for (const key in window.elements) {
        if (key.startsWith("__")) continue;

        if (!window.elements.__registry[key]) {
            window.registerElement(key, window.elements[key]);
        }
    }
}

// =============================
// TOGGLE UI
// =============================

function createToggle() {
    if (document.getElementById("modToggle")) return;

    const btn = document.createElement("button");
    btn.id = "modToggle";
    btn.textContent = "🔥 Mods";

    btn.style.cssText = `
        position:fixed;
        left:10px;
        bottom:10px;
        z-index:1000000;
        padding:10px;
        background:#111;
        color:white;
        border:1px solid #333;
        cursor:pointer;
    `;

    btn.onclick = () => {
        const ui = document.getElementById("modUI");
        if (!ui) return;
        ui.style.display = ui.style.display === "none" ? "flex" : "none";
    };

    document.body.appendChild(btn);
}

// =============================
// UI
// =============================

function createUI() {
    if (document.getElementById("modUI")) return;

    const ui = document.createElement("div");
    ui.id = "modUI";

    ui.style.cssText = `
        position:fixed;
        inset:0;
        background:#050816;
        color:white;
        font-family:monospace;
        display:none;
        z-index:999999;
    `;

    ui.innerHTML = `
        <div style="width:320px;padding:10px;border-right:1px solid #222;">
            <h3>${window.ModLoader.name} ${window.ModLoader.version}</h3>

            <input id="url" style="width:100%;padding:6px;" placeholder="mod url">

            <br><br>

            <button id="addMod">Add</button>
            <button id="loadMods">Load</button>

            <hr>

            <div id="mods"></div>
        </div>

        <div style="flex:1;padding:10px;">
            <pre id="console"></pre>
        </div>
    `;

    document.body.appendChild(ui);

    document.getElementById("addMod").onclick = () => {
        const url = document.getElementById("url").value.trim();
        if (!url) return;

        if (!MODS.includes(url)) {
            MODS.push(url);
            saveMods();
            updateUI();
        }
    };

    document.getElementById("loadMods").onclick = loadAll;
}

// =============================
// UI UPDATE
// =============================

function updateUI() {
    const box = document.getElementById("mods");
    if (!box) return;

    box.innerHTML = "";

    for (const url of MODS) {
        const div = document.createElement("div");
        div.textContent = "🟢 " + url;
        box.appendChild(div);
    }
}

// =============================
// BOOT
// =============================

async function boot() {
    loadSavedMods();
    createUI();
    createToggle();
    setupConsole();

    updateUI();
    updateLoaderInfo?.();

    await loadAll();

    setInterval(forceRegistryCommit, 2000);

    console.log("🔥 MODLOADER V8 READY");
}

boot();