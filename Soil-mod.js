// =============================
// Soil Expansion v3.3 FIXED BUILD
// =============================

console.log("Soil Expansion v3.3 FIXED loading...");

// =============================
// SAFE CORE
// =============================

function safeElement(name, data){
    if(!elements[name]){
        if(data.reactions && typeof data.reactions !== "object"){
            data.reactions = {};
        }

        if(!data.state) data.state = "solid";

        elements[name] = data;
    }
}

function addTick(name, fn){
    if(!elements[name]) return;
    if(elements[name]._soil_v33) return;

    const old = elements[name].tick;

    elements[name].tick = function(pixel){
        if(old) old(pixel);
        fn(pixel);
    };

    elements[name]._soil_v33 = true;
}

// =============================
// COOLDOWN (SAFE UNIQUE KEYS)
// =============================

function cd(pixel, key, ms){
    const now = Date.now();
    pixel._cd = pixel._cd || {};

    if(!pixel._cd[key] || now > pixel._cd[key]){
        pixel._cd[key] = now + ms;
        return true;
    }
    return false;
}

// =============================
// SOIL ELEMENTS (FIXED VISIBILITY)
// =============================

safeElement("humus", {
    color:"#3b2a1f",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    state:"solid"
});

safeElement("sandy_soil", {
    color:"#c4a772",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    state:"solid"
});

safeElement("fertile_soil", {
    color:"#3d2416",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    state:"solid"
});

safeElement("rich_soil", {
    color:"#4b2f1a",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    state:"solid"
});

safeElement("super_fertile_soil", {
    color:"#2d1b12",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    state:"solid"
});

// =============================
// FIXED REACTION (NO CHAINS EXPLODE)
// =============================

// dirt + sand -> sandy_soil (stable)
addTick("dirt", function(pixel){

    if(!cd(pixel,"dirt_sand",10000)) return;

    const right = pixelMap?.[pixel.x+1]?.[pixel.y];
    const left  = pixelMap?.[pixel.x-1]?.[pixel.y];

    const p = right || left;

    if(p?.element === "sand"){
        changePixel(pixel, "sandy_soil");
    }
});

// sandy + humus -> fertile
addTick("sandy_soil", function(pixel){

    if(!cd(pixel,"sandy_humus",10000)) return;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(p?.element === "humus"){
            changePixel(pixel, "fertile_soil");
            break;
        }
    }
});

// fertile + humus -> rich
addTick("fertile_soil", function(pixel){

    if(!cd(pixel,"fertile_humus",10000)) return;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(p?.element === "humus"){
            changePixel(pixel, "rich_soil");
            break;
        }
    }
});

// rich + fertilizer -> super
addTick("rich_soil", function(pixel){

    if(!cd(pixel,"rich_fert",10000)) return;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(!p) continue;

        if(
            p.element === "fertilizer_n" ||
            p.element === "fertilizer_p" ||
            p.element === "fertilizer_k"
        ){
            changePixel(pixel, "super_fertile_soil");
            break;
        }
    }
});

// =============================
// SOIL AI (FIXED - NO DOUBLE ADD)
// =============================

addTick("dirt", function(pixel){

    let score = 0;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(!p) continue;

        if(p.element === "humus") score += 2;
        if(p.element === "compost") score += 2;
        if(p.element === "manure") score += 3;
    }

    if(score >= 4 && Math.random() < 0.002){
        changePixel(pixel,"fertile_soil");
    }
});

// =============================
// MOISTURE SPREAD (FIXED)
// =============================

addTick("moist_soil", function(pixel){

    if(!cd(pixel,"moist",3000)) return;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(p?.element === "dirt" && Math.random() < 0.01){
            changePixel(p,"moist_soil");
        }
    }
});

// =============================
// END SAFE
// =============================

console.log("Soil Expansion v3.3 FIXED LOADED");
console.log("END DONE");