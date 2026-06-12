// =====================================
// Soil Expansion v3.0 - EXPANSION PACK (SAFE FIXED)
// =====================================

console.log("Soil Expansion v3.0 Expansion Pack loading...");

// =============================
// SAFE WRAPPER
// =============================

function safe(fn){
    try { fn(); } catch(e){
        console.log("[Soil Expansion ERROR]", e);
    }
}

// =============================
// SAFE PIXEL GETTER
// =============================

function getBelow(pixel){
    try{
        return pixelMap?.[pixel.x]?.[pixel.y+1];
    } catch(e){
        return null;
    }
}

function getAbove(pixel){
    try{
        return pixelMap?.[pixel.x]?.[pixel.y-1];
    } catch(e){
        return null;
    }
}

// =============================
// 🌱 PLANT GROWTH SYSTEM (SAFE ADD-ON)
// =============================

safe(() => {

if(elements.wheat_seed){

    const oldTick = elements.wheat_seed.tick;

    elements.wheat_seed.tick = function(pixel){

        pixel.growth = pixel.growth || 0;

        let below = getBelow(pixel);

        if(below){
            if(below.element === "moist_soil") pixel.growth += 0.05;
            else if(below.element === "rich_soil") pixel.growth += 0.03;
            else if(below.element === "super_fertile_soil") pixel.growth += 0.08;
            else if(below.element === "eroded_soil") pixel.growth += 0.005;
        }

        if(pixel.growth > 1){
            if(typeof changePixel === "function"){
                changePixel(pixel, "plant");
            }
        }

        if(oldTick) oldTick(pixel);
    };
}

});

// =============================
// 🪨 COMPACTION SYSTEM (NON-DESTRUCTIVE)
// =============================

function checkCompaction(pixel){

    const heavy = ["stone","concrete","iron","steel","lead"];

    let above = getAbove(pixel);

    if(above && heavy.includes(above.element)){
        if(Math.random() < 0.001){
            if(typeof changePixel === "function"){
                changePixel(pixel, "compacted_soil");
            }
        }
    }
}

// attach safely (NO overwrite if exists)
safe(() => {

if(elements.fertile_soil?.tick){
    const old = elements.fertile_soil.tick;

    elements.fertile_soil.tick = function(pixel){
        old(pixel);
        checkCompaction(pixel);
    };
}

if(elements.rich_soil?.tick){
    const old = elements.rich_soil.tick;

    elements.rich_soil.tick = function(pixel){
        old(pixel);
        checkCompaction(pixel);
    };
}

});

// =============================
// 🌧️ SIMPLE WEATHER (SAFE SIM)
// =============================

let weather = { rain: 0, dry: 0 };

safe(() => {

setInterval(() => {

    weather.rain += Math.random() * 0.02;
    weather.dry += Math.random() * 0.01;

    // rain spawn (SAFE CHECK)
    if(weather.rain > 1){
        weather.rain = 0;

        if(typeof create === "function"){
            try{
                create("water", Math.floor(Math.random()*50), 0);
            }catch(e){}
        }
    }

}, 1000);

});

// =============================
// 🌧️ EROSION ADD-ON (SAFE EXTEND)
// =============================

safe(() => {

if(elements.moist_soil?.tick){

    const old = elements.moist_soil.tick;

    elements.moist_soil.tick = function(pixel){

        old(pixel);

        if(Math.random() < 0.0003){
            if(typeof changePixel === "function"){
                changePixel(pixel, "eroded_soil");
            }
        }
    };
}

});

// =============================
// 🦠 MICROBIOME SPREAD (SAFE LOCAL)
// =============================

safe(() => {

if(elements.mycorrhiza?.tick){

    const old = elements.mycorrhiza.tick;

    elements.mycorrhiza.tick = function(pixel){

        old(pixel);

        let dirs = [[1,0],[-1,0],[0,1],[0,-1]];

        for(let d of dirs){

            let p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
            if(!p) continue;

            if(p.element === "rich_soil" && Math.random() < 0.01){
                if(typeof changePixel === "function"){
                    changePixel(p, "super_fertile_soil");
                }
            }

            if(p.element === "compost" && Math.random() < 0.02){
                if(typeof changePixel === "function"){
                    changePixel(p, "humus");
                }
            }
        }
    };
}

});

// =============================
// END PACK
// =============================

console.log("Soil Expansion v3.0 Expansion Pack LOADED (SAFE)");