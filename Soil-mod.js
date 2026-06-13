// =============================
// Soil Expansion v3.3 STABLE FIXED BUILD
// =============================

console.log("Soil Expansion v3.3 STABLE loading...");

// =============================
// SAFE CORE
// =============================

function safeElement(name, data){

    if(!elements[name]){

        if(data.reactions && typeof data.reactions !== "object"){
            data.reactions = {};
        }

        if(!data.state) data.state = "solid";
        if(!data.category) data.category = "soil_expansion";

        elements[name] = data;

    } else {
        console.warn("[SoilMod] exists:", name);
    }
}

// prevent multi tick overwrite
function addTick(name, fn){

    if(!elements[name]) return;
    if(elements[name]._soil_v33_fixed) return;

    const old = elements[name].tick;

    elements[name].tick = function(pixel){
        if(old) old(pixel);
        fn(pixel);
    };

    elements[name]._soil_v33_fixed = true;
}

// =============================
// COOLDOWN ENGINE
// =============================

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
// ELEMENTS (ALL VISIBLE FIX)
// =============================

safeElement("humus", { color:"#3b2a1f", behavior:behaviors.POWDER, state:"solid" });

safeElement("sandy_soil", { color:"#c4a772", behavior:behaviors.POWDER, state:"solid" });

safeElement("fertile_soil", { color:"#3d2416", behavior:behaviors.POWDER, state:"solid" });

safeElement("rich_soil", { color:"#4b2f1a", behavior:behaviors.POWDER, state:"solid" });

safeElement("super_fertile_soil", { color:"#2d1b12", behavior:behaviors.POWDER, state:"solid" });

// missing palette fix elements
safeElement("compost", { color:"#5a3d22", behavior:behaviors.POWDER, state:"solid" });
safeElement("manure", { color:"#6b4423", behavior:behaviors.POWDER, state:"solid" });
safeElement("peat", { color:"#2a1b12", behavior:behaviors.POWDER, state:"solid" });

safeElement("fertilizer_n", { color:"#66cc66", behavior:behaviors.POWDER, state:"solid" });
safeElement("fertilizer_p", { color:"#6699ff", behavior:behaviors.POWDER, state:"solid" });
safeElement("fertilizer_k", { color:"#ffcc66", behavior:behaviors.POWDER, state:"solid" });

safeElement("acidic_soil", { color:"#5a3420", behavior:behaviors.POWDER, state:"solid" });
safeElement("neutral_soil", { color:"#4a2c1b", behavior:behaviors.POWDER, state:"solid" });
safeElement("alkaline_soil", { color:"#8a6b4a", behavior:behaviors.POWDER, state:"solid" });

safeElement("mycorrhiza", {
    color:"#e8d8b0",
    behavior:behaviors.POWDER,
    state:"solid"
});

// =============================
// CORE SOIL MIXING (FIXED NO CHAINS BUG)
// =============================

// dirt + sand -> sandy soil
addTick("dirt", function(pixel){

    if(!cd(pixel,"mix1",10000)) return;

    const r = pixelMap?.[pixel.x+1]?.[pixel.y];
    const l = pixelMap?.[pixel.x-1]?.[pixel.y];

    const p = r || l;

    if(p?.element === "sand"){
        changePixel(pixel,"sandy_soil");
    }
});

// sandy + humus -> fertile
addTick("sandy_soil", function(pixel){

    if(!cd(pixel,"mix2",10000)) return;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(p?.element === "humus"){
            changePixel(pixel,"fertile_soil");
            break;
        }
    }
});

// fertile + humus -> rich
addTick("fertile_soil", function(pixel){

    if(!cd(pixel,"mix3",10000)) return;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(p?.element === "humus"){
            changePixel(pixel,"rich_soil");
            break;
        }
    }
});

// rich + fertilizer -> super fertile
addTick("rich_soil", function(pixel){

    if(!cd(pixel,"mix4",10000)) return;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(!p) continue;

        if(
            p.element === "fertilizer_n" ||
            p.element === "fertilizer_p" ||
            p.element === "fertilizer_k"
        ){
            changePixel(pixel,"super_fertile_soil");
            break;
        }
    }
});

// =============================
// SOIL AI (FIXED SINGLE SYSTEM ONLY)
// =============================

addTick("dirt", function(pixel){

    let score = 0;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(!p) continue;

        if(p.element === "humus") score += 2;
        if(p.element === "compost") score += 2;
        if(p.element === "manure") score += 3;
    }

    if(score >= 4 && Math.random() < 0.002){
        changePixel(pixel,"fertile_soil");
    }
});

// =============================
// MOISTURE SPREAD FIXED
// =============================

addTick("moist_soil", function(pixel){

    if(!cd(pixel,"moist",3000)) return;

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    for(const d of dirs){
        const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(p?.element === "dirt" && Math.random() < 0.01){
            changePixel(p,"moist_soil");
        }
    }
});

// =============================
// DIFFUSION LIGHT FIX
// =============================

function diffuse(a,b){
    if(!a || !b) return;

    if(a.element === "rich_soil" && b.element === "dirt"){
        if(Math.random() < 0.001) changePixel(b,"fertile_soil");
    }

    if(a.element === "fertile_soil" && b.element === "dirt"){
        if(Math.random() < 0.0005) changePixel(b,"sandy_soil");
    }
}

["rich_soil","fertile_soil"].forEach(name => {

    if(!elements[name] || elements[name]._diff_fixed) return;

    const old = elements[name].tick;

    elements[name].tick = function(pixel){
        if(old) old(pixel);

        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

        for(const d of dirs){
            const p = pixelMap?.[pixel.x+d[0]]?.[pixel.y+d[1]];
            diffuse(pixel,p);
        }
    };

    elements[name]._diff_fixed = true;
});

// =============================
// END
// =============================

console.log("Soil Expansion v3.3 STABLE FIXED LOADED");
console.log("END DONE");