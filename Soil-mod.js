// =====================================
// Soil Expansion - MASTER FORK v3.3
// CORE + EXT1 + EXT2 MERGED (STABLE)
// =====================================

console.log("Soil Expansion MASTER FORK loading...");

// =============================
// SAFE CORE HELPERS
// =============================

function safe(fn){
    try { fn(); } catch(e){
        console.log("[Soil-Mod ERROR]", e);
    }
}

function getBelow(p){
    return pixelMap?.[p.x]?.[p.y+1] || null;
}

function getAbove(p){
    return pixelMap?.[p.x]?.[p.y-1] || null;
}

// =============================
// GLOBAL TICK WRAPPER SYSTEM (ANTI-STACK)
// =============================

function addTick(name, fn){

    if(!elements[name]) return;

    if(!elements[name]._soil_ticks){
        elements[name]._soil_ticks = [];
    }

    elements[name]._soil_ticks.push(fn);

    if(elements[name]._soil_wrapped) return;

    const old = elements[name].tick;

    elements[name].tick = function(pixel){

        if(old) old(pixel);

        const list = elements[name]._soil_ticks;
        for(let i = 0; i < list.length; i++){
            list[i](pixel);
        }
    };

    elements[name]._soil_wrapped = true;
}

// =============================
// SAFE ELEMENT CREATION
// =============================

function safeElement(name, data){

    if(!elements[name]){

        if(!data.state) data.state = "solid";
        if(!data.category) data.category = "soil_expansion";
        if(data.reactions && typeof data.reactions !== "object"){
            data.reactions = {};
        }

        elements[name] = data;
    }
}

// =============================
// COOLDOWN SYSTEM
// =============================

function cd(p, key, ms){
    const now = Date.now();
    p._cd = p._cd || {};

    if(!p._cd[key] || now > p._cd[key]){
        p._cd[key] = now + ms;
        return true;
    }
    return false;
}

// =====================================
// BASE MATERIALS
// =====================================

safeElement("sand", { color:"#d6c39a", behavior:behaviors.POWDER });
safeElement("dirt", { color:"#6b4f2a", behavior:behaviors.POWDER });
safeElement("humus", { color:"#3b2a1f", behavior:behaviors.POWDER });

safeElement("fertilizer_n", { color:"#66cc66", behavior:behaviors.POWDER });
safeElement("fertilizer_p", { color:"#6699ff", behavior:behaviors.POWDER });
safeElement("fertilizer_k", { color:"#ffcc66", behavior:behaviors.POWDER });

// =====================================
// SOIL TYPES
// =====================================

safeElement("sandy_soil", { color:"#c4a772", behavior:behaviors.POWDER });
safeElement("fertile_soil", { color:"#3d2416", behavior:behaviors.POWDER });
safeElement("rich_soil", { color:"#4b2f1a", behavior:behaviors.POWDER });
safeElement("super_fertile_soil", { color:"#2d1b12", behavior:behaviors.POWDER });

safeElement("moist_soil", { color:"#4f3727", behavior:behaviors.POWDER });
safeElement("eroded_soil", { color:"#9b7f60", behavior:behaviors.POWDER });

safeElement("compacted_soil", { color:"#6e4b34", behavior:behaviors.STURDYPOWDER });

// =====================================
// CORE SOIL EVOLUTION
// =====================================

addTick("dirt", function(p){

    if(cd(p,"dirt_sand",8000)){
        let n = pixelMap?.[p.x+1]?.[p.y] || pixelMap?.[p.x-1]?.[p.y];

        if(n?.element === "sand"){
            changePixel(p,"sandy_soil");
        }
    }

    // soil AI
    let score = 0;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const a = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(a?.element === "humus") score += 2;
    }

    if(score >= 4 && Math.random() < 0.002){
        changePixel(p,"fertile_soil");
    }
});

addTick("sandy_soil", function(p){
    if(!cd(p,"sh",8000)) return;

    for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){
        const n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(n?.element === "humus"){
            changePixel(p,"fertile_soil");
            break;
        }
    }
});

addTick("fertile_soil", function(p){
    if(!cd(p,"fh",8000)) return;

    for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){
        const n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(n?.element === "humus"){
            changePixel(p,"rich_soil");
            break;
        }
    }
});

addTick("rich_soil", function(p){
    if(!cd(p,"rf",8000)) return;

    for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){
        const n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(!n) continue;

        if(
            n.element === "fertilizer_n" ||
            n.element === "fertilizer_p" ||
            n.element === "fertilizer_k"
        ){
            changePixel(p,"super_fertile_soil");
            break;
        }
    }
});

// =====================================
// MOISTURE + EROSION (MERGED)
// =====================================

addTick("moist_soil", function(p){

    if(cd(p,"moist",3000)){

        for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){
            const n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];

            if(n?.element === "dirt" && Math.random() < 0.01){
                changePixel(n,"moist_soil");
            }
        }
    }

    if(Math.random() < 0.0005){
        changePixel(p,"eroded_soil");
    }
});

// =====================================
// MYCORRHIZA (STABLE GROUND SYSTEM)
// =====================================

safeElement("mycorrhiza", {
    color:"#e8d8b0",
    behavior:behaviors.POWDER,
    category:"life"
});

addTick("mycorrhiza", function(p){

    if(!cd(p,"myco",200)) return;

    for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){

        const n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(!n) continue;

        if(n.element === "rich_soil" && Math.random() < 0.2){
            changePixel(n,"super_fertile_soil");
        }

        if(n.element === "compost" && Math.random() < 0.02){
            changePixel(n,"humus");
        }
    }
});

// =====================================
// EXTENSION 1 - PLANTS
// =====================================

safe(() => {

if(elements.wheat_seed){

    const old = elements.wheat_seed.tick;

    elements.wheat_seed.tick = function(p){

        if(old) old(p);

        let below = getBelow(p);
        if(!below) return;

        if(below.element === "rich_soil") p.growth = (p.growth||0)+0.03;
        else if(below.element === "fertile_soil") p.growth = (p.growth||0)+0.02;

        if(p.growth > 1){
            changePixel(p,"plant");
        }
    };
}

});

// =====================================
// EXTENSION 2 - EARTHWORM + NUTRIENTS
// =====================================

safe(() => {

if(elements.earthworm){

    const old = elements.earthworm.tick;

    elements.earthworm.tick = function(p){

        if(old) old(p);

        for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){

            const n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
            if(!n) continue;

            if(n.element === "dirt" && Math.random() < 0.003){
                changePixel(n,"fertile_soil");
            }

            if(n.element === "fertile_soil" && Math.random() < 0.002){
                changePixel(n,"rich_soil");
            }
        }
    };
}

});

// =====================================
// FERTILIZER BALANCE (SAFE)
// =====================================

safe(() => {

function fertilizer(p){

    let below = getBelow(p);
    if(!below) return;

    if(
        ["fertilizer_n","fertilizer_p","fertilizer_k"].includes(p.element) &&
        below.element === "super_fertile_soil" &&
        Math.random() < 0.0001
    ){
        changePixel(below,"acidic_soil");
    }
}

["fertilizer_n","fertilizer_p","fertilizer_k"].forEach(name => {

    if(elements[name] && !elements[name]._fert){

        const old = elements[name].tick;

        elements[name].tick = function(p){
            if(old) old(p);
            fertilizer(p);
        };

        elements[name]._fert = true;
    }
});

});

// =====================================
// END
// =====================================

console.log("Soil Expansion MASTER FORK LOADED");