// =====================================
// 🔥 Sandboxels Mod Loader V4 ENGINE
// =====================================

console.log("🔥 V4 ENGINE BOOTING...");

window.ModLoader = {
    mods: {},
    order: [],
    loaded: [],
    errors: [],
    disabled: new Set(),
    graph: {},
};

// =============================
// GLOBAL MOD LIST
// =============================
window.MODS = window.MODS || [];

// =============================
// FETCH
// =============================
async function fetchMod(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error("Fetch failed " + res.status);
    return await res.text();
}

// =============================
// RUN MOD (SAFE SANDBOXELS CONTEXT)
// =============================
function runMod(code, id){
    try {
        const fn = new Function("elements","behaviors","console", code);
        fn(window.elements, window.behaviors, console);

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

        ModLoader.graph[id] = [];

        const ok = runMod(code, id);

        if(ok){
            ModLoader.mods[id] = {
                url,
                code,
                enabled: true
            };

            ModLoader.loaded.push(id);
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
// HOT RELOAD (REAL)
// =============================
async function reloadMod(id){
    const mod = ModLoader.mods[id];
    if(!mod) return;

    console.log("♻ RELOAD:", id);
    await loadMod(mod.url);
}

// =============================
// UI (GALAXY STYLE)
// =============================
function createUI(){

    const ui = document.createElement("div");

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
        <div style="width:300px;padding:10px;border-right:1px solid #222;">

            <h2>🔥 MOD LOADER V4</h2>

            <input id="url" placeholder="GitHub RAW mod"
                style="width:100%;padding:6px;"><br><br>

            <button id="add">ADD</button>
            <button id="load">LOAD ALL</button>

            <hr>

            <div id="mods"></div>

            <hr>

            <b>STATUS:</b>
            <div id="status"></div>

        </div>

        <div style="flex:1;padding:10px;">
            <h3>📡 LOG CONSOLE</h3>
            <pre id="console"></pre>
        </div>
    `;

    document.body.appendChild(ui);

    document.getElementById("add").onclick = () => {
        const v = document.getElementById("url").value;
        if(v) MODS.push(v);
        updateUI();
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
// START
// =============================
createUI();
console.log("🔥 V4 ENGINE READY");