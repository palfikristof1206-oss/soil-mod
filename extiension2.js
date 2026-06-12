// =====================================
// Soil Expansion v3.1 - FULL FIXED SAFE PACK
// =====================================

console.log("Soil Expansion v3.1 FIXED loading...");

// =============================
// SAFE CORE HELPERS
// =============================

function safe(fn){
    try { fn(); } catch(e){
        console.log("[Soil v3.1 error]", e);
    }
}

function getBelow(p){
    try{
        return pixelMap?.[p.x]?.[p.y+1];
    }catch(e){
        return null;
    }
}

function getAbove(p){
    try{
        return pixelMap?.[p.x]?.[p.y-1];
    }catch(e){
        return null;
    }
}

// =============================
// 🌱 ROOT SYSTEM (SAFE)
// =============================

safe(() => {

function rootSpread(pixel){

    let dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(let d of dirs){

        let p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(!p) continue;

        if(p.element === "fertile_soil" && Math.random() < 0.01){
            if(typeof changePixel === "function"){
                changePixel(p, "rich_soil");
            }
        }

        if(p.element === "rich_soil" && Math.random() < 0.005){
            if(typeof changePixel === "function"){
                changePixel(p, "super_fertile_soil");
            }
        }
    }
}

// attach safely
if(elements.wheat_seed && !elements.wheat_seed._soil_v31){

    const old = elements.wheat_seed.tick;

    elements.wheat_seed.tick = function(pixel){

        if(old) old(pixel);

        pixel.growth = pixel.growth || 0;

        let below = getBelow(pixel);

        if(below){

            if(below.element === "rich_soil" ||
               below.element === "fertile_soil" ||
               below.element === "moist_soil"){
                pixel.growth += 0.02;
            }

            if(below.element === "dry_soil"){
                pixel.growth += 0.005;
            }
        }

        if(pixel.growth > 1){
            if(typeof changePixel === "function"){
                changePixel(pixel, "plant");
            }
        }

        rootSpread(pixel);
    };

    elements.wheat_seed._soil_v31 = true;
}

});

// =============================
// 🧪 NUTRIENT DEPLETION (SAFE EXTEND)
// =============================

safe(() => {

function nutrientDrain(pixel){

    if(pixel.element === "rich_soil" && Math.random() < 0.0005){
        changePixel?.(pixel, "fertile_soil");
    }

    if(pixel.element === "fertile_soil" && Math.random() < 0.0003){
        changePixel?.(pixel, "dirt");
    }
}

function wrap(name){

    if(!elements[name] || elements[name]._nutri_v31) return;

    const old = elements[name].tick;

    elements[name].tick = function(pixel){
        if(old) old(pixel);
        nutrientDrain(pixel);
    };

    elements[name]._nutri_v31 = true;
}

wrap("rich_soil");
wrap("fertile_soil");

});

// =============================
// 🌍 SOIL LAYERS (SAFE FIXED)
// =============================

safe(() => {

function soilLayers(pixel){

    if(pixel.y > 200){

        if(pixel.element === "dirt" && Math.random() < 0.001){
            changePixel?.(pixel, "clay_soil_plus");
        }
    }
}

if(elements.dirt && !elements.dirt._layer_v31){

    const old = elements.dirt.tick;

    elements.dirt.tick = function(pixel){
        if(old) old(pixel);
        soilLayers(pixel);
    };

    elements.dirt._layer_v31 = true;
}

});

// =============================
// ⚗️ pH SYSTEM (SAFE)
// =============================

safe(() => {

function phBoost(pixel){

    let below = getBelow(pixel);
    if(!below) return 1;

    switch(below.element){
        case "acidic_soil": return 0.7;
        case "neutral_soil": return 1;
        case "alkaline_soil": return 0.9;
        case "rich_soil": return 1.3;
        case "super_fertile_soil": return 1.8;
        default: return 1;
    }
}

if(elements.tomato_seed && !elements.tomato_seed._ph_v31){

    const old = elements.tomato_seed.tick;

    elements.tomato_seed.tick = function(pixel){

        if(old) old(pixel);

        let mult = phBoost(pixel);

        pixel.growth = pixel.growth || 0;

        pixel.growth += 0.02 * mult;

        if(pixel.growth > 1){
            changePixel?.(pixel, "plant");
        }
    };

    elements.tomato_seed._ph_v31 = true;
}

});

// =============================
// 🪱 EARTHWORM SYSTEM (SAFE)
// =============================

safe(() => {

if(elements.earthworm && !elements.earthworm._v31){

    const old = elements.earthworm.tick;

    elements.earthworm.tick = function(pixel){

        if(old) old(pixel);

        let dirs = [[1,0],[-1,0],[0,1],[0,-1]];

        for(let d of dirs){

            let p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
            if(!p) continue;

            if(p.element === "dirt" && Math.random() < 0.005){
                changePixel?.(p, "fertile_soil");
            }

            if(p.element === "fertile_soil" && Math.random() < 0.01){
                changePixel?.(p, "rich_soil");
            }
        }
    };

    elements.earthworm._v31 = true;
}

});

// =============================
// ⚠️ FERTILIZER OVERUSE (SAFE)
// =============================

safe(() => {

function fertilizer(pixel){

    let below = getBelow(pixel);
    if(!below) return;

    if(["fertilizer_n","fertilizer_p","fertilizer_k"].includes(pixel.element)){
        if(below.element === "super_fertile_soil" && Math.random() < 0.001){
            changePixel?.(below, "acidic_soil");
        }
    }
}

["fertilizer_n","fertilizer_p","fertilizer_k"].forEach(name => {

    if(elements[name] && !elements[name]._fert_v31){

        const old = elements[name].tick;

        elements[name].tick = function(pixel){
            if(old) old(pixel);
            fertilizer(pixel);
        };

        elements[name]._fert_v31 = true;
    }
});

});

// =============================
// END
// =============================

console.log("Soil Expansion v3.1 FIXED LOADED");