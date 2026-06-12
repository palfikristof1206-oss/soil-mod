console.log("🔥 V6 ULTIMATE FIXED BOOTING...");

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
// 🧱 SINGLE TRUE REGISTER SYSTEM
// =============================

if(!window.elements) window.elements = {};
window.elements.__registry = window.elements.__registry || {};
window.elements.__categories = window.elements.__categories || {};

window.registerElement = function(name, data){

    // CORE STORE
    window.elements[name] = data;

    // REGISTRY MARK
    window.elements.__registry[name] = true;

    // CATEGORY INDEX
    const cat = data.category || "uncategorized";

    if(!window.elements.__categories[cat]){
        window.elements.__categories[cat] = [];
    }

    if(!window.elements.__categories[cat].includes(name)){
        window.elements.__categories[cat].push(name);
    }

    // HARD REFRESH (3 STAGE)
    const refresh = () => {
        if(window.rebuildPalette) window.rebuildPalette();
        if(window.updatePalette) window.updatePalette();
        window.dispatchEvent(new Event("resize"));
    };

    requestAnimationFrame(refresh);
    setTimeout(refresh, 10);
    setTimeout(refresh, 100);

    console.log("🧱 REGISTERED:", name, "→", cat);
};

// =============================
// 🔁 FORCE SYNC ENGINE (IMPORTANT)
// =============================

function forceRegistryCommit(){

    if(!window.elements) return;

    for(const key in window.elements){

        if(key.startsWith("__")) continue;

        if(!window.elements.__registry[key]){
            window.registerElement(key, window.elements[key]);
        }
    }

    if(window.rebuildPalette) window.rebuildPalette();
    if(window.updatePalette) window.updatePalette();

    console.log("💾 REGISTRY FULL SYNC DONE");
}

setInterval(forceRegistryCommit, 1000);

// =============================
// 🧠 MOD COMPILER (SIMPLE + SAFE)
// =============================

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
// RUN MOD
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
// UI
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
// UI TOGGLE
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

console.log("🔥 V6 READY");