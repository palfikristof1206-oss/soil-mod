// =====================================
// Soil Expansion v3.1 - ADVANCED PACK
// =====================================

log("Soil Expansion v3.1 loading...");

// =====================================
// 🌱 ROOT SYSTEM (GYÖKÉRHÁLÓ)
// =====================================

function rootSpread(pixel){
    let dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(let d of dirs){
        let p = pixelMap[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(!p) continue;

        // nutrients transfer
        if(p.element === "fertile_soil" && Math.random() < 0.02){
            changePixel(p, "rich_soil");
        }

        if(p.element === "rich_soil" && Math.random() < 0.01){
            changePixel(p, "super_fertile_soil");
        }
    }
}

elements.wheat_seed.tick = function(pixel){
    let below = pixelMap[pixel.x]?.[pixel.y+1];

    if(below){
        if(["rich_soil","fertile_soil","moist_soil"].includes(below.element)){
            pixel.growth = (pixel.growth || 0) + 0.02;
        } else if(below.element === "dry_soil"){
            pixel.growth = (pixel.growth || 0) + 0.005;
        }
    }

    if(pixel.growth > 1){
        changePixel(pixel, "plant");
    }

    rootSpread(pixel);
};

// =====================================
// 🧪 NUTRIENT DEPLETION SYSTEM
// =====================================

function nutrientDrain(pixel){
    if(pixel.element === "rich_soil"){
        if(Math.random() < 0.0008){
            changePixel(pixel, "fertile_soil");
        }
    }

    if(pixel.element === "fertile_soil"){
        if(Math.random() < 0.0005){
            changePixel(pixel, "dirt");
        }
    }
}

elements.rich_soil.tick = function(pixel){
    nutrientDrain(pixel);
};

elements.fertile_soil.tick = function(pixel){
    nutrientDrain(pixel);
};

// =====================================
// 🌍 SOIL LAYERS SYSTEM
// =====================================

function soilLayers(pixel){
    if(pixel.y > height*0.75){
        if(pixel.element === "dirt" && Math.random() < 0.001){
            changePixel(pixel, "clay_soil_plus");
        }
    }

    if(pixel.y > height*0.85){
        if(pixel.element === "clay_soil_plus" && Math.random() < 0.002){
            changePixel(pixel, "rock");
        }
    }
}

// attach to dirt
elements.dirt.tick = function(pixel){
    soilLayers(pixel);
};

// =====================================
// ⚗️ pH GROWTH EFFECT SYSTEM
// =====================================

function phGrowthModifier(pixel){
    let below = pixelMap[pixel.x]?.[pixel.y+1];
    if(!below) return 1;

    switch(below.element){
        case "acidic_soil": return 0.6;
        case "neutral_soil": return 1;
        case "alkaline_soil": return 0.8;
        case "rich_soil": return 1.4;
        case "super_fertile_soil": return 2;
        default: return 1;
    }
}

// override plant growth boost
elements.tomato_seed.tick = function(pixel){
    let below = pixelMap[pixel.x]?.[pixel.y+1];
    let mult = phGrowthModifier(pixel);

    if(below){
        pixel.growth = (pixel.growth || 0) + (0.02 * mult);
    }

    if(pixel.growth > 1){
        changePixel(pixel, "plant");
    }
};

// =====================================
// 🪱 ANIMAL / BURROW SYSTEM
// =====================================

elements.earthworm = {
    color:"#c78d7b",
    behavior:[
        "XX|M1|XX",
        "M1|XX|M1",
        "XX|M1|XX"
    ],
    category:"life",
    density:1050,
    tick:function(pixel){
        let dirs = [[1,0],[-1,0],[0,1],[0,-1]];

        for(let d of dirs){
            let p = pixelMap[pixel.x+d[0]]?.[pixel.y+d[1]];
            if(!p) continue;

            if(p.element === "dirt" && Math.random() < 0.01){
                changePixel(p, "fertile_soil");
            }

            if(p.element === "fertile_soil" && Math.random() < 0.02){
                changePixel(p, "rich_soil");
            }
        }
    }
};

// =====================================
// ⚠️ FERTILIZER OVERUSE DAMAGE
// =====================================

function fertilizerOveruse(pixel){
    let below = pixelMap[pixel.x]?.[pixel.y+1];
    if(!below) return;

    if(["fertilizer_n","fertilizer_p","fertilizer_k"].includes(pixel.element)){
        if(below.element === "super_fertile_soil"){
            if(Math.random() < 0.002){
                changePixel(below, "acidic_soil");
            }
        }
    }
}

// hook fertilizer tick safety
elements.fertilizer_n.tick = fertilizerOveruse;
elements.fertilizer_p.tick = fertilizerOveruse;
elements.fertilizer_k.tick = fertilizerOveruse;

// =====================================
// END v3.1 PACK
// =====================================

log("Soil Expansion v3.1 loaded!");