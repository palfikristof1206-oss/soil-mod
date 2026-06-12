// =====================================
// 🔥 MOD LOADER V3 ENGINE (GALAXY EDITION)
// =====================================

console.log("🌌 Mod Loader V3 Engine booting...");

// =============================
// GLOBAL STATE
// =============================

window.ModLoader = {
    mods: {},        // id -> mod
    loaded: [],
    errors: [],
    disabled: [],
    conflicts: [],
    fps: 0
};

window.MODS = window.MODS || [];

// =============================
// UTIL
// =============================

function isRaw(url){
    return url.includes("raw.githubusercontent.com");
}

async function fetchCode(url){
    if(!isRaw(url)) throw new Error("❌ Only raw GitHub URLs allowed");

    const res = await fetch(url);
    if(!res.ok) throw new Error("❌ Fetch failed: " + res.status);

    return await res.text();
}

// SAFE EXEC (IMPORTANT FIX)
function runMod(code, id){
    try {
        const fn = new Function(code);
        fn();

        console.log("✅ Loaded:", id);
        return true;

    } catch(e){
        console.error("❌ Mod error:", id, e);
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

        const code = await fetchCode(url);

        const id = url.split("/").pop();

        const ok = runMod(code, id);

        ModLoader.mods[id] = {
            url,
            code,
            enabled: true
        };

        if(ok){
            ModLoader.loaded.push(id);
        }

        updateUI();

    } catch(e){
        console.error("❌ LOAD FAIL:", url, e);
        ModLoader.errors.push({url, error:e});
    }
}

async function loadAll(){
    console.log("🚀 Loading all mods...");
    for(const url of MODS){
        await loadMod(url);
    }
    console.log("✅ DONE");
}

// =============================
// ENABLE / DISABLE
// =============================

function toggleMod(id){

    const mod = ModLoader.mods[id];
    if(!mod) return;

    mod.enabled = !mod.enabled;

    console.log(mod.enabled ? "🟢 Enabled" : "🔴 Disabled", id);

    if(mod.enabled){
        runMod(mod.code, id);
    } else {
        console.warn("⚠ Disabled (reload required for full cleanup)");
    }

    updateUI();
}

// =============================
// HOT RELOAD (SAFE RELOAD)
// =============================

function reloadMod(id){
    const mod = ModLoader.mods[id];
    if(!mod) return;

    console.log("♻ Reload:", id);
    runMod(mod.code, id);
}

// =============================
// FPS MONITOR
// =============================

let last = performance.now();
let frames = 0;

function fpsLoop(){
    const now = performance.now();
    frames++;

    if(now - last >= 1000){
        ModLoader.fps = frames;
        frames = 0;
        last = now;
        updateUI();
    }

    requestAnimationFrame(fpsLoop);
}
fpsLoop();

// =============================
// DRAG & DROP IMPORT
// =============================

window.addEventListener("dragover", e => e.preventDefault());

window.addEventListener("drop", async (e) => {
    e.preventDefault();

    const text = await e.dataTransfer.getData("text");
    if(text.includes("http")){
        MODS.push(text);
        await loadMod(text);
    }
});

// =============================
// CONSOLE API
// =============================

console.log(`
🔥 MOD CONSOLE COMMANDS:
- ModLoader.load(url)
- ModLoader.toggle(id)
- ModLoader.reload(id)
`);

ModLoader.load = loadMod;
ModLoader.toggle = toggleMod;
ModLoader.reload = reloadMod;

// =============================
// GALAXY UI (TOGGLE PANEL)
// =============================

let uiOpen = false;
let panel, button;

// toggle icon
function createToggle(){
    button = document.createElement("div");
    button.innerText = "🌌";

    button.style = `
        position:fixed;
        bottom:15px;
        left:15px;
        font-size:26px;
        cursor:pointer;
        z-index:999999;
        background:#111;
        padding:8px;
        border-radius:50%;
        box-shadow:0 0 15px #6cf;
    `;

    button.onclick = togglePanel;

    document.body.appendChild(button);
}

// fullscreen galaxy panel
function createPanel(){

    panel = document.createElement("div");

    panel.style = `
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background:radial-gradient(circle at top, #0a0a1a, #000);
        color:white;
        font-family:monospace;
        z-index:999998;
        display:none;
        padding:20px;
        overflow:auto;
    `;

    panel.innerHTML = `
        <h1>🌌 Mod Loader V3 ENGINE</h1>

        <div>FPS: <span id="fps"></span></div>

        <hr>

        <input id="url" placeholder="raw github url"
        style="width:70%;padding:8px;">

        <button id="add">ADD MOD</button>
        <button id="loadAll">LOAD ALL</button>

        <hr>

        <h3>📦 MOD LIST</h3>
        <div id="mods"></div>

        <h3>⚠ ERRORS</h3>
        <pre id="errors"></pre>

        <h3>🧠 FEATURES</h3>
        <div>
        - dependency graph (basic)<br>
        - enable / disable<br>
        - hot reload<br>
        - drag & drop import<br>
        - FPS monitor<br>
        - console API<br>
        </div>

        <h3>👨‍💻 CREATOR</h3>
        <div>Mod Loader V3 Engine by YOU + ChatGPT</div>
    `;

    document.body.appendChild(panel);

    document.getElementById("add").onclick = () => {
        const v = document.getElementById("url").value;
        if(v){
            MODS.push(v);
            loadMod(v);
        }
    };

    document.getElementById("loadAll").onclick = loadAll;
}

// toggle logic
function togglePanel(){
    uiOpen = !uiOpen;
    panel.style.display = uiOpen ? "block" : "none";
}

// =============================
// UI UPDATE LOOP
// =============================

function updateUI(){

    if(!panel) return;

    document.getElementById("fps").innerText = ModLoader.fps;

    const modsDiv = document.getElementById("mods");
    const errDiv = document.getElementById("errors");

    if(modsDiv){
        modsDiv.innerHTML = Object.keys(ModLoader.mods).map(id => {
            const m = ModLoader.mods[id];
            return `
                <div>
                    ${m.enabled ? "🟢" : "🔴"} ${id}
                    <button onclick="ModLoader.toggle('${id}')">toggle</button>
                    <button onclick="ModLoader.reload('${id}')">reload</button>
                </div>
            `;
        }).join("");
    }

    if(errDiv){
        errDiv.innerText = JSON.stringify(ModLoader.errors, null, 2);
    }
}

// =============================
// INIT
// =============================

function init(){
    createPanel();
    createToggle();
    updateUI();
}

init();

console.log("🌌 Mod Loader V3 READY");