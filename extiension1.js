// =====================================
// Soil Expansion v3.0 - EXPANSION PACK FIXED
// =====================================

console.log("Soil Expansion Expansion Pack loading...");

// safety wrappers
const safe = (fn) => {
    try { fn(); } catch(e) { console.log("Soil mod error:", e); }
};

// =====================================
// 🌱 PLANT GROWTH SYSTEM (SAFE)
// =====================================

safe(() => {
if(elements.wheat_seed && !elements.wheat_seed.tick){

    elements.wheat_seed.tick = function(pixel){

        pixel.yield = pixel.yield || 0;

        let below = pixelMap?.[pixel.x]?.[pixel.y+1];

        if(below){
            if(below.element === "moist_soil") pixel.yield += 0.05;
            if(below.element === "rich_soil") pixel.yield += 0.03;
            if(below.element === "super_fertile_soil") pixel.yield += 0.08;
            if(below.element === "eroded_soil") pixel.yield += 0.005;
        }

        if(pixel.yield > 1){
            changePixel(pixel, "plant");
        }
    };
}
});

// =====================================
// 🪨 COMPACTION SYSTEM (SAFE EXTEND)
// =====================================

function checkCompaction(pixel){

    const heavy = ["stone","concrete","iron","steel","lead"];

    let above = pixelMap?.[pixel.x]?.[pixel.y-1];

    if(above && heavy.includes(above.element)){
        if(Math.random() < 0.001){
            changePixel(pixel, "compacted_soil");
        }
    }
}

// extend instead of overwrite
safe(() => {

const oldFertile = elements.fertile_soil.tick;
elements.fertile_soil.tick = function(pixel){
    if(oldFertile) oldFertile(pixel);
    checkCompaction(pixel);
};

const oldRich = elements.rich_soil.tick;
elements.rich_soil.tick = function(pixel){
    if(oldRich) oldRich(pixel);
    checkCompaction(pixel);
};

});

// =====================================
// 🌧️ SIMPLE WEATHER SIMULATION
// =====================================

let weather = {
    rain: 0,
    dry: 0
};

safe(() => {
setInterval(() => {

    weather.rain += Math.random()*0.02;
    weather.dry += Math.random()*0.01;

    // rain effect (safe)
    if(weather.rain > 1){
        weather.rain = 0;

        if(typeof create === "function"){
            create("water", Math.floor(Math.random()*50), 0);
        }
    }

    // drought effect
    if(weather.dry > 2){
        weather.dry = 0;

        if(typeof changePixel === "function"){
            // minimal safe fallback (no changeAll)
        }
    }

}, 1000);
});

// =====================================
// 🌧️ EROSION UPGRADE (SAFE MERGE)
// =====================================

safe(() => {

const oldMoist = elements.moist_soil.tick;

elements.moist_soil.tick = function(pixel){

    if(oldMoist) oldMoist(pixel);

    if(Math.random() < 0.0003){
        changePixel(pixel, "eroded_soil");
    }
};

});

// =====================================
// 🦠 MICROBIOME SYSTEM (LOCAL ONLY)
// =====================================

safe(() => {

const oldMyco = elements.mycorrhiza?.tick;

if(elements.mycorrhiza){

elements.mycorrhiza.tick = function(pixel){

    if(oldMyco) oldMyco(pixel);

    let dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(let d of dirs){
        let p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(!p) continue;

        if(p.element === "rich_soil" && Math.random() < 0.01){
            changePixel(p, "super_fertile_soil");
        }

        if(p.element === "compost" && Math.random() < 0.02){
            changePixel(p, "humus");
        }
    }
};

}

});

console.log("Soil Expansion v3.0 Expansion Pack LOADED");