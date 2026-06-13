// =====================================
// SOIL-MOD – MASTER FULL SYSTEM
// CORE + EXTENSION1 + EXTENSION2 MERGED
// Sandboxels Mod
// =====================================

console.log("SOIL-MOD MASTER LOADING...");

// =============================
// SAFE CORE HELPERS
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

function addReaction(name, from, result){
    if(!elements[name]) return;
    if(!elements[name].reactions) elements[name].reactions = {};
    elements[name].reactions[from] = result;
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

// =============================
// BASE MATERIALS
// =============================

safeElement("sand", { color:"#d6c39a", behavior:behaviors.POWDER });
safeElement("dirt", { color:"#6b4f2a", behavior:behaviors.POWDER });
safeElement("humus", { color:"#3b2a1f", behavior:behaviors.POWDER });

safeElement("fertilizer_n", { color:"#66cc66", behavior:behaviors.POWDER });
safeElement("fertilizer_p", { color:"#6699ff", behavior:behaviors.POWDER });
safeElement("fertilizer_k", { color:"#ffcc66", behavior:behaviors.POWDER });

// =============================
// SOIL TYPES
// =============================

safeElement("sandy_soil", { color:"#c4a772", behavior:behaviors.POWDER });
safeElement("fertile_soil", { color:"#3d2416", behavior:behaviors.POWDER });
safeElement("rich_soil", { color:"#4b2f1a", behavior:behaviors.POWDER });
safeElement("super_fertile_soil", { color:"#2d1b12", behavior:behaviors.POWDER });

safeElement("moist_soil", { color:"#4f3727", behavior:behaviors.POWDER });
safeElement("eroded_soil", { color:"#9b7f60", behavior:behaviors.POWDER });
safeElement("compacted_soil", { color:"#6e4b34", behavior:behaviors.STURDYPOWDER });

// =============================
// ORGANIC MATERIALS
// =============================

safeElement("compost", { color:"#5a3d22", behavior:behaviors.POWDER });
safeElement("manure", { color:"#6b4423", behavior:behaviors.POWDER });
safeElement("peat", { color:"#2a1b12", behavior:behaviors.POWDER });

// =============================
// PH SYSTEM
// =============================

safeElement("acidic_soil", { color:"#5a3420", behavior:behaviors.POWDER });
safeElement("neutral_soil", { color:"#4a2c1b", behavior:behaviors.POWDER });
safeElement("alkaline_soil", { color:"#8a6b4a", behavior:behaviors.POWDER });
safeElement("lime", { color:"#dddddd", behavior:behaviors.POWDER });

// =============================
// BIOLOGY
// =============================

safeElement("mycorrhiza", { color:"#e8d8b0", behavior:behaviors.POWDER });
safeElement("earthworm", { color:"#b08c6a", behavior:behaviors.MOVINGPOWDER });

// =============================
// MACHINE
// =============================

safeElement("composter", {
    color:"#8b5a2b",
    behavior:behaviors.WALL
});

// =============================
// SEEDS
// =============================

safeElement("wheat_seed", { color:"#d9c27a", behavior:behaviors.POWDER });
safeElement("tomato_seed", { color:"#c04040", behavior:behaviors.POWDER });
safeElement("potato_seed", { color:"#9b6b43", behavior:behaviors.POWDER });

// =============================
// WEATHER
// =============================

safeElement("rain_cloud", {
    color:"#888888",
    behavior:[
        "XX|CR:water|XX",
        "M1|XX|M1",
        "XX|XX|XX"
    ]
});

// =============================
// CORE SOIL EVOLUTION
// =============================

function neighbors(p){
    return [
        [1,0],[-1,0],[0,1],[0,-1]
    ].map(d => pixelMap?.[p.x+d[0]]?.[p.y+d[1]]);
}

// dirt + sand → sandy
addTick("dirt", function(p){
    if(!cd(p,"d",5000)) return;
    let n = neighbors(p);
    if(n.find(x=>x?.element==="sand")){
        changePixel(p,"sandy_soil");
    }
});

// sandy + humus → fertile
addTick("sandy_soil", function(p){
    if(!cd(p,"s",5000)) return;
    if(neighbors(p).find(x=>x?.element==="humus")){
        changePixel(p,"fertile_soil");
    }
});

// fertile + humus → rich
addTick("fertile_soil", function(p){
    if(!cd(p,"f",5000)) return;
    if(neighbors(p).find(x=>x?.element==="humus")){
        changePixel(p,"rich_soil");
    }
});

// rich + fertilizer → super
addTick("rich_soil", function(p){
    if(!cd(p,"r",5000)) return;
    if(neighbors(p).find(x=>x?.element?.includes("fertilizer"))){
        changePixel(p,"super_fertile_soil");
    }
});

// =============================
// EXTENSION 1 – PLANT GROWTH
// =============================

addTick("wheat_seed", function(p){
    p.g = (p.g || 0);

    let below = pixelMap?.[p.x]?.[p.y+1];

    if(below){
        if(below.element==="moist_soil") p.g += 0.02;
        if(below.element==="fertile_soil") p.g += 0.03;
        if(below.element==="rich_soil") p.g += 0.05;
        if(below.element==="super_fertile_soil") p.g += 0.08;
        if(below.element==="eroded_soil") p.g += 0.005;
    }

    if(p.g > 1){
        changePixel(p,"plant");
    }
});

// =============================
// EXTENSION 1 – EROSION
// =============================

addTick("moist_soil", function(p){
    if(Math.random()<0.0005){
        changePixel(p,"eroded_soil");
    }
});

// =============================
// EXTENSION 1 – MICROBIOME
// =============================

addTick("mycorrhiza", function(p){
    for(let d of neighbors(p)){
        if(!d) continue;
        if(d.element==="rich_soil" && Math.random()<0.01){
            changePixel(d,"super_fertile_soil");
        }
        if(d.element==="compost" && Math.random()<0.02){
            changePixel(d,"humus");
        }
    }
});

// =============================
// EXTENSION 2 – ROOT SYSTEM
// =============================

addTick("wheat_seed", function(p){
    for(let d of neighbors(p)){
        if(!d) continue;
        if(d.element==="fertile_soil") changePixel(d,"rich_soil");
        if(d.element==="rich_soil") changePixel(d,"super_fertile_soil");
    }
});

// =============================
// EXTENSION 2 – EARTHWORM
// =============================

addTick("earthworm", function(p){
    for(let d of neighbors(p)){
        if(!d) continue;

        if(d.element==="dirt" && Math.random()<0.005){
            changePixel(d,"fertile_soil");
        }

        if(d.element==="fertile_soil" && Math.random()<0.01){
            changePixel(d,"rich_soil");
        }
    }
});

// =============================
// EXTENSION 2 – NUTRIENT DRAIN
// =============================

addTick("rich_soil", function(p){
    if(Math.random()<0.0003){
        changePixel(p,"fertile_soil");
    }
});

addTick("fertile_soil", function(p){
    if(Math.random()<0.0002){
        changePixel(p,"dirt");
    }
});

// =============================
// EXTENSION 2 – FERTILIZER OVERUSE
// =============================

addTick("super_fertile_soil", function(p){
    if(neighbors(p).find(x=>x?.element?.includes("fertilizer"))){
        if(Math.random()<0.001){
            changePixel(p,"acidic_soil");
        }
    }
});

// =============================
// COMPOSTER
// =============================

addTick("composter", function(p){
    for(let d of neighbors(p)){
        if(!d) continue;

        if(["plant","wood","leaf","grass","dead_plant"].includes(d.element)){
            changePixel(d,"compost");
        }
    }
});

// =============================
// INTEGRATION
// =============================

addReaction("dirt","sand",{ elem2:"sandy_soil" });

console.log("SOIL-MOD MASTER LOADED ✔");