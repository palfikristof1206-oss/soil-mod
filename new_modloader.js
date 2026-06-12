// =====================================
// Sandboxels Mod Loader V2.1 (CLEAN UI)
// =====================================

console.log("Mod Loader V2.1 initializing...");

// =============================
// GLOBAL STATE
// =============================

window.ModLoader = {
    mods: {},
    order: [],
    loaded: [],
    disabled: [],
    errors: [],
    conflicts: [],
};

// =============================
// CONFIG
// =============================

const MODS = [
    // "https://raw.githubusercontent.com/user/repo/main/mod.js"
];

// =============================
// FETCH
// =============================

async function fetchText(url){
    const res = await fetch(url);
    return await res.text();
}

// =============================
// VERSION DETECT
// =============================

function detectVersion(code){
    if(code.includes("v3.1")) return "v3.1";
    if(code.includes("v3.0")) return "v3.0";
    if(code.includes("Expansion Pack")) return "pack";
    return "unknown";
}

// =============================
// MANIFEST
// =============================

function parseManifest(code){
    try {
        const match = code.match(/\/\*\s*MOD_MANIFEST\s*([\s\S]*?)\*\//);
        if(match) return JSON.parse(match[1]);
    } catch(e){}
    return null;
}

// =============================
// SAFE RUN
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
// LOAD MOD
// =============================

async function loadMod(url, id = null){

    try {

        const code = await fetchText(url);
        const manifest = parseManifest(code);
        const version = detectVersion(code);

        id = id || url;

        ModLoader.mods[id] = {
            id,
            url,
            code,
            manifest,
            version,
            enabled: true,
            dependencies: manifest?.dependencies || []
        };

        const ok = runCode(code, id);

        if(ok){
            ModLoader.loaded.push(id);
            console.log("Loaded:", id, version);
        }

    } catch(e){
        ModLoader.errors.push({url, error:e});
    }
}

// =============================
// LOAD ALL
// =============================

async function loadAllMods(){
    console.log("Loading mods...");
    for(const url of MODS){
        await loadMod(url);
    }
    console.log("Loaded mods:", ModLoader.loaded.length);
}

// =============================
// TOGGLE MOD
// =============================

function toggleMod(id){
    const mod = ModLoader.mods[id];
    if(!mod) return;

    mod.enabled = !mod.enabled;
}

// =============================
// UI (🔥 10★ GLASS DESIGN)
// =============================

function createUI(){

    const ui = document.createElement("div");

    ui.style.cssText = `
        position:fixed;
        bottom:12px;
        left:12px;
        width:260px;
        max-height:320px;
        overflow:auto;

        background:rgba(20,20,20,0.65);
        backdrop-filter: blur(12px);

        border:1px solid rgba(255,255,255,0.12);
        border-radius:14px;

        color:white;
        font-family:monospace;
        z-index:999999;

        box-shadow:0 8px 25px rgba(0,0,0,0.4);
        padding:10px;
    `;

    ui.innerHTML = `
        <div style="
            font-size:14px;
            font-weight:bold;
            margin-bottom:8px;
            color:#00ffcc;
        ">
            🔥 Mod Loader V2.1
        </div>

        <button id="loadModsBtn">Load Mods</button>
        <button id="reloadBtn">Reload</button>
        <button id="logsBtn">Logs</button>

        <hr style="border:0;border-top:1px solid #333;margin:8px 0;">

        <div id="modList" style="font-size:12px;"></div>
    `;

    document.body.appendChild(ui);

    // buttons
    document.getElementById("loadModsBtn").onclick = loadAllMods;
    document.getElementById("reloadBtn").onclick = () => location.reload();

    document.getElementById("logsBtn").onclick = () => {
        alert(
            "LOADED:\n" + ModLoader.loaded.join("\n") +
            "\n\nERRORS:\n" + JSON.stringify(ModLoader.errors, null, 2)
        );
    };

    // LIVE MOD LIST
    setInterval(() => {

        const list = document.getElementById("modList");
        if(!list) return;

        let html = "";

        for(const id in ModLoader.mods){
            const m = ModLoader.mods[id];

            html += `
                <div style="
                    padding:4px;
                    margin:4px 0;
                    border-radius:6px;
                    background:rgba(255,255,255,0.05);
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                ">
                    <span>
                        ${m.enabled ? "🟢" : "🔴"} ${id}
                    </span>

                    <button onclick="toggleMod('${id}')"
                        style="
                            font-size:10px;
                            padding:2px 6px;
                        ">
                        toggle
                    </button>
                </div>
            `;
        }

        list.innerHTML = html;

    }, 500);
}

// =============================
// INIT
// =============================

function initModLoader(){
    createUI();
    setTimeout(loadAllMods, 1000);
}

initModLoader();

console.log("Mod Loader V2.1 READY");