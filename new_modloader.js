console.log("🔥 MODLOADER V10 ENGINE CORE BOOTING...");

// =============================
// GLOBAL STATE
// =============================

window.ModLoader = {
    name: "Sandboxels Mod Loader",
    version: "V10-ENGINE",
    authors: ["Sussy baka"],
    features: [
        "Stable Console",
        "Runtime Registry Core",
        "Auto Sync Engine",
        "Safe UI Bridge",
        "No Recursion Logging",
        "Crash Proof Loader"
    ],
    mods: {},
    loaded: [],
    errors: [],
    runtimeRegistry: {}
};

window.MODS = window.MODS || [];
const STORAGE_KEY = "sandboxels_mods_v10";

// =============================
// ELEMENT SYSTEM (ENGINE CORE)
// =============================

window.elements = window.elements || {};
window.elements.__registry = window.elements.__registry || {};
window.elements.__categories = window.elements.__categories || {};

// =============================
// 🔥 SAFE CONSOLE (NO BREAK)
// =============================

(function setupSafeConsole(){

    const native = {
        log: console.log.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console)
    };

    function write(type, args){
        const box = document.getElementById("console");

        const msg = `[${type}] ` + args.map(a =>
            typeof a === "object" ? JSON.stringify(a) : a
        ).join(" ");

        // safe DOM write
        if(box){
            box.textContent += msg + "\n";
            box.scrollTop = box.scrollHeight;
        }
    }

    console.log = (...args) => {
        native.log(...args);
        write("LOG", args);
    };

    console.warn = (...args) => {
        native.warn(...args);
        write("WARN", args);
    };

    console.error = (...args) => {
        native.error(...args);
        write("ERROR", args);
    };

})();

// =============================
// 💾 SAVE / LOAD
// =============================

function saveMods(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.MODS));
    console.log("💾 saved mods:", window.MODS.length);
}

function loadSavedMods(){
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if(Array.isArray(data)){
            window.MODS = data;
            console.log("📦 loaded mods:", data.length);
        }
    } catch(e){
        console.error("load fail", e);
    }
}

// =============================
// 🔥 RUNTIME REGISTRY CORE (MAIN FIX)
// =============================

function syncRuntimeRegistry(name, data){
    window.ModLoader.runtimeRegistry[name] = {
        data,
        ts: Date.now()
    };
}

// =============================
// REGISTER ELEMENT (TRUE ENGINE SOURCE)
// =============================

window.registerElement = function(name, data){

    if(!name || !data) return;

    // ENGINE STORE
    window.elements[name] = data;

    // REGISTRY
    window.elements.__registry[name] = {
        ts: Date.now(),
        category: data.category || "uncategorized"
    };

    // RUNTIME MIRROR (IMPORTANT FIX)
    syncRuntimeRegistry(name, data);

    // CATEGORY SYNC
    const cat = data.category || "uncategorized";

    if(!window.elements.__categories[cat]){
        window.elements.__categories[cat] = [];
    }

    if(!window.elements.__categories[cat].includes(name)){
        window.elements.__categories[cat].push(name);
    }

    console.log("🧱 registered:", name);
};

// =============================
// UI REFRESH SAFE
// =============================

function refreshUI(){
    try {
        window.rebuildPalette?.();
        window.updatePalette?.();
        window.dispatchEvent(new Event("resize"));
    } catch(e){
        console.error("refresh fail", e);
    }
}

// =============================
// FETCH MOD
// =============================

async function fetchMod(url){
    console.log("🌐 fetch:", url);

    const res = await fetch(url);
    if(!res.ok) throw new Error("HTTP " + res.status);

    return await res.text();
}

// =============================
// RUN MOD (SAFE EXECUTION)
// =============================

function runMod(code, id){
    try {

        const fn = new Function(
            "window",
            "elements",
            "registerElement",
            "behaviors",
            "console",
            code
        );

        fn(
            window,
            window.elements,
            window.registerElement,
            window.behaviors,
            console
        );

        console.log("✅ loaded:", id);
        return true;

    } catch(e){
        console.error("❌ mod error:", id, e);
        window.ModLoader.errors.push({id, error:e});
        return false;
    }
}

// =============================
// LOAD MOD
// =============================

async function loadMod(url){
    try {

        const code = await fetchMod(url);
        const id = url.split("/").pop();

        const ok = runMod(code, id);

        if(ok){
            window.ModLoader.mods[id] = {
                url,
                code,
                ts: Date.now()
            };

            if(!window.ModLoader.loaded.includes(id)){
                window.ModLoader.loaded.push(id);
            }
        }

        refreshUI();
        updateUI();
        updateLoaderInfo();

    } catch(e){
        console.error("load fail:", url, e);
    }
}

// =============================
// LOAD ALL
// =============================

async function loadAll(){
    console.log("🚀 loading mods...");
    for(const url of window.MODS){
        await loadMod(url);
    }
    console.log("✅ done");
}

// =============================
// FORCE SYNC (ENGINE BACKUP)
// =============================

function forceRegistryCommit(){
    for(const key in window.elements){
        if(key.startsWith("__")) continue;

        if(!window.elements.__registry[key]){
            window.registerElement(key, window.elements[key]);
        }
    }
}

// =============================
// TOGGLE UI
// =============================

function createToggle(){
    if(document.getElementById("modToggle")) return;

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
    `;

    btn.onclick = () => {
        const ui = document.getElementById("modUI");
        if(ui) ui.style.display = ui.style.display === "none" ? "flex" : "none";
    };

    document.body.appendChild(btn);
}

// =============================
// LOADER INFO
// =============================

function updateLoaderInfo(){
    const box = document.getElementById("loaderInfo");
    if(!box) return;

    box.innerHTML = `
        <h2>${window.ModLoader.name}</h2>
        <div>v${window.ModLoader.version}</div>
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

function createUI(){
    if(document.getElementById("modUI")) return;

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

            <input id="url" style="width:100%;padding:6px;">
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

    document.getElementById("addMod").onclick = () => {
        const url = document.getElementById("url").value.trim();
        if(!url) return;

        if(!window.MODS.includes(url)){
            window.MODS.push(url);
            saveMods();
            updateUI();
        }
    };

    document.getElementById("loadMods").onclick = loadAll;
}

// =============================
// UI UPDATE
// =============================

function updateUI(){
    const box = document.getElementById("mods");
    if(!box) return;

    box.innerHTML = "";

    window.MODS.forEach(u => {
        const div = document.createElement("div");
        div.textContent = "🟢 " + u;
        box.appendChild(div);
    });
}

// =============================
// BOOT
// =============================

async function boot(){
    loadSavedMods();
    createUI();
    createToggle();
    updateLoaderInfo();
    updateUI();

    await loadAll();

    setInterval(forceRegistryCommit, 2000);

    console.log("🔥 V10 ENGINE READY (REGISTRY ACTIVE)");
}

boot();