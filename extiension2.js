// =====================================
// Soil Expansion v3.1 - EXTENSION 2 (MERGED SAFE LAYER)
// =====================================

console.log("Soil Expansion Extension2 FIXED loading...");

// =============================
// SAFE HELPER (LOCAL ONLY)
// =============================

function safe(fn){
    try { fn(); } catch(e){
        console.log("[Soil Ext2 error]", e);
    }
}

// =============================
// ROOT SYSTEM EXTENSION (SAFE MERGED)
// =============================

safe(() => {

function rootSpread(pixel){

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){

        const n = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(!n) continue;

        // soil upgrade (LOW CHANCE ONLY)
        if(n.element === "fertile_soil" && Math.random() < 0.005){
            changePixel(n, "rich_soil");
        }

        if(n.element === "rich_soil" && Math.random() < 0.002){
            changePixel(n, "super_fertile_soil");
        }
    }
}

// attach wheat seed ONLY ONCE (GLOBAL SAFE FLAG)
if(elements.wheat_seed && !elements.wheat_seed._ext2){

    const old = elements.wheat_seed.tick;

    elements.wheat_seed.tick = function(pixel){

        if(old) old(pixel);

        pixel.growth = pixel.growth || 0;

        let below = pixelMap?.[pixel.x]?.[pixel.y+1];

        if(below){

            if(below.element === "rich_soil") pixel.growth += 0.02;
            else if(below.element === "fertile_soil") pixel.growth += 0.015;
            else if(below.element === "moist_soil") pixel.growth += 0.01;
        }

        if(pixel.growth > 1){
            changePixel(pixel, "plant");
        }

        rootSpread(pixel);
    };

    elements.wheat_seed._ext2 = true;
}

});

// =============================
// NUTRIENT SYSTEM (BALANCED)
// =============================

safe(() => {

function nutrientDrain(pixel){

    // ⚠️ ONLY SLOW NATURAL DEGRADATION
    if(pixel.element === "rich_soil" && Math.random() < 0.0002){
        changePixel(pixel, "fertile_soil");
    }

    if(pixel.element === "fertile_soil" && Math.random() < 0.0001){
        changePixel(pixel, "dirt");
    }
}

function wrap(name){

    if(!elements[name] || elements[name]._nutri_ext2) return;

    const old = elements[name].tick;

    elements[name].tick = function(pixel){
        if(old) old(pixel);
        nutrientDrain(pixel);
    };

    elements[name]._nutri_ext2 = true;
}

wrap("rich_soil");
wrap("fertile_soil");

});

// =============================
// EARTHWORM SYSTEM (MERGED SAFE ECO LAYER)
// =============================

safe(() => {

if(elements.earthworm && !elements.earthworm._ext2){

    const old = elements.earthworm.tick;

    elements.earthworm.tick = function(pixel){

        if(old) old(pixel);

        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

        // LIMIT ACTIONS PER TICK (ANTI LAG)
        let actions = 0;

        for(const d of dirs){

            if(actions > 2) break;

            const n = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
            if(!n) continue;

            if(n.element === "dirt" && Math.random() < 0.003){
                changePixel(n, "fertile_soil");
                actions++;
            }

            if(n.element === "fertile_soil" && Math.random() < 0.004){
                changePixel(n, "rich_soil");
                actions++;
            }
        }
    };

    elements.earthworm._ext2 = true;
}

});

// =============================
// FERTILIZER BALANCE FIX
// =============================

safe(() => {

function fertilizer(pixel){

    let below = pixelMap?.[pixel.x]?.[pixel.y+1];
    if(!below) return;

    if(["fertilizer_n","fertilizer_p","fertilizer_k"].includes(pixel.element)){

        // ONLY VERY RARE CORRUPTION
        if(below.element === "super_fertile_soil" && Math.random() < 0.0001){
            changePixel(below, "acidic_soil");
        }
    }
}

["fertilizer_n","fertilizer_p","fertilizer_k"].forEach(name => {

    if(elements[name] && !elements[name]._fert_ext2){

        const old = elements[name].tick;

        elements[name].tick = function(pixel){
            if(old) old(pixel);
            fertilizer(pixel);
        };

        elements[name]._fert_ext2 = true;
    }
});

});

// =============================
// PH BOOST FIX (NO FUNCTION RETURN CHAOS)
// =============================

safe(() => {

function phBoost(pixel){

    let below = pixelMap?.[pixel.x]?.[pixel.y+1];
    if(!below) return 1;

    if(below.element === "rich_soil") return 1.2;
    if(below.element === "super_fertile_soil") return 1.5;
    if(below.element === "fertile_soil") return 1.1;

    return 1;
}

if(elements.tomato_seed && !elements.tomato_seed._ph_ext2){

    const old = elements.tomato_seed.tick;

    elements.tomato_seed.tick = function(pixel){

        if(old) old(pixel);

        pixel.growth = pixel.growth || 0;

        pixel.growth += 0.015 * phBoost(pixel);

        if(pixel.growth > 1){
            changePixel(pixel, "plant");
        }
    };

    elements.tomato_seed._ph_ext2 = true;
}

});

// =============================
// END
// =============================

console.log("Soil Expansion Extension2 FIXED LOADED");