console.log("🔥 V3.1 FIX ENGINE");

// STATE
window.ModLoader = {
    mods: {},
    loaded: [],
    errors: []
};

window.MODS = window.MODS || [];

// =============================
// FETCH
// =============================

async function fetchMod(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error(res.status);
    return await res.text();
}

// =============================
// REAL EXEC (IMPORTANT FIX)
// =============================

function runMod(code, id){

    try {

        // 🔥 KEY FIX: direct eval in global scope
        (function(){
            eval(code);
        })();

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

        console.log("⬇", url);

        const code = await fetchMod(url);

        const id = url.split("/").pop();

        const ok = runMod(code, id);

        ModLoader.mods[id] = {url, code};

        if(ok) ModLoader.loaded.push(id);

    } catch(e){
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
// UI UPDATE
// =============================

function updateUI(){
    console.log("Loaded:", ModLoader.loaded.length);
}

// =============================
// START
// =============================

setTimeout(loadAll, 1000);

console.log("🔥 V3.1 FIX READY");