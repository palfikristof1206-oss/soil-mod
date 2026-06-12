// =====================================
// Soil Expansion v3.1 - FIXED ADVANCED PACK
// =====================================

console.log("Soil Expansion v3.1 FIX loading...");

// safe wrapper
const safe = (fn) => { try { fn(); } catch(e){ console.log("Soil v3.1 error:", e); } };

// =====================================
// 🌱 ROOT SYSTEM (SAFE)
// =====================================

safe(() => {

function rootSpread(pixel){
    let dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(let d of dirs){
        let p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(!p) continue;

        if(p.element === "fertile_soil" && Math.random() < 0.01){
            changePixel(p, "rich_soil");
        }

        if(p.element === "rich_soil" && Math.random() < 0.005){
            changePixel(p, "super_fertile_soil");
        }
    }
}

// extend wheat_seed safely
if(elements.wheat_seed && !elements.wheat_seed._v31){
    const old = elements.wheat_seed.tick;

    elements.wheat_seed.tick = function(pixel){

        if(old) old(pixel);

        pixel.growth = pixel.growth || 0;

        let below = pixelMap?.[pixel.x]?.[pixel.y+1];

        if(below){
            if(["rich_soil","fertile_soil","moist_soil"].includes(below.element)){
                pixel.growth += 0.02;
            } else if(below.element === "dry_soil"){
                pixel.growth += 0.005;
            }
        }

        if(pixel.growth > 1){
            changePixel(pixel, "plant");
        }

        rootSpread(pixel);
    };

    elements.wheat_seed._v31 = true;
}

});

// =====================================
// 🧪 NUTRIENT SYSTEM (SAFE EXTEND)
// =====================================

safe(() => {

function nutrientDrain(pixel){

    if(pixel.element === "rich_soil" && Math.random() < 0.0005){
        changePixel(pixel, "fertile_soil");
    }

    if(pixel.element === "fertile_soil" && Math.random() < 0.0003){
        changePixel(pixel, "dirt");
    }
}

// safe tick extension
const wrap = (name) => {
    if(!elements[name] || elements[name]._nutri) return;

    const old = elements[name].tick;

    elements[name].tick = function(pixel){
        if(old) old(pixel);
        nutrientDrain(pixel);
    };

    elements[name]._nutri = true;
};

wrap("rich_soil");
wrap("fertile_soil");

});

// =====================================
// 🌍 SOIL LAYERS (NO HEIGHT API FIX)
// =====================================

safe(() => {

function soilLayers(pixel){
    if(pixel.y > 200){ // SAFE FIX (no height dependency)

        if(pixel.element === "dirt" && Math.random() < 0.001){
            changePixel(pixel, "clay_soil_plus");
        }
    }
}

// extend dirt safely
if(elements.dirt && !elements.dirt._layered){
    const old = elements.dirt.tick;

    elements.dirt.tick = function(pixel){
        if(old) old(pixel);
        soilLayers(pixel);
    };

    elements.dirt._layered = true;
}

});

// =====================================
// ⚗️ pH SYSTEM FIXED
// =====================================

safe(() => {

function phGrowth(pixel){
    let below = pixelMap?.[pixel.x]?.[pixel.y+1];
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

if(elements.tomato_seed && !elements.tomato_seed._ph){

    const old = elements.tomato_seed.tick;

    elements.tomato_seed.tick = function(pixel){

        if(old) old(pixel);

        let below = pixelMap?.[pixel.x]?.[pixel.y+1];
        let mult = phGrowth(pixel);

        if(below){
            pixel.growth = (pixel.growth || 0) + (0.02 * mult);
        }

        if(pixel.growth > 1){
            changePixel(pixel, "plant");
        }
    };

    elements.tomato_seed._ph = true;
}

});

// =====================================
// 🪱 EARTHWORM SAFE EXTENSION
// =====================================

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
                changePixel(p, "fertile_soil");
            }

            if(p.element === "fertile_soil" && Math.random() < 0.01){
                changePixel(p, "rich_soil");
            }
        }
    };

    elements.earthworm._v31 = true;
}

});

// =====================================
// ⚠️ FERTILIZER OVERUSE (SAFE)
// =====================================

safe(() => {

function fertilizer(pixel){
    let below = pixelMap?.[pixel.x]?.[pixel.y+1];
    if(!below) return;

    if(["fertilizer_n","fertilizer_p","fertilizer_k"].includes(pixel.element)){
        if(below.element === "super_fertile_soil" && Math.random() < 0.001){
            changePixel(below, "acidic_soil");
        }
    }
}

["fertilizer_n","fertilizer_p","fertilizer_k"].forEach(f => {
    if(elements[f] && !elements[f]._fert){
        const old = elements[f].tick;

        elements[f].tick = function(pixel){
            if(old) old(pixel);
            fertilizer(pixel);
        };

        elements[f]._fert = true;
    }
});

});

// =====================================
// END FIXED v3.1
// =====================================

console.log("Soil Expansion v3.1 FIX LOADED");