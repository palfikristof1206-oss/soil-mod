console.log("🔥 V7 ORDER FIX BOOTING...");

// =============================
// STATE
// =============================

window.ModLoader = {
    mods: {},
    loaded: [],
    errors: []
};

window.MODS = window.MODS || [];

const STORAGE_KEY = "sandboxels_mods_v7";

// =============================
// ELEMENT SYSTEM INIT
// =============================

window.elements = window.elements || {};
window.elements.__registry = window.elements.__registry || {};
window.elements.__categories = window.elements.__categories || {};

// =============================
// 💾 SAVE / LOAD
// =============================

function saveMods(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MODS));
    console.log("💾 Saved mods");
}

function loadSavedMods(){
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if(Array.isArray(data)){
            MODS.length = 0;
            MODS.push(...data);
            console.log("📦 Restored mods:", data.length);
        }
    } catch(e){
        console.log("❌ Load storage failed");
    }
}

// =============================
// 🧱 REGISTER ELEMENT (ONLY SOURCE OF TRUTH)
// =============================

window.registerElement = function(name, data){

    window.elements[name] = data;

    window.elements.__registry[name] = {
        ts: Date.now(),
        category: data.category || "uncategorized"
    };

    const cat = data.category || "uncategorized";

    if(!window.elements.__categories[cat]){
        window.elements.__categories[cat] = [];
    }

    if(!window.elements.__categories[cat].includes(name)){
        window.elements.__categories[cat].push(name);
    }

    console.log("🧱 REGISTERED:", name, "→", cat);
};

// =============================
// 🔥 UI REFRESH (AFTER EXECUTION ONLY)
// =============================

function refreshUI(){
    window.rebuildPalette?.();
    window.updatePalette?.();
    window.dispatchEvent(new Event("resize"));
}

// =============================
// 🧠 COMPILER (sima mod format → registerElement)
// =============================

function compileMod(code){

    return code.split("\n").map(line => {

        line = line.trim();

        if(!line || line.startsWith("//")) return "";

        const m = line.match(/^([a-zA-Z0-9_]+)\s*=\s*(\{[\s\S]*\})$/);

        if(m){
            return `registerElement("${m[1]}", ${m[2]});`;
        }

        return line;
    }).join("\n");
}

// =============================
// FETCH (STEP 1)
// =============================

async function fetchMod(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error("Fetch failed " + res.status);
    return await res.text();
}

// =============================
// EXECUTE MOD (STEP 3)
// =============================

function runMod(code, id){

    try {
        const compiled = compileMod(code);

        new Function(
            "window",
            "elements",
            "registerElement",
            compiled
        )(window, window.elements, window.registerElement);

        console.log("✅ LOADED:", id);
        return true;

    } catch(e){
        console.error("❌ MOD ERROR:", id, e);
        ModLoader.errors.push({id, error:e});
        return false;
    }
}

// =============================
// LOAD MOD (CORRECT ORDER)
// =============================

async function loadMod(url){

    try {

        // 1. FETCH
        const code = await fetchMod(url);
        const id = url.split("/").pop();

        // 2. EXECUTE (registry happens HERE)
        const ok = runMod(code, id);

        // 3. STORE STATE
        if(ok){
            ModLoader.mods[id] = {url, code};

            if(!ModLoader.loaded.includes(id)){
                ModLoader.loaded.push(id);
            }
        }

        // 4. SYNC AFTER EXECUTION (IMPORTANT)
        queueMicrotask(refreshUI);

        updateUI();

    } catch(e){
        console.error("LOAD FAIL:", url, e);
    }
}

// =============================
// LOAD ALL
// =============================

async function loadAll(){

    console.log("🚀 Loading mods...");

    for(const url of MODS){
        await loadMod(url);
    }

    console.log("✅ DONE");
}

// =============================
// AUTO REAPPLY
// =============================

async function autoReapplyMods(){
    console.log("♻ Reapplying mods...");

    for(const url of MODS){
        await loadMod(url);
    }
}

// =============================
// FORCE SYNC (SAFE BACKUP ONLY)
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
// UI
// =============================

function createUI(){

    if(document.getElementById("modUI")) return;

    const ui = document.createElement("div");
    ui.id = "modUI";

    ui.style = `
        position:fixed;
        inset:0;
        background:#050816;
        color:white;
        font-family:monospace;
        display:flex;
        z-index:999999;
    `;

    ui.innerHTML = `
        <div style="width:300px;padding:10px;border-right:1px solid #222;">
            <h2>🔥 MOD LOADER V7 FIXED</h2>

            <input id="url" style="width:100%;padding:6px;" placeholder="mod url">

            <button id="add">ADD</button>
            <button id="load">LOAD</button>

            <div id="mods"></div>
        </div>

        <div style="flex:1;padding:10px;">
            <pre id="console"></pre>
        </div>
    `;

    document.body.appendChild(ui);

    document.getElementById("add").onclick = () => {
        const v = document.getElementById("url").value;
        if(v){
            MODS.push(v);
            saveMods();
        }
    };

    document.getElementById("load").onclick = loadAll;
}

// =============================
// UI UPDATE
// =============================

function updateUI(){
    const box = document.getElementById("mods");
    if(!box) return;

    box.innerHTML = "";

    for(const id in ModLoader.mods){
        box.innerHTML += `<div>🟢 ${id}</div>`;
    }
}

// =============================
// INIT
// =============================

loadSavedMods();
createUI();

setInterval(forceRegistryCommit, 2000);

console.log("🔥 V7 ORDER FIX READY");