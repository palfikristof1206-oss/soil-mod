console.log("🔥 MODLOADER V8 FIXED BOOTING...");

// =============================
// STATE
// =============================

window.ModLoader = {
    name: "Sandboxels Mod Loader",
    version: "V8-FIX",
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
// SAVE / LOAD (FIXED)
// =============================

function saveMods() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.MODS));
    console.log("💾 SAVED:", window.MODS.length);
}

function loadSavedMods() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(data)) {
            window.MODS = data;
            console.log("📦 LOADED:", data.length);
        }
    } catch (e) {
        console.error("LOAD FAIL", e);
    }
}

// =============================
// REGISTER ELEMENT
// =============================

window.registerElement = function (name, data) {
    if (!name || !data) return;

    window.elements[name] = data;

    const cat = data.category || "uncategorized";

    window.elements.__registry[name] = true;

    if (!window.elements.__categories[cat]) {
        window.elements.__categories[cat] = [];
    }

    if (!window.elements.__categories[cat].includes(name)) {
        window.elements.__categories[cat].push(name);
    }

    console.log("🧱 REGISTERED:", name);
};

// =============================
// REFRESH
// =============================

function refreshUI() {
    window.rebuildPalette?.();
    window.updatePalette?.();
    window.dispatchEvent(new Event("resize"));
}

// =============================
// FETCH MOD
// =============================

async function fetchMod(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Fetch failed " + res.status);
    return await res.text();
}

// =============================
// RUN MOD
// =============================

function runMod(code, id) {
    try {
        new Function(
            "window",
            "elements",
            "registerElement",
            code
        )(window, window.elements, window.registerElement);

        console.log("✅ LOADED:", id);
        return true;
    } catch (e) {
        console.error("❌ MOD ERROR:", id, e);
        return false;
    }
}

// =============================
// LOAD MOD (FIXED ORDER)
// =============================

async function loadMod(url) {
    try {
        const code = await fetchMod(url);
        const id = url.split("/").pop();

        const ok = runMod(code, id);

        if (ok) {
            window.ModLoader.mods[id] = { url, code };

            if (!window.ModLoader.loaded.includes(id)) {
                window.ModLoader.loaded.push(id);
            }
        }

        refreshUI();
        updateUI();
        updateLoaderInfo();

    } catch (e) {
        console.error("LOAD FAIL:", url, e);
    }
}

// =============================
// LOAD ALL
// =============================

async function loadAll() {
    console.log("🚀 LOADING MODS...");
    for (const url of window.MODS) {
        await loadMod(url);
    }
    console.log("✅ DONE");
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
// UI TOGGLE
// =============================

function createToggle() {
    if (document.getElementById("modToggle")) return;

    const btn = document.createElement("button");
    btn.id = "modToggle";
    btn.textContent = "🔥 MODS";

    btn.style.cssText = `
        position:fixed;
        left:10px;
        bottom:10px;
        z-index:999999;
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
// LOADER INFO (FIXED)
// =============================

function updateLoaderInfo() {
    const box = document.getElementById("loaderInfo");
    if (!box) return;

    box.innerHTML = `
        <h2>${window.ModLoader.name}</h2>
        <div>Version: ${window.ModLoader.version}</div>

        <hr>

        <b>Authors</b><br>
        ${window.ModLoader.authors.map(a => "• " + a).join("<br>")}

        <hr>

        <b>Features</b><br>
        ${window.ModLoader.features.map(f => "• " + f).join("<br>")}
    `;
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
            <div id="loaderInfo"></div>
            <hr>

            <input id="url" style="width:100%;padding:6px;" placeholder="mod url">
            <br><br>

            <button id="addMod">ADD</button>
            <button id="loadMods">LOAD</button>

            <hr>
            <div id="mods"></div>
        </div>

        <div style="flex:1;padding:10px;">
            <pre id="console"></pre>
        </div>
    `;

    document.body.appendChild(ui);

    // FIX: ADD BUTTON + SAVE GUARANTEE
    document.getElementById("addMod").onclick = () => {
        const url = document.getElementById("url").value.trim();
        if (!url) return;

        if (!window.MODS.includes(url)) {
            window.MODS.push(url);
            saveMods();          // <<< FIXED
            updateUI();
            console.log("💾 ADDED:", url);
        }
    };

    document.getElementById("loadMods").onclick = loadAll;
}

// =============================
// UI UPDATE (FIXED)
// =============================

function updateUI() {
    const box = document.getElementById("mods");
    if (!box) return;

    box.innerHTML = "";

    window.MODS.forEach(url => {
        const div = document.createElement("div");
        div.textContent = "🟢 " + url;
        box.appendChild(div);
    });
}

// =============================
// BOOT (FIXED ORDER)
// =============================

async function boot() {
    loadSavedMods();     // 1
    createUI();          // 2
    createToggle();      // 3
    updateLoaderInfo();  // 4
    updateUI();          // 5

    await loadAll();     // 6

    setInterval(forceRegistryCommit, 2000);

    console.log("🔥 MODLOADER V8 FIX READY");
}

boot();