console.log("🔥 Mod Loader V3.1 ENGINE booting...");

window.ModLoader = {
    mods: {},
    loaded: [],
    disabled: [],
    errors: [],
    graph: {},
    fps: { frames: 0, last: performance.now(), value: 0 }
};

window.MODS = window.MODS || [];

// =============================
// SAFE EXEC (REAL FIX)
// =============================

function runMod(code, id){
    try {
        // Sandboxels context fix
        const fn = new Function("window", "elements", "behaviors", `
            try {
                ${code}
            } catch(e){
                console.error("MOD ERROR:", "${id}", e);
            }
        `);

        fn(window, window.elements, window.behaviors);

        console.log("✅ LOADED:", id);
        return true;

    } catch(e){
        console.error("❌ EXEC FAIL:", id, e);
        ModLoader.errors.push({id, error:e});
        return false;
    }
}

// =============================
// FETCH MOD
// =============================

async function fetchMod(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error("Fetch failed " + res.status);
    return await res.text();
}

// =============================
// DEPENDENCY PARSER
// =============================

function parseDeps(code){
    const match = code.match(/@deps:(.*)/);
    if(!match) return [];
    return match[1].split(",").map(x => x.trim());
}

// =============================
// CONFLICT AUTO FIX
// =============================

function autoFix(code, id){

    if(!window.elements) return code;

    let fixed = code;

    for(let key in elements){
        if(fixed.includes(`elements.${key}`)){
            const newKey = key + "_mod_" + id.replace(/[^a-z0-9]/gi,"");

            fixed = fixed.replaceAll(
                `elements.${key}`,
                `elements.${newKey}`
            );
        }
    }

    return fixed;
}

// =============================
// LOAD MOD
// =============================

async function loadMod(url){

    try {

        const codeRaw = await fetchMod(url);
        const id = url.split("/").pop();

        let code = autoFix(codeRaw, id);

        const deps = parseDeps(code);

        ModLoader.graph[id] = deps;

        const ok = runMod(code, id);

        if(ok){
            ModLoader.loaded.push(id);
            ModLoader.mods[id] = {url, code, enabled:true, deps};
        }

        updateUI();

    } catch(e){
        ModLoader.errors.push({url, error:e});
    }
}

// =============================
// ENABLE / DISABLE
// =============================

function toggleMod(id){
    const mod = ModLoader.mods[id];
    if(!mod) return;

    mod.enabled = !mod.enabled;

    console.log(mod.enabled ? "🟢 ENABLED" : "🔴 DISABLED", id);

    if(!mod.enabled){
        ModLoader.disabled.push(id);
    }
}

// =============================
// HOT RELOAD (NO RESET)
// =============================

async function reloadMod(id){
    const mod = ModLoader.mods[id];
    if(!mod) return;

    console.log("♻ HOT RELOAD:", id);

    await loadMod(mod.url);
}

// =============================
// FPS MONITOR
// =============================

function startFPS(){

    function loop(){
        ModLoader.fps.frames++;

        const now = performance.now();
        if(now - ModLoader.fps.last >= 1000){
            ModLoader.fps.value = ModLoader.fps.frames;
            ModLoader.fps.frames = 0;
            ModLoader.fps.last = now;
        }

        requestAnimationFrame(loop);
    }

    loop();
}

// =============================
// GALAXY UI (FULLSCREEN)
// =============================

function createUI(){

    const ui = document.createElement("div");

    ui.style = `
        position:fixed;
        inset:0;
        background: radial-gradient(circle at center, #070818, #000);
        color:white;
        font-family:monospace;
        display:flex;
        z-index:999999;
    `;

    ui.innerHTML = `
        <div style="width:320px; padding:10px; border-right:1px solid #222;">

            <h3>🔥 V3.1 ENGINE</h3>

            <input id="url" placeholder="GitHub RAW mod"
                style="width:100%;padding:5px;"><br><br>

            <button id="add">Add</button>
            <button id="load">Load All</button>

            <hr>

            <div id="mods"></div>

            <hr>

            <b>FPS:</b> <span id="fps">0</span>

        </div>

        <div style="flex:1; padding:10px;">
            <canvas id="graph" style="width:100%;height:100%;background:#000"></canvas>
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
// UI UPDATE (DEPENDENCY GRAPH)
// =============================

function updateUI(){

    const box = document.getElementById("mods");
    if(!box) return;

    box.innerHTML = "";

    for(let id in ModLoader.mods){

        const mod = ModLoader.mods[id];

        box.innerHTML += `
            <div>
                ${mod.enabled ? "🟢" : "🔴"} ${id}
                <button onclick="toggleMod('${id}')">toggle</button>
                <button onclick="reloadMod('${id}')">reload</button>
            </div>
        `;
    }

    const fps = document.getElementById("fps");
    if(fps) fps.innerText = ModLoader.fps.value;
}

// =============================
// MOD STORE (GitHub INDEX)
// =============================

async function loadStore(){
    // placeholder: GitHub index API later
    console.log("📦 Mod store ready (stub)");
}

// =============================
// DRAG & DROP IMPORT
// =============================

function enableDragDrop(){

    window.addEventListener("drop", e => {
        e.preventDefault();

        const file = e.dataTransfer.files[0];
        if(!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            runMod(reader.result, "local-file");
        };

        reader.readAsText(file);
    });

    window.addEventListener("dragover", e => e.preventDefault());
}

// =============================
// START
// =============================

createUI();
startFPS();
enableDragDrop();
loadStore();

console.log("🔥 V3.1 ENGINE READY");