// =====================================
// SOIL-MOD v3.3 - FULL MERGED SANDBOXELS MOD
// CORE + EXTENSION1 + EXTENSION2
// =====================================

console.log("Soil-Mod v3.3 FULL MERGED loading...");

// =====================================
// SAFE SYSTEM CORE
// =====================================

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

function cd(pixel, key, ms){
    const now = Date.now();
    pixel._cd = pixel._cd || {};
    if(!pixel._cd[key] || now > pixel._cd[key]){
        pixel._cd[key] = now + ms;
        return true;
    }
    return false;
}

// tick wrapper (multi-safe)
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

// =====================================
// BASE ELEMENTS
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
// CORE EVOLUTION
// =====================================

addTick("dirt", function(p){
    if(!cd(p,"soil",8000)) return;

    let n = pixelMap?.[p.x+1]?.[p.y] || pixelMap?.[p.x-1]?.[p.y];
    if(n?.element === "sand"){
        changePixel(p,"sandy_soil");
    }
});

addTick("sandy_soil", function(p){
    if(!cd(p,"sandy",8000)) return;

    let dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for(let d of dirs){
        let n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(n?.element === "humus"){
            changePixel(p,"fertile_soil");
        }
    }
});

addTick("fertile_soil", function(p){
    if(!cd(p,"fertile",8000)) return;

    let dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for(let d of dirs){
        let n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(n?.element === "humus"){
            changePixel(p,"rich_soil");
        }
    }
});

addTick("rich_soil", function(p){
    if(!cd(p,"rich",8000)) return;

    let dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for(let d of dirs){
        let n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(n?.element?.includes("fertilizer")){
            changePixel(p,"super_fertile_soil");
        }
    }
});

// =====================================
// EXTENSION 1 - ENVIRONMENT
// =====================================

// plant growth (wheat)
addTick("wheat_seed", function(p){

    p.growth = p.growth || 0;

    let below = pixelMap?.[p.x]?.[p.y+1];

    if(below){
        if(below.element === "moist_soil") p.growth += 0.03;
        else if(below.element === "fertile_soil") p.growth += 0.05;
        else if(below.element === "rich_soil") p.growth += 0.08;
        else if(below.element === "eroded_soil") p.growth += 0.01;
    }

    if(p.growth > 1){
        changePixel(p,"plant");
    }
});

// erosion
addTick("moist_soil", function(p){
    if(Math.random() < 0.0005){
        changePixel(p,"eroded_soil");
    }
});

// microbiome (mycorrhiza boost)
addTick("mycorrhiza", function(p){

    let dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(let d of dirs){
        let n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(!n) continue;

        if(n.element === "rich_soil" && Math.random() < 0.01){
            changePixel(n,"super_fertile_soil");
        }
    }
});

// =====================================
// EXTENSION 2 - DEEP ECOSYSTEM
// =====================================

// root system
addTick("fertile_soil", function(p){
    if(!cd(p,"root",5000)) return;

    let dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for(let d of dirs){
        let n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(n?.element === "rich_soil"){
            changePixel(n,"super_fertile_soil");
        }
    }
});

// nutrient drain
addTick("rich_soil", function(p){
    if(Math.random() < 0.0003){
        changePixel(p,"fertile_soil");
    }
});

addTick("fertile_soil", function(p){
    if(Math.random() < 0.0002){
        changePixel(p,"dirt");
    }
});

// earthworm system
addTick("earthworm", function(p){

    let dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(let d of dirs){
        let n = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];
        if(!n) continue;

        if(n.element === "dirt" && Math.random() < 0.01){
            changePixel(n,"fertile_soil");
        }

        if(n.element === "fertile_soil" && Math.random() < 0.005){
            changePixel(n,"rich_soil");
        }
    }
});

// fertilizer overuse penalty
addTick("super_fertile_soil", function(p){
    if(Math.random() < 0.0005){
        changePixel(p,"acidic_soil");
    }
});

// =====================================
// END
// =====================================

console.log("SOIL-MOD v3.3 FULL MERGED LOADED");