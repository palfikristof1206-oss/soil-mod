// =====================================
// Soil Expansion v3.0 - SAFE EXTENSION PACK (FIXED MERGED)
// =====================================

console.log("Soil Expansion Extension Pack loading (FIXED)...");

// =============================
// SAFE WRAPPER
// =============================

function safe(fn){
    try { fn(); } catch(e){
        console.log("[Soil Expansion ERROR]", e);
    }
}

// =============================
// WEATHER (TICK-BASED, NO SETINTERVAL)
// =============================

let weather = { rain: 0 };

addTick("dirt", function(p){

    // lightweight pseudo-weather system (SYNCED TO GAME LOOP)
    if(Math.random() < 0.0002){
        weather.rain += 0.1;
    }

    if(weather.rain > 1){
        weather.rain = 0;

        // safe rain spawn
        if(typeof createPixel === "function"){
            createPixel("water", p.x, 0);
        }
    }
});

// =============================
// PLANT GROWTH (SAFE EXTEND ONLY)
// =============================

safe(() => {

if(elements.wheat_seed){

    const old = elements.wheat_seed.tick;

    elements.wheat_seed.tick = function(pixel){

        pixel.growth = pixel.growth || 0;

        let below = pixelMap?.[pixel.x]?.[pixel.y+1];

        if(below){
            if(below.element === "moist_soil") pixel.growth += 0.03;
            else if(below.element === "rich_soil") pixel.growth += 0.02;
            else if(below.element === "super_fertile_soil") pixel.growth += 0.05;
            else if(below.element === "eroded_soil") pixel.growth += 0.005;
        }

        if(pixel.growth > 1){
            changePixel(pixel, "plant");
        }

        if(old) old(pixel);
    };
}

});

// =============================
// COMPACTION SYSTEM (SAFE, NO WRAP OVERWRITE)
// =============================

function checkCompaction(pixel){

    const heavy = ["stone","concrete","iron","steel","lead"];

    let above = pixelMap?.[pixel.x]?.[pixel.y-1];

    if(above && heavy.includes(above.element)){
        if(Math.random() < 0.0005){
            changePixel(pixel, "compacted_soil");
        }
    }
}

// attach WITHOUT double wrapping protection
safe(() => {

["fertile_soil","rich_soil"].forEach(name => {

    if(elements[name] && !elements[name]._compaction_added){

        addTick(name, function(p){
            checkCompaction(p);
        });

        elements[name]._compaction_added = true;
    }

});

});

// =============================
// MICROBIOME EXTENSION (NO DUPLICATION, LOW IMPACT)
// =============================

safe(() => {

if(elements.mycorrhiza && !elements.mycorrhiza._ext_added){

    addTick("mycorrhiza", function(p){

        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

        for(let d of dirs){

            let n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
            if(!n) continue;

            // ONLY compost → humus (remove duplicate soil upgrade logic)
            if(n.element === "compost" && Math.random() < 0.01){
                changePixel(n, "humus");
            }
        }

    });

    elements.mycorrhiza._ext_added = true;
}

});

// =============================
// EROSION EXTENSION (SAFE)
// =============================

safe(() => {

if(elements.moist_soil && !elements.moist_soil._erosion_ext){

    addTick("moist_soil", function(p){
        if(Math.random() < 0.0002){
            changePixel(p, "eroded_soil");
        }
    });

    elements.moist_soil._erosion_ext = true;
}

});

// =============================
// END
// =============================

console.log("Soil Expansion Extension Pack LOADED (FIXED & STABLE)");