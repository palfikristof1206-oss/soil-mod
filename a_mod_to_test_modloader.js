console.log("🔥 REAL Sandboxels Loader");

// MOD LIST
window.MODS = window.MODS || [];

// LOAD VIA SCRIPT TAG (IMPORTANT FIX)
function loadMod(url){

    return new Promise((resolve, reject) => {

        const s = document.createElement("script");

        s.src = url;
        s.onload = () => {
            console.log("✅ Loaded mod:", url);
            resolve(url);
        };

        s.onerror = () => {
            console.error("❌ Failed:", url);
            reject(url);
        };

        document.body.appendChild(s);
    });
}

// LOAD ALL
async function loadAll(){
    for(const m of MODS){
        await loadMod(m);
    }
}

setTimeout(loadAll, 1000);

console.log("🔥 READY (Sandboxels compatible)");