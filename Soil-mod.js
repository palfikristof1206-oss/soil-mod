// =============================
// Soil Expansion v3.0 - FINAL SAFE BUILD
// =============================

console.log("Soil Expansion v3.0 loading...");

// =============================
// SAFE HELPERS
// =============================

function safeElement(name, data){

    if(!elements[name]){

        // ensure reactions exists safely
        if(data.reactions && typeof data.reactions !== "object"){
            data.reactions = {};
        }

        elements[name] = data;

    } else {
        console.warn("[SoilMod] Exists:", name);
    }
}

// safe tick extender (NEVER overwrite core)
function addTick(name, fn){

    if(!elements[name]) return;
    if(elements[name]._soil_v3) return;

    const old = elements[name].tick;

    elements[name].tick = function(pixel){
        if(old) old(pixel);
        fn(pixel);
    };

    elements[name]._soil_v3 = true;
}

// safe reaction merge
function addReaction(name, from, result){

    if(!elements[name]) return;
    if(!elements[name].reactions) elements[name].reactions = {};

    elements[name].reactions[from] = result;
}

// =============================
// ORGANIC MATERIALS
// =============================

safeElement("humus", {
    color:"#3b2a1f",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    state:"solid",
    density:850,
    reactions:{
        sand:{elem2:"dirt"},
        water:{elem2:"rich_soil"}
    }
});

safeElement("compost", {
    color:"#5a3d22",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:700,
    reactions:{
        dirt:{elem2:"rich_soil"},
        sand:{elem2:"humus"}
    }
});

safeElement("manure", {
    color:"#6b4423",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:900,
    reactions:{
        dirt:{elem2:"fertile_soil"},
        water:{elem2:"compost"}
    }
});

safeElement("peat", {
    color:"#2a1b12",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:600,
    reactions:{
        water:{elem2:"humus"}
    }
});

// =============================
// SOILS
// =============================

safeElement("rich_soil", {
    color:"#4b2f1a",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:1100,
    reactions:{
        water:{elem2:"rich_mud"},
        fertilizer_n:{elem2:"super_fertile_soil"},
        fertilizer_p:{elem2:"super_fertile_soil"},
        fertilizer_k:{elem2:"super_fertile_soil"}
    }
});

safeElement("fertile_soil", {
    color:"#3d2416",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:1050,
    reactions:{
        water:{elem2:"moist_soil"}
    }
});

safeElement("moist_soil", {
    color:"#4f3727",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:1200
});

safeElement("sandy_soil", {
    color:"#c4a772",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:1300,
    reactions:{
        humus:{elem2:"rich_soil"}
    }
});

safeElement("rich_mud", {
    color:"#3e2617",
    behavior:behaviors.STURDYPOWDER,
    category:"soil_expansion",
    density:1250
});

safeElement("eroded_soil", {
    color:"#9b7f60",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:1000
});

safeElement("compacted_soil", {
    color:"#6e4b34",
    behavior:behaviors.STURDYPOWDER,
    category:"soil_expansion",
    density:1800
});

safeElement("super_fertile_soil", {
    color:"#2d1b12",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:1200
});

// erosion (SAFE tick add)
addTick("moist_soil", function(pixel){
    if(Math.random() < 0.0005){
        changePixel(pixel,"eroded_soil");
    }
});

// =============================
// NPK
// =============================

safeElement("fertilizer_n", { color:"#66cc66", behavior:behaviors.POWDER, category:"soil_expansion" });
safeElement("fertilizer_p", { color:"#6699ff", behavior:behaviors.POWDER, category:"soil_expansion" });
safeElement("fertilizer_k", { color:"#ffcc66", behavior:behaviors.POWDER, category:"soil_expansion" });

// =============================
// pH
// =============================

safeElement("lime", {
    color:"#dddddd",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    reactions:{
        acidic_soil:{elem2:"neutral_soil"}
    }
});

safeElement("acidic_soil", { color:"#5a3420", behavior:behaviors.POWDER, category:"soil_expansion" });
safeElement("neutral_soil", { color:"#4a2c1b", behavior:behaviors.POWDER, category:"soil_expansion" });
safeElement("alkaline_soil", { color:"#8a6b4a", behavior:behaviors.POWDER, category:"soil_expansion" });

// =============================
// BIOLOGY
// =============================

safeElement("mycorrhiza", {
    color:"#e8d8b0",
    behavior:behaviors.POWDER,
    category:"life",
    reactions:{
        rich_soil:{elem2:"super_fertile_soil"}
    }
});

// =============================
// WEATHER
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
// CROPS
// =============================

safeElement("wheat_seed", { color:"#d9c27a", behavior:behaviors.POWDER, category:"life" });
safeElement("tomato_seed", { color:"#c04040", behavior:behaviors.POWDER, category:"life" });
safeElement("potato_seed", { color:"#9b6b43", behavior:behaviors.POWDER, category:"life" });

// =============================
// SAFE GLOBAL INTEGRATION
// =============================

if(elements.dirt){
    if(!elements.dirt.reactions) elements.dirt.reactions = {};

    addReaction("dirt","sand",{
        elem2:"sandy_soil"
    });
}

console.log("Soil Expansion v3.0 FIXED SAFE BUILD loaded!");