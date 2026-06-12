// =====================================
// 🌌 Sandboxels Mod Loader V3.1 FIXED
// =====================================

console.log("🌌 V3.1 FIXED ENGINE booting...");

// =============================
// STATE
// =============================

window.ModLoader = {
    mods: {},
    loaded: [],
    errors: [],
    disabled: [],
};

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
// ⭐ REAL SANDBOX EXEC (IMPORTANT FIX)
// =============================
// Sandboxels kompatibilis global eval

function runMod(code, id){
    try {

        // direct eval = Sandboxels kompatibilitás
        (0, eval)(code);

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

        console.log("⬇ Loading:", url);

        const code = await fetchMod(url);

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
// TOGGLE
// =============================

function toggle(id){
    const m = ModLoader.mods[id];
    if(!m) return;

    m.enabled = !m.enabled;

    console.log(m.enabled ? "🟢 ENABLED" : "🔴 DISABLED", id);

    updateUI();
}

// =============================
// 🌌 GALAXY UI (REAL STYLE FIX)
// =============================

function createUI(){

    const btn = document.createElement("div");
    btn.innerText = "🌌 MODS";
    btn.style = `
        position:fixed;
        bottom:18px;
        left:18px;
        padding:14px 18px;
        border-radius:999px;
        background:linear-gradient(45deg,#0ff,#f0f,#0ff);
        color:black;
        font-weight:bold;
        font-family:monospace;
        cursor:pointer;
        z-index:999999;
        box-shadow:0 0 25px #0ff;
        animation:pulse 2s infinite;
    `;

    const style = document.createElement("style");
    style.textContent = `
    @keyframes pulse {
        0% { transform:scale(1); box-shadow:0 0 10px #0ff; }
        50% { transform:scale(1.05); box-shadow:0 0 30px #f0f; }
        100% { transform:scale(1); box-shadow:0 0 10px #0ff; }
    }
    `;
    document.head.appendChild(style);

    const panel = document.createElement("div");
    panel.style = `
        position:fixed;
        top:0;
        left:0;
        width:100vw;
        height:100vh;
        display:none;
        z-index:999998;
        background:radial-gradient(circle at top,#111,#000);
        backdrop-filter:blur(10px);
        color:white;
        font-family:monospace;
        overflow:auto;
    `;

    panel.innerHTML = `
        <div style="padding:20px;">
            <h1>🌌 MOD LOADER V3.1</h1>

            <input id="url" placeholder="GitHub RAW URL"
                style="width:70%;padding:10px;">

            <button id="add">ADD</button>
            <button id="load">LOAD ALL</button>

            <hr>

            <div id="list"></div>

            <h3>📜 LOGS</h3>
            <pre id="log"></pre>
        </div>
    `;

    document.body.appendChild(btn);
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

    window._panel = panel;

    updateUI();
}

// =============================
// UI UPDATE + QOL
// =============================

function updateUI(){

    const panel = window._panel;
    if(!panel) return;

    const list = panel.querySelector("#list");
    const log = panel.querySelector("#log");

    list.innerHTML = "";

    for(const id in ModLoader.mods){
        const m = ModLoader.mods[id];

        const div = document.createElement("div");
        div.style = "margin:6px 0;";

        div.innerHTML = `
            ${m.enabled ? "🟢" : "🔴"} ${id}
            <button onclick="(${toggle.toString()})('${id}')">toggle</button>
        `;

        list.appendChild(div);
    }

    log.textContent =
`Loaded: ${ModLoader.loaded.length}
Errors: ${ModLoader.errors.length}
Mods: ${Object.keys(ModLoader.mods).length}`;
}

// =============================
// START
// =============================

createUI();

console.log("🌌 V3.1 FIX READY");