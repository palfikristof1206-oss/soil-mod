// =============================
// Soil Expansion v3.3 UPD - FULL SYSTEM
// =============================

console.log("Soil Expansion v3.3 UPD loading...");

// =============================
// SAFE CORE
// =============================

function safeElement(name, data){
    if(!elements[name]){
        if(data.reactions && typeof data.reactions !== "object"){
            data.reactions = {};
        }
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
// COOLDOWN ENGINE (GLOBAL SAFE)
// =============================

function canTrigger(pixel, key, ms){
    const now = Date.now();
    pixel._cd = pixel._cd || {};

    if(!pixel._cd[key] || now > pixel._cd[key]){
        pixel._cd[key] = now + ms;
        return true;
    }
    return false;
}

// =============================
// PH SYSTEM
// =============================

function getPH(below){
    if(!below) return 1;

    switch(below.element){
        case "acidic_soil": return 0.7;
        case "neutral_soil": return 1;
        case "alkaline_soil": return 0.9;
        case "rich_soil": return 1.3;
        case "super_fertile_soil": return 1.7;
        default: return 1;
    }
}

// =============================
// PLANT EVOLUTION SYSTEM
// =============================

function plantSystem(name){

if(!elements[name] || elements[name]._plant_v33) return;

const old = elements[name].tick;

elements[name].tick = function(pixel){

    if(old) old(pixel);

    pixel.growth = pixel.growth || 0;
    pixel.size = pixel.size || 1;

    const below = pixelMap?.[pixel.x]?.[pixel.y+1];
    const mult = getPH(below);

    pixel.growth += 0.02 * mult;

    if(pixel.growth > 0.3) pixel.size = 1.2;
    if(pixel.growth > 0.6) pixel.size = 1.5;
    if(pixel.growth > 0.9) pixel.size = 1.8;

    if(pixel.growth > 1){
        changePixel(pixel, "plant");
    }
};

elements[name]._plant_v33 = true;

}

plantSystem("wheat_seed");
plantSystem("tomato_seed");
plantSystem("potato_seed");

// =============================
// MYCORRHIZA AI (LIVING SYSTEM)
// =============================

if(elements.mycorrhiza && !elements.mycorrhiza._v33){

const old = elements.mycorrhiza.tick;

elements.mycorrhiza.tick = function(pixel){

    if(old) old(pixel);

    if(!canTrigger(pixel,"move",200)) return;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    let target = null;

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(!p) continue;

        if(p.element === "rich_soil" || p.element === "fertile_soil"){
            target = p;
            break;
        }
    }

    if(target && Math.random() < 0.6){
        pixel.x = target.x;
        pixel.y = target.y;
    }

    if(target && Math.random() < 0.02){
        changePixel(target, "super_fertile_soil");
    }
};

elements.mycorrhiza._v33 = true;

}

// =============================
// SOIL EVOLUTION RULES (FIXED CHAINS)
// =============================

// sand + dirt
addTick("dirt", function(pixel){
    if(!canTrigger(pixel,"sand_mix",10000)) return;

    const r = pixelMap?.[pixel.x+1]?.[pixel.y];
    const l = pixelMap?.[pixel.x-1]?.[pixel.y];

    const target = r || l;

    if(target?.element === "sand"){
        changePixel(pixel, "sandy_soil");
    }
});

// sandy + humus
addTick("sandy_soil", function(pixel){
    if(!canTrigger(pixel,"humus_mix",10000)) return;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(p?.element === "humus"){
            changePixel(pixel, "fertile_soil");
            break;
        }
    }
});

// fertile + humus
addTick("fertile_soil", function(pixel){
    if(!canTrigger(pixel,"rich_mix",10000)) return;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(p?.element === "humus"){
            changePixel(pixel, "rich_soil");
            break;
        }
    }
});

// rich + fertilizer
addTick("rich_soil", function(pixel){
    if(!canTrigger(pixel,"fert_mix",10000)) return;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(
            p?.element === "fertilizer_n" ||
            p?.element === "fertilizer_p" ||
            p?.element === "fertilizer_k"
        ){
            changePixel(pixel, "super_fertile_soil");
            break;
        }
    }
});

// =============================
// SOIL AI SYSTEM
// =============================

function soilAI(pixel){

const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
let score = 0;

for(const d of dirs){
    const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
    if(!p) continue;

    if(p.element === "humus") score += 2;
    if(p.element === "compost") score += 2;
    if(p.element === "manure") score += 3;
}

if(pixel.element === "dirt" && score >= 4){
    if(Math.random() < 0.002){
        changePixel(pixel, "fertile_soil");
    }
}

if(pixel.element === "fertile_soil" && score >= 7){
    if(Math.random() < 0.001){
        changePixel(pixel, "rich_soil");
    }
}

}

addTick("dirt", soilAI);

// =============================
// MOISTURE SPREAD
// =============================

addTick("moist_soil", function(pixel){

if(!canTrigger(pixel,"moist",3000)) return;

const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

for(const d of dirs){
    const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
    if(p?.element === "dirt" && Math.random() < 0.01){
        changePixel(p,"moist_soil");
    }
}

});

// =============================
// DIFFUSION LIGHT SYSTEM
// =============================

function diffuse(a,b){
if(!a || !b) return;

if(a.element === "rich_soil" && b.element === "dirt"){
    if(Math.random() < 0.001) changePixel(b,"fertile_soil");
}

if(a.element === "fertile_soil" && b.element === "dirt"){
    if(Math.random() < 0.0005) changePixel(b,"sandy_soil");
}
}

["rich_soil","fertile_soil"].forEach(name => {

if(!elements[name] || elements[name]._diff_v33) return;

const old = elements[name].tick;

elements[name].tick = function(pixel){

    if(old) old(pixel);

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        diffuse(pixel,p);
    }

};

elements[name]._diff_v33 = true;

});

// =============================
// END
// =============================

console.log("Soil Expansion v3.3 UPD LOADED");
console.log("END DONE");