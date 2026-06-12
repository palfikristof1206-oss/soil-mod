// =============================
// Soil Expansion v3.0
// =============================

log("Soil Expansion v3.0 loading...");

// =============================
// ORGANIC MATERIALS
// =============================

elements.humus = {
    color:"#3b2a1f",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    state:"solid",
    density:850,
    reactions:{
        sand:{elem1:"dirt", elem2:"dirt"},
        water:{elem1:"rich_soil"}
    }
};

elements.compost = {
    color:"#5a3d22",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:700,
    reactions:{
        dirt:{elem2:"rich_soil"},
        sand:{elem2:"humus"}
    }
};

elements.manure = {
    color:"#6b4423",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:900,
    reactions:{
        dirt:{elem2:"fertile_soil"},
        water:{elem1:"compost"}
    }
};

elements.peat = {
    color:"#2a1b12",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:600,
    reactions:{
        water:{elem1:"humus"}
    }
};

// =============================
// SOILS
// =============================

elements.rich_soil = {
    color:"#4b2f1a",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:1100,
    reactions:{
        water:{elem1:"rich_mud"},
        fertilizer_n:{elem1:"super_fertile_soil"},
        fertilizer_p:{elem1:"super_fertile_soil"},
        fertilizer_k:{elem1:"super_fertile_soil"}
    }
};

elements.fertile_soil = {
    color:"#3d2416",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:1050,
    reactions:{
        water:{elem1:"moist_soil"}
    }
};

elements.moist_soil = {
    color:"#4f3727",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:1200,
    tick:function(pixel){
        if(Math.random()<0.0005){
            changePixel(pixel,"eroded_soil");
        }
    }
};

elements.sandy_soil = {
    color:"#c4a772",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:1300,
    reactions:{
        humus:{elem1:"rich_soil"}
    }
};

elements.rich_mud = {
    color:"#3e2617",
    behavior:behaviors.STURDYPOWDER,
    category:"soil_expansion",
    density:1250
};

elements.eroded_soil = {
    color:"#9b7f60",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:1000
};

elements.compacted_soil = {
    color:"#6e4b34",
    behavior:behaviors.STURDYPOWDER,
    category:"soil_expansion",
    density:1800
};

elements.super_fertile_soil = {
    color:"#2d1b12",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    density:1200
};

// =============================
// NPK FERTILIZERS
// =============================

elements.fertilizer_n = {
    color:"#66cc66",
    behavior:behaviors.POWDER,
    category:"soil_expansion"
};

elements.fertilizer_p = {
    color:"#6699ff",
    behavior:behaviors.POWDER,
    category:"soil_expansion"
};

elements.fertilizer_k = {
    color:"#ffcc66",
    behavior:behaviors.POWDER,
    category:"soil_expansion"
};

// =============================
// pH SYSTEM
// =============================

elements.lime = {
    color:"#dddddd",
    behavior:behaviors.POWDER,
    category:"soil_expansion",
    reactions:{
        acidic_soil:{elem1:"neutral_soil"}
    }
};

elements.acidic_soil = {
    color:"#5a3420",
    behavior:behaviors.POWDER,
    category:"soil_expansion"
};

elements.neutral_soil = {
    color:"#4a2c1b",
    behavior:behaviors.POWDER,
    category:"soil_expansion"
};

elements.alkaline_soil = {
    color:"#8a6b4a",
    behavior:behaviors.POWDER,
    category:"soil_expansion"
};

// =============================
// BIOLOGY
// =============================

elements.mycorrhiza = {
    color:"#e8d8b0",
    behavior:behaviors.POWDER,
    category:"life",
    reactions:{
        rich_soil:{elem2:"super_fertile_soil"}
    }
};

// =============================
// WEATHER
// =============================

elements.rain_cloud = {
    color:"#888888",
    behavior:[
        "XX|CR:water|XX",
        "M1|XX|M1",
        "XX|XX|XX"
    ],
    category:"weather"
};

// =============================
// COMPOSTER
// =============================

elements.composter = {
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
};

// =============================
// CROPS
// =============================

elements.wheat_seed = { color:"#d9c27a", behavior:behaviors.POWDER, category:"life" };
elements.tomato_seed = { color:"#c04040", behavior:behaviors.POWDER, category:"life" };
elements.potato_seed = { color:"#9b6b43", behavior:behaviors.POWDER, category:"life" };

// =============================
// BASIC INTEGRATIONS
// =============================

if(!elements.dirt.reactions) elements.dirt.reactions = {};

elements.dirt.reactions.sand = {
    elem1:"sandy_soil",
    elem2:null
};

console.log("Soil Expansion v3.0 loaded!");