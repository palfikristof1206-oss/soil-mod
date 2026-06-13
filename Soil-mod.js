// =============================
// Soil Expansion - FULL MERGED CORE
// =============================

console.log("Soil Expansion FULL MERGED loading...");

// =============================
// SAFE CORE SYSTEM
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
// UNIFIED TICK ENGINE
// =============================

function addTick(name, fn){
    if(!elements[name]) return;

    if(!elements[name]._soil_ticks){
        elements[name]._soil_ticks = [];
    }

    elements[name]._soil_ticks.push(fn);

    if(elements[name]._soil_wrapped) return;

    const old = elements[name].tick;

    elements[name].tick = function(p){
        if(old) old(p);

        const list = elements[name]._soil_ticks;
        for(let i = 0; i < list.length; i++){
            list[i](p);
        }
    };

    elements[name]._soil_wrapped = true;
}

// =============================
// COOLDOWN
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

// =============================
// BASE MATERIALS
// =============================

safeElement("sand", { color:"#d6c39a", behavior:behaviors.POWDER });
safeElement("dirt", { color:"#6b4f2a", behavior:behaviors.POWDER });
safeElement("humus", { color:"#3b2a1f", behavior:behaviors.POWDER });

// =============================
// FERTILIZERS
// =============================

safeElement("fertilizer_n", { color:"#66cc66", behavior:behaviors.POWDER });
safeElement("fertilizer_p", { color:"#6699ff", behavior:behaviors.POWDER });
safeElement("fertilizer_k", { color:"#ffcc66", behavior:behaviors.POWDER });

// =============================
// SOILS
// =============================

safeElement("sandy_soil", { color:"#c4a772", behavior:behaviors.POWDER });
safeElement("fertile_soil", { color:"#3d2416", behavior:behaviors.POWDER });
safeElement("rich_soil", { color:"#4b2f1a", behavior:behaviors.POWDER });
safeElement("super_fertile_soil", { color:"#2d1b12", behavior:behaviors.POWDER });

safeElement("moist_soil", { color:"#4f3727", behavior:behaviors.POWDER });
safeElement("eroded_soil", { color:"#9b7f60", behavior:behaviors.POWDER });

safeElement("rich_mud", { color:"#3e2617", behavior:behaviors.STURDYPOWDER });
safeElement("compacted_soil", { color:"#6e4b34", behavior:behaviors.STURDYPOWDER });

// =============================
// ORGANIC MATERIALS (v3.0 + v3.3 merged)
// =============================

safeElement("compost", { color:"#5a3d22", behavior:behaviors.POWDER });
safeElement("manure", { color:"#6b4423", behavior:behaviors.POWDER });
safeElement("peat", { color:"#2a1b12", behavior:behaviors.POWDER });

// =============================
// SEEDS (PLACEHOLDER ONLY - NO LOGIC)
// =============================

safeElement("wheat_seed", { color:"#d9c27a", behavior:behaviors.POWDER });
safeElement("tomato_seed", { color:"#c04040", behavior:behaviors.POWDER });
safeElement("potato_seed", { color:"#9b6b43", behavior:behaviors.POWDER });

// =============================
// PLACEHOLDER PH SYSTEM (NO LOGIC)
// =============================

safeElement("acidic_soil", { color:"#5a3420", behavior:behaviors.POWDER });
safeElement("neutral_soil", { color:"#4a2c1b", behavior:behaviors.POWDER });
safeElement("alkaline_soil", { color:"#8a6b4a", behavior:behaviors.POWDER });
safeElement("lime", { color:"#dddddd", behavior:behaviors.POWDER });

// =============================
// WEATHER (NO LOGIC ADDED)
// =============================

safeElement("rain_cloud", {
    color:"#888888",
    behavior:[
        "XX|CR:water|XX",
        "M1|XX|M1",
        "XX|XX|XX"
    ],
    category:"weather"
});

// =============================
// BIOLOGY
// =============================

safeElement("mycorrhiza", {
    color:"#e8d8b0",
    behavior:behaviors.POWDER,
    category:"life"
});

// =============================
// COMPOSTER
// =============================

safeElement("composter", {
    color:"#8b5a2b",
    behavior:behaviors.WALL,
    category:"machines",
    reactions:{
        plant:{elem2:"compost"},
        dead_plant:{elem2:"compost"},
        wood:{elem2:"compost"},
        leaf:{elem2:"compost"},
        grass:{elem2:"compost"}
    }
});

// =============================
// CORE SOIL EVOLUTION LOGIC
// =============================

// dirt + sand → sandy
addTick("dirt", function(p){
    if(!cd(p,"ds",8000)) return;

    const n = pixelMap?.[p.x+1]?.[p.y] || pixelMap?.[p.x-1]?.[p.y];
    if(n?.element === "sand"){
        changePixel(p,"sandy_soil");
    }

    let score = 0;
    const dirs = [[1,0],[-1,0],[0,1],[0,4]];

    for(const d of dirs){
        const a = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(a?.element === "humus") score += 2;
    }

    if(score >= 4 && Math.random() < 0.002){
        changePixel(p,"fertile_soil");
    }
});

// sandy → fertile
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

// fertile → rich
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

// rich → super fertile
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

// =============================
// MOISTURE + EROSION
// =============================

addTick("moist_soil", function(p){
    if(!cd(p,"moist",3000)) return;

    for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){
        const n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(n?.element === "dirt" && Math.random() < 0.01){
            changePixel(n,"moist_soil");
        }
    }

    if(Math.random() < 0.0005){
        changePixel(p,"eroded_soil");
    }
});

// =============================
// MYCORRHIZA - ETERNAL SPREAD SYSTEM
// =============================

addTick("mycorrhiza", function(p){

    if(!cd(p,"myco_core",80)) return;

    const dirs = [
        [1,0],[-1,0],[0,1],[0,-1]
    ];

    let emptySpots = [];
    let soilTargets = [];

    // scan surroundings
    for(const d of dirs){
        const n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(!n){
            emptySpots.push(d);
            continue;
        }

        // soil improvement effect
        if(n.element === "rich_soil" || n.element === "fertile_soil"){
            soilTargets.push(n);
        }

        // humus conversion chain
        if(n.element === "humus" && Math.random() < 0.06){
            changePixel(n,"rich_soil");
        }
    }

    // 1. SELF SPREAD (creates new mycorrhiza)
    if(emptySpots.length > 0 && Math.random() < 0.12){
        const d = emptySpots[Math.floor(Math.random()*emptySpots.length)];
        createPixel("mycorrhiza", p.x + d[0], p.y + d[1]);
    }

    // 2. SOIL UPGRADE EFFECT
    if(soilTargets.length > 0 && Math.random() < 0.2){
        const t = soilTargets[Math.floor(Math.random()*soilTargets.length)];
        changePixel(t,"super_fertile_soil");
    }

    // 3. MICRO MOVEMENT (optional crawl)
    if(Math.random() < 0.25){
        const d = dirs[Math.floor(Math.random()*dirs.length)];
        const n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];

        if(n && (n.element === "dirt" || n.element === "humus")){
            swapPixels(p,n);
        }
    }

});


console.log("Soil Expansion FULL MERGED LOADED");