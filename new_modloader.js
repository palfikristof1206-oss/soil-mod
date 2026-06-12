console.log("🔥 Mod Loader V2.2 FIX booting...");

window.ModLoader = {
    mods: {},
    loaded: [],
    errors: []
};

window.MODS = window.MODS || [];

// =============================
// VALIDATE URL
// =============================

function isValidRaw(url){
    return url.includes("raw.githubusercontent.com");
}

// =============================
// FETCH SAFE
// =============================

async function fetchMod(url){

    if(!isValidRaw(url)){
        throw new Error("❌ NOT RAW GITHUB URL");
    }

    const res = await fetch(url);

    if(!res.ok){
        throw new Error("❌ FETCH FAILED " + res.status);
    }

    return await res.text();
}

// =============================
// EXEC SAFE
// =============================

function run(code, id){

    try {
        const fn = new Function(code);
        fn();

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

        run(code, id);

        ModLoader.loaded.push(id);
        ModLoader.mods[id] = {url, code};

    } catch(e){
        console.error("❌ LOAD FAIL:", url, e);
        ModLoader.errors.push({url, error:e});
    }
}

// =============================
// LOAD ALL
// =============================

async function loadAll(){

    console.log("🚀 Loading all mods...");

    for(const url of MODS){
        await loadMod(url);
    }

    console.log("✅ DONE:", ModLoader.loaded.length);
}

// =============================
// UI (FIXED + SIMPLE)
// =============================

function ui(){

    const box = document.createElement("div");

    box.style = `
        position:fixed;
        bottom:10px;
        left:10px;
        background:#111;
        color:white;
        padding:10px;
        font-family:monospace;
        z-index:999999;
        border-radius:10px;
        width:260px;
    `;

    box.innerHTML = `
        <b>🔥 Mod Loader V2.2 FIX</b><br><br>

        <input id="url" placeholder="raw github url"
        style="width:100%;padding:5px;"><br>

        <button id="add">Add</button>
        <button id="load">Load</button>
        <button id="show">Logs</button>

        <div id="list"></div>
    `;

    document.body.appendChild(box);

    document.getElementById("add").onclick = () => {
        const v = document.getElementById("url").value;
        if(v){
            MODS.push(v);
            update();
        }
    };

    document.getElementById("load").onclick = loadAll;

    document.getElementById("show").onclick = () => {
        alert(JSON.stringify(ModLoader, null, 2));
    };

    function update(){
        document.getElementById("list").innerText =
            "Mods:\n" + MODS.join("\n");
    }

    update();
}

// =============================

ui();
console.log("🔥 Mod Loader V2.2 READY");