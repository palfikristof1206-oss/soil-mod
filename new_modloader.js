// =====================================
// 🔥 Sandboxels Mod Loader V4 ULTIMATE
// =====================================

console.log("🔥 V4 ULTIMATE BOOTING...");

// =============================
// STATE
// =============================

window.ModLoader = {
    mods: {},
    order: [],
    loaded: [],
    errors: [],
    disabled: new Set(),
    graph: {}
};

window.MODS = window.MODS || [];

// =============================
// 💾 PERSISTENCE SYSTEM (FIX)
// =============================

const STORAGE_KEY = "sandboxels_mods_v4";

function saveMods(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MODS));
    console.log("💾 Mods saved");
}

function loadSavedMods(){
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if(Array.isArray(data)){
            MODS.length = 0;
            MODS.push(...data);
            console.log("📦 Loaded saved mods:", data.length);
        }
    } catch(e){
        console.log("❌ Storage load failed");
    }
}

// =============================
// 🌌 GUI SAFETY FILTER (FIX INVALID GUI SPAM)
// =============================

const GUI_BLOCK = new Set([
    "tpsButton",
    "copyrightLabel",
    "saves",
    "savePromptTitle",
    "modWarning",
    "settingLabel-cheerful",
    "settingLabel-worldgen",
    "setting-worldgen-off"
]);

function safeGui(name){
    if(GUI_BLOCK.has(name)){
        console.warn("⚠ GUI blocked:", name);
        return false;
    }
    return true;
}

// =============================
// ELEMENT REGISTER (FIXED)
// =============================

window.registerElement = function(name, data){

    if(!window.elements) window.elements = {};

    elements[name] = data;

    if(window.updatePalette) window.updatePalette();
    if(window.rebuildPalette) window.rebuildPalette();

    console.log("🧱 Element registered:", name);
};

// =============================
// FETCH MOD
// =============================

async function fetchMod(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error("Fetch failed " + res.status);
    return await res.text();
}

// =============================
// RUN MOD SAFE
// =============================

function runMod(code, id){
    try {
        const fn = new Function(
            "window",
            "elements",
            "behaviors",
            "registerElement",
            "console",
            "safeGui",
            code
        );

        fn(window, window.elements, window.behaviors, window.registerElement, console, safeGui);

        console.log("✅ MOD LOADED:", id);
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

        console.log("⬇ Loading:", url);

        const code = await fetchMod(url);
        const id = url.split("/").pop();

        const ok = runMod(code, id);

        if(ok){
            ModLoader.mods[id] = {
                url,
                code,
                enabled: true
            };

            if(!ModLoader.loaded.includes(id)){
                ModLoader.loaded.push(id);
            }
        }

        updateUI();

    } catch(e){
        console.error("LOAD FAIL:", url, e);
        ModLoader.errors.push({url, error:e});
    }
}

// =============================
// LOAD ALL
// =============================

async function loadAll(){
    for(const url of MODS){
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
    console.log(mod.enabled ? "🟢 ENABLED" : "🔴 DISABLED", id);
}

// =============================
// HOT RELOAD (SAFE)
// =============================

async function reloadMod(id){
    const mod = ModLoader.mods[id];
    if(!mod) return;

    console.log("♻ RELOAD:", id);
    await loadMod(mod.url);
}

// =============================
// 🌌 UI TOGGLE BUTTON
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
    font-size:20px;
    cursor:pointer;
    z-index:1000000;
    box-shadow:0 0 15px rgba(0,200,255,0.8);
    user-select:none;
`;

document.body.appendChild(toggleBtn);

// =============================
// UI STATE
// =============================

window.__modUIOpen = true;

// =============================
// FULLSCREEN UI
// =============================

function createUI(){

    const ui = document.createElement("div");
    ui.id = "modUI";

    ui.style = `
        position:fixed;
        inset:0;
        background: radial-gradient(circle at center,#0a0f2a,#000);
        color:white;
        font-family:monospace;
        z-index:999999;
        display:flex;
    `;

    ui.innerHTML = `
        <div style="width:320px;padding:10px;border-right:1px solid #222;">

            <h2>🔥 MOD LOADER V4 ULTIMATE</h2>

            <input id="url" placeholder="GitHub RAW mod"
                style="width:100%;padding:6px;"><br><br>

            <button id="add">ADD</button>
            <button id="load">LOAD ALL</button>
            <button id="clear">CLEAR</button>

            <hr>

            <div id="mods"></div>

            <hr>

            <b>STATUS:</b>
            <div id="status"></div>

        </div>

        <div style="flex:1;padding:10px;">
            <h3>📡 CONSOLE</h3>
            <pre id="console"></pre>
        </div>
    `;

    document.body.appendChild(ui);

    document.getElementById("add").onclick = () => {
        const v = document.getElementById("url").value;
        if(v){
            MODS.push(v);
            saveMods(); // 💾 IMPORTANT FIX
        }
        updateUI();
    };

    document.getElementById("load").onclick = loadAll;

    document.getElementById("clear").onclick = () => {
        document.getElementById("console").innerText = "";
    };
}

// =============================
// UI UPDATE
// =============================

function updateUI(){

    const box = document.getElementById("mods");
    if(!box) return;

    box.innerHTML = "";

    for(let id in ModLoader.mods){
        const m = ModLoader.mods[id];

        box.innerHTML += `
            <div>
                ${m.enabled ? "🟢" : "🔴"} ${id}
                <button onclick="toggleMod('${id}')">toggle</button>
                <button onclick="reloadMod('${id}')">reload</button>
            </div>
        `;
    }

    const status = document.getElementById("status");
    if(status){
        status.innerHTML =
            `Loaded: ${ModLoader.loaded.length}<br>` +
            `Errors: ${ModLoader.errors.length}`;
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
// UI TOGGLE
// =============================

toggleBtn.onclick = () => {

    const ui = document.getElementById("modUI");
    if(!ui) return;

    window.__modUIOpen = !window.__modUIOpen;
    ui.style.display = window.__modUIOpen ? "flex" : "none";
};

// =============================
// INIT
// =============================

loadSavedMods();   // 💾 AUTO RESTORE
createUI();

setTimeout(loadAll, 1000);

console.log("🔥 V4 ULTIMATE READY");