console.log("🔥 V4 ULTIMATE FIXED BOOTING...");

// =============================
// STATE
// =============================

window.ModLoader = {
    mods: {},
    loaded: [],
    errors: []
};

window.MODS = window.MODS || [];

const STORAGE_KEY = "sandboxels_mods_v4";

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
// 🧱 ELEMENT REGISTRY (FULL FIXED)
// =============================

if(!window.elements) window.elements = {};

window.registerElement = function(name, data){

    // CORE REGISTER
    elements[name] = data;

    // CATEGORY SYSTEM FIX
    if(!elements.__categories){
        elements.__categories = {};
    }

    const cat = data.category || "uncategorized";

    if(!elements.__categories[cat]){
        elements.__categories[cat] = [];
    }

    if(!elements.__categories[cat].includes(name)){
        elements.__categories[cat].push(name);
    }

    // FORCE SANDBOXELS UI REFRESH
    const refresh = () => {
        if(typeof window.rebuildPalette === "function") window.rebuildPalette();
        if(typeof window.updatePalette === "function") window.updatePalette();

        window.dispatchEvent(new Event("resize"));
    };

    requestAnimationFrame(refresh);
    setTimeout(refresh, 50);

    console.log("🧱 REGISTERED:", name, "→", cat);
};

// =============================
// 🧠 OPTIONAL: MOD FORMAT CONVERTER (HOOK)
// =============================
// ha valaki sima formát ír:
// sus_block = { ... }
// akkor ezt átalakítja registerElement-re

function compileMod(code){

    const lines = code.split("\n");
    const out = [];

    for(let line of lines){

        line = line.trim();

        if(!line || line.startsWith("//")) continue;

        const m = line.match(/^([a-zA-Z0-9_]+)\s*=\s*(\{[\s\S]*\})$/);

        if(m){
            out.push(`registerElement("${m[1]}", ${m[2]});`);
        } else {
            out.push(line);
        }
    }

    return out.join("\n");
}

// =============================
// FETCH
// =============================

async function fetchMod(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error("Fetch failed " + res.status);
    return await res.text();
}

// =============================
// RUN MOD (WITH COMPILER)
// =============================

function runMod(code, id){

    try {

        const compiled = compileMod(code);

        const fn = new Function(
            "window",
            "elements",
            "registerElement",
            "console",
            compiled
        );

        fn(window, window.elements, window.registerElement, console);

        console.log("✅ LOADED:", id);
        return true;

    } catch(e){
        console.error("❌ MOD ERROR:", id, e);
        ModLoader.errors.push({id, error:e});
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
            ModLoader.mods[id] = {url, code};
            if(!ModLoader.loaded.includes(id)){
                ModLoader.loaded.push(id);
            }
        }

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
// UI BUTTON
// =============================

const toggleBtn = document.createElement("div");
toggleBtn.innerHTML = "🔥";

toggleBtn.style = `
position:fixed;
bottom:15px;
left:15px;
width:52px;
height:52px;
border-radius:50%;
background:linear-gradient(45deg,#7b2cff,#00d4ff);
display:flex;
align-items:center;
justify-content:center;
cursor:pointer;
z-index:999999;
box-shadow:0 0 15px rgba(0,200,255,0.8);
`;

document.body.appendChild(toggleBtn);

// =============================
// UI
// =============================

function createUI(){

    const ui = document.createElement("div");
    ui.id = "modUI";

    ui.style = `
        position:fixed;
        inset:0;
        background: radial-gradient(circle at center,#050816,#000);
        color:white;
        font-family:monospace;
        display:flex;
        z-index:999998;
    `;

    ui.innerHTML = `
        <div style="width:320px;padding:10px;border-right:1px solid #222;">

            <h2>🔥 MOD LOADER V4</h2>

            <input id="url" placeholder="RAW github mod"
                style="width:100%;padding:6px;"><br><br>

            <button id="add">ADD</button>
            <button id="load">LOAD</button>

            <hr>

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
            updateUI();
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
// CONSOLE HOOK
// =============================

(function(){
    const log = console.log;
    console.log = function(...args){
        log(...args);
        const c = document.getElementById("console");
        if(c) c.innerText += args.join(" ") + "\n";
    };
})();

// =============================
// TOGGLE UI
// =============================

toggleBtn.onclick = () => {
    const ui = document.getElementById("modUI");
    if(!ui) return;
    ui.style.display = (ui.style.display === "none") ? "flex" : "none";
};

// =============================
// INIT
// =============================

loadSavedMods();
createUI();

setTimeout(() => {
    autoReapplyMods();
}, 1200);

console.log("🔥 V4 ULTIMATE READY");