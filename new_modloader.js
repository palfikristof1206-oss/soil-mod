// =====================================
// Sandboxels Mod Loader V2.1
// =====================================

console.log("🔥 Mod Loader V2.1 booting...");

// =============================
// GLOBAL STATE
// =============================

window.ModLoader = {
    mods: {},        // id -> mod
    order: [],
    loaded: [],
    disabled: [],
    errors: [],
    conflicts: [],
};

// legacy sync support
window.MODS = window.MODS || [];

// =============================
// CORE CONFIG
// =============================

const CONFIG = {
    autoLoad: true,
    debug: true,
};

// =============================
// UTIL
// =============================

const log = (...a) => CONFIG.debug && console.log("[ML]", ...a);

async function fetchText(url){
    const res = await fetch(url);
    return await res.text();
}

// =============================
// VERSION DETECTOR
// =============================

function detectVersion(code){
    if(code.includes("v3.1")) return "v3.1";
    if(code.includes("v3.0")) return "v3.0";
    if(code.includes("Expansion Pack")) return "pack";
    return "unknown";
}

// =============================
// SAFE EXEC
// =============================

function runCode(code, id){
    try {
        eval(code);
        return true;
    } catch(e){
        ModLoader.errors.push({id, error:e});
        console.error("[ML ERROR]", id, e);
        return false;
    }
}

// =============================
// LOAD MOD
// =============================

async function loadMod(url, id = url){

    log("Loading:", url);

    try {
        const code = await fetchText(url);
        const version = detectVersion(code);

        const mod = {
            id,
            url,
            code,
            version,
            enabled: true
        };

        ModLoader.mods[id] = mod;

        const ok = runCode(code, id);

        if(ok){
            ModLoader.loaded.push(id);
            log("Loaded:", id, "version:", version);
        }

        updateUI();

    } catch(e){
        ModLoader.errors.push({url, error:e});
        console.error("[ML FETCH ERROR]", url, e);
    }
}

// =============================
// LOAD ALL (SYNC WITH LEGACY MODS)
// =============================

async function loadAllMods(){

    const list = [...window.MODS];

    log("Loading all mods:", list.length);

    for(let url of list){
        await loadMod(url);
    }
}

// =============================
// TOGGLE MOD
// =============================

function toggleMod(id){

    const mod = ModLoader.mods[id];
    if(!mod) return;

    mod.enabled = !mod.enabled;

    log((mod.enabled ? "Enabled" : "Disabled"), id);

    if(!mod.enabled){
        ModLoader.disabled.push(id);
    } else {
        loadMod(mod.url, id);
    }

    updateUI();
}

// =============================
// CONSOLE MENU (🔥 FEATURE)
// =============================

window.ModConsole = {

    add(url){
        window.MODS.push(url);
        log("Added via console:", url);
    },

    load(){
        loadAllMods();
    },

    list(){
        console.table(ModLoader.mods);
    },

    clear(){
        window.MODS.length = 0;
        log("Cleared MODS list");
    },

    reload(id){
        if(id){
            loadMod(ModLoader.mods[id]?.url, id);
        } else {
            location.reload();
        }
    }
};

console.log(`
🔥 MOD CONSOLE READY:
- ModConsole.add(url)
- ModConsole.load()
- ModConsole.list()
- ModConsole.clear()
- ModConsole.reload(id)
`);

// =============================
// UI
// =============================

function createUI(){

    const ui = document.createElement("div");

    ui.style = `
        position:fixed;
        bottom:10px;
        left:10px;
        width:260px;
        background:rgba(10,10,10,0.92);
        color:white;
        font-family:monospace;
        border-radius:12px;
        padding:10px;
        z-index:999999;
        box-shadow:0 0 15px rgba(0,0,0,0.5);
    `;

    ui.innerHTML = `
        <div style="font-weight:bold;">🔥 Mod Loader V2.1</div>

        <input id="modUrl" placeholder="Paste mod URL..." 
            style="width:100%; margin-top:8px; padding:5px;" />

        <button id="addMod" style="width:100%; margin-top:5px;">➕ Add Mod</button>
        <button id="loadMods" style="width:100%; margin-top:5px;">⚡ Load Mods</button>
        <button id="reload" style="width:100%; margin-top:5px;">🔄 Reload Page</button>

        <hr style="margin:8px 0;">

        <div id="modList" style="font-size:12px; max-height:120px; overflow:auto;"></div>
    `;

    document.body.appendChild(ui);

    // events
    document.getElementById("addMod").onclick = () => {
        const url = document.getElementById("modUrl").value;
        if(url){
            window.MODS.push(url);
            updateUI();
            log("Added:", url);
        }
    };

    document.getElementById("loadMods").onclick = loadAllMods;
    document.getElementById("reload").onclick = () => location.reload();

    updateUI();
}

// =============================
// UI UPDATE
// =============================

function updateUI(){

    const list = document.getElementById("modList");
    if(!list) return;

    let html = "<b>Mods:</b><br>";

    for(let id in ModLoader.mods){
        const m = ModLoader.mods[id];

        html += `
            <div style="margin-top:4px; cursor:pointer;"
                 onclick="toggleMod('${id}')">
                ${m.enabled ? "🟢" : "🔴"} ${id}
            </div>
        `;
    }

    list.innerHTML = html;
}

// =============================
// START
// =============================

function init(){
    createUI();

    if(CONFIG.autoLoad){
        setTimeout(loadAllMods, 1000);
    }
}

init();