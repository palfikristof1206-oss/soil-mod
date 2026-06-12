// =====================================
// 🔥 Sandboxels Mod Loader V3 ENGINE
// =====================================

console.log("🌌 Mod Loader V3 ENGINE booting...");

// =============================
// STATE
// =============================

window.ModLoader = {
    mods: {},
    loaded: [],
    errors: [],
    disabled: [],
    store: [],
};

// MOD LIST (legacy support)
window.MODS = window.MODS || [];

// =============================
// SANDBOX API (IMPORTANT)
// =============================

window.ModAPI = {
    registerElement(name, data){
        if(window.elements && !elements[name]){
            elements[name] = data;
        }
    },
    log(msg){
        console.log("[MOD]", msg);
    }
};

// =============================
// FETCH
// =============================

async function fetchText(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error("Fetch fail " + res.status);
    return await res.text();
}

// =============================
// VERSION DETECT
// =============================

function detectVersion(code){
    if(code.includes("v3.1")) return "v3.1";
    if(code.includes("v3.0")) return "v3.0";
    if(code.includes("EXPANSION")) return "pack";
    return "unknown";
}

// =============================
// MANIFEST PARSER
// =============================

function parseManifest(code){
    try{
        const m = code.match(/\/\*\s*MOD_MANIFEST([\s\S]*?)\*\//);
        if(m) return JSON.parse(m[1]);
    }catch(e){}
    return null;
}

// =============================
// EXEC ENGINE (SAFE WRAP)
// =============================

function run(code, id){
    try {
        const fn = new Function("ModAPI", code);
        fn(window.ModAPI);

        console.log("✅ Loaded:", id);
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

        const code = await fetchText(url);
        const id = url.split("/").pop();

        const manifest = parseManifest(code);
        const version = detectVersion(code);

        const mod = {
            id,
            url,
            code,
            manifest,
            version,
            enabled: true,
            deps: manifest?.deps || []
        };

        ModLoader.mods[id] = mod;

        // dependency warning
        for(const d of mod.deps){
            if(!ModLoader.mods[d]){
                console.warn("⚠ Missing dependency:", d);
            }
        }

        const ok = run(code, id);

        if(ok){
            ModLoader.loaded.push(id);
        }

        updateUI();

    } catch(e){
        ModLoader.errors.push({url, error:e});
        console.error("LOAD FAIL:", url, e);
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
    const m = ModLoader.mods[id];
    if(!m) return;

    m.enabled = !m.enabled;

    if(!m.enabled){
        ModLoader.disabled.push(id);
    }

    updateUI();
}

// =============================
// HOT RELOAD
// =============================

async function reloadMod(id){
    const m = ModLoader.mods[id];
    if(!m) return;
    await loadMod(m.url);
}

// =============================
// 🌌 GALAXY UI
// =============================

function createUI(){

    const btn = document.createElement("div");
    btn.innerHTML = "🌌 MODS";
    btn.style = `
        position:fixed;
        bottom:15px;
        left:15px;
        background:#0b0b0b;
        color:#00ffe5;
        padding:12px;
        border-radius:50px;
        cursor:pointer;
        font-family:monospace;
        z-index:999999;
        box-shadow:0 0 20px #00ffe5;
    `;

    document.body.appendChild(btn);

    const panel = document.createElement("div");
    panel.style = `
        position:fixed;
        top:0;
        left:0;
        width:100vw;
        height:100vh;
        background:radial-gradient(circle,#050510,#000);
        color:white;
        display:none;
        z-index:999998;
        font-family:monospace;
        overflow:auto;
    `;

    panel.innerHTML = `
        <div style="padding:20px;">
            <h2>🌌 MOD LOADER V3 ENGINE</h2>

            <input id="url" placeholder="GitHub RAW URL"
            style="width:70%;padding:8px;">

            <button id="add">ADD</button>
            <button id="load">LOAD ALL</button>

            <hr>

            <div id="list"></div>

            <pre id="debug"></pre>
        </div>
    `;

    document.body.appendChild(panel);

    btn.onclick = () => {
        panel.style.display = panel.style.display === "none" ? "block" : "none";
        updateUI();
    };

    panel.querySelector("#add").onclick = () => {
        const v = panel.querySelector("#url").value;
        if(v) MODS.push(v);
        updateUI();
    };

    panel.querySelector("#load").onclick = loadAll;

    updateUI();
}

// =============================
// UI UPDATE
// =============================

function updateUI(){

    const list = document.querySelector("#list");
    const debug = document.querySelector("#debug");

    if(!list) return;

    list.innerHTML = "";

    for(const id in ModLoader.mods){
        const m = ModLoader.mods[id];

        const div = document.createElement("div");
        div.innerHTML = `
            ${m.enabled ? "🟢" : "🔴"} ${id}
            <button onclick="toggleMod('${id}')">toggle</button>
        `;

        list.appendChild(div);
    }

    if(debug){
        debug.textContent =
`Loaded: ${ModLoader.loaded.length}
Errors: ${ModLoader.errors.length}
Mods: ${Object.keys(ModLoader.mods).length}`;
    }
}

// =============================
// START
// =============================

createUI();

console.log("🌌 MOD LOADER V3 ENGINE READY");