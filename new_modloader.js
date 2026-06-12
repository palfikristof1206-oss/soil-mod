// =====================================
// Sandboxels Mod Loader v1
// =====================================

console.log("Mod Loader v1 initializing...");

// =============================
// CONFIG
// =============================

const MODS = [
    // ide jönnek a GitHub RAW linkek
    // példa:
    // "https://raw.githubusercontent.com/USER/REPO/main/Soil-mod.js"
];

// =============================
// STATE
// =============================

window.ModLoader = {
    loaded: [],
    errors: []
};

// =============================
// LOAD SCRIPT FROM URL
// =============================

function loadMod(url){

    return new Promise((resolve, reject) => {

        try {

            fetch(url)
            .then(r => r.text())
            .then(code => {

                try {
                    eval(code);

                    console.log("Loaded mod:", url);
                    ModLoader.loaded.push(url);

                    resolve(url);

                } catch(e){
                    console.log("Mod error:", url, e);
                    ModLoader.errors.push({url, error:e});
                    reject(e);
                }

            });

        } catch(e){
            reject(e);
        }

    });
}

// =============================
// LOAD ALL MODS
// =============================

async function loadAllMods(){

    console.log("Loading mods...");

    for(let url of MODS){
        await loadMod(url);
    }

    console.log("All mods loaded:", ModLoader.loaded.length);
}

// =============================
// MOBILE UI (NO F12 NEEDED)
// =============================

function createLoaderUI(){

    let ui = document.createElement("div");

    ui.style.position = "fixed";
    ui.style.bottom = "10px";
    ui.style.right = "10px";
    ui.style.zIndex = 99999;
    ui.style.background = "rgba(0,0,0,0.7)";
    ui.style.color = "white";
    ui.style.padding = "10px";
    ui.style.fontFamily = "monospace";
    ui.style.borderRadius = "8px";

    ui.innerHTML = `
        <div>🧩 Mod Loader v1</div>
        <button id="reloadMods">Reload Mods</button>
        <button id="showLogs">Logs</button>
    `;

    document.body.appendChild(ui);

    document.getElementById("reloadMods").onclick = () => {
        loadAllMods();
    };

    document.getElementById("showLogs").onclick = () => {
        alert(
            "Loaded mods:\n" + ModLoader.loaded.join("\n") +
            "\n\nErrors:\n" + JSON.stringify(ModLoader.errors, null, 2)
        );
    };
}

// =============================
// INIT
// =============================

function initModLoader(){

    console.log("Initializing UI + loader...");

    createLoaderUI();

    setTimeout(() => {
        loadAllMods();
    }, 1000);
}

// auto start
initModLoader();

console.log("Mod Loader v1 ready");