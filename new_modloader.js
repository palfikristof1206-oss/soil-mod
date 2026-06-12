// =====================================
// Sandboxels Mod Loader V2 (FULL)
// =====================================

console.log("Mod Loader V2 initializing...");

// =============================
// GLOBAL STATE
// =============================

window.ModLoader = {
    mods: {},        // {id: modData}
    order: [],       // load order
    loaded: [],
    disabled: [],
    errors: [],
    conflicts: [],
};

// =============================
// CONFIG
// =============================

const MODS = [
    // raw github js links
    // "https://raw.githubusercontent.com/user/repo/main/mod.js"
];

// =============================
// UTIL: SAFE FETCH
// =============================

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
// MANIFEST PARSER (JSON SUPPORT)
// =============================

function parseManifest(code){
    try {
        const match = code.match(/\/\*\s*MOD_MANIFEST\s*([\s\S]*?)\*\//);
        if(match){
            return JSON.parse(match[1]);
        }
    } catch(e){}
    return null;
}

// =============================
// CONFLICT DETECTOR
// =============================

function detectConflicts(code, id){

    const conflicts = [];

    if(!window.elements) return conflicts;

    for(let key in elements){
        if(code.includes(`"${key}"`) && ModLoader.mods[id]?.elements?.includes(key)){
            conflicts.push(key);
        }
    }

    return conflicts;
}

// =============================
// SAFE EVAL WRAPPER
// =============================

function runCode(code, id){
    try {
        eval(code);
        return true;
    } catch(e){
        ModLoader.errors.push({id, error:e});
        console.log("Mod error:", id, e);
        return false;
    }
}

// =============================
// LOAD SINGLE MOD
// =============================

async function loadMod(url, id = null){

    try {

        const code = await fetchText(url);

        const manifest = parseManifest(code);
        const version = detectVersion(code);

        id = id || url;

        const mod = {
            id,
            url,
            code,
            manifest,
            version,
            enabled: true,
            dependencies: manifest?.dependencies || []
        };

        // store
        ModLoader.mods[id] = mod;

        // dependency check (basic)
        for(let dep of mod.dependencies){
            if(!ModLoader.mods[dep]){
                console.warn("Missing dependency:", dep);
            }
        }

        // conflict detection
        const conflicts = detectConflicts(code, id);
        if(conflicts.length){
            ModLoader.conflicts.push({id, conflicts});
            console.warn("Conflicts:", id, conflicts);
        }

        // execute
        const ok = runCode(code, id);

        if(ok){
            ModLoader.loaded.push(id);
            console.log("Loaded mod:", id, "version:", version);
        }

    } catch(e){
        ModLoader.errors.push({url, error:e});
        console.log("Load fail:", url, e);
    }
}

// =============================
// LOAD ALL MODS
// =============================

async function loadAllMods(){

    console.log("Loading mods...");

    for(let url of MODS){
        await loadMod(url);
    }

    console.log("All mods loaded:", ModLoader.loaded.length);
}

// =============================
// ENABLE / DISABLE MOD
// =============================

function toggleMod(id){

    const mod = ModLoader.mods[id];
    if(!mod) return;

    mod.enabled = !mod.enabled;

    console.log((mod.enabled ? "Enabled" : "Disabled"), id);

    if(mod.enabled){
        runCode(mod.code, id);
    } else {
        location.reload(); // safe fallback (sandbox limitation)
    }
}

// =============================
// HOT RELOAD (SAFE)
// =============================

async function reloadMod(id){

    const mod = ModLoader.mods[id];
    if(!mod) return;

    console.log("Reloading:", id);

    await loadMod(mod.url, id);
}

// =============================
// MOBILE UI PANEL
// =============================

function createUI(){

    const ui = document.createElement("div");

    ui.style = `
        position:fixed;
        bottom:10px;
        right:10px;
        background:rgba(0,0,0,0.85);
        color:white;
        padding:10px;
        z-index:99999;
        font-family:monospace;
        border-radius:8px;
        width:220px;
    `;

    ui.innerHTML = `
        <div>🔥 Mod Loader V2</div>
        <button id="loadMods">Load</button>
        <button id="reloadAll">Reload</button>
        <button id="showMods">Mods</button>
    `;

    document.body.appendChild(ui);

    document.getElementById("loadMods").onclick = loadAllMods;
    document.getElementById("reloadAll").onclick = () => location.reload();

    document.getElementById("showMods").onclick = () => {
        alert(
            "Loaded:\n" + ModLoader.loaded.join("\n") +
            "\n\nErrors:\n" + JSON.stringify(ModLoader.errors, null, 2) +
            "\n\nConflicts:\n" + JSON.stringify(ModLoader.conflicts, null, 2)
        );
    };
}

// =============================
// INIT
// =============================

function initModLoader(){
    console.log("Mod Loader V2 booting...");
    createUI();
    setTimeout(loadAllMods, 1000);
}

initModLoader();

console.log("Mod Loader V2 ready");