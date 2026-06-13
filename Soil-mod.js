// =====================================
// SOIL-MOD – MASTER SYSTEM v4 (CLEAN FIX)
// CORE + EXTENSIONS MERGED + FIXED ENGINE
// =====================================

console.log("SOIL-MOD v4 LOADING...");

// =============================
// SAFE CORE HELPERS
// =============================

function safeElement(name, data){
    if(!elements[name]){
        data.category = data.category || "soil_expansion";
        data.state = data.state || "solid";
        elements[name] = data;
    }
}

function addReaction(name, from, result){
    if(!elements[name]) return;
    elements[name].reactions = elements[name].reactions || {};
    elements[name].reactions[from] = result;
}

// cooldown system
function cd(p, key, ms){
    p._cd = p._cd || {};
    let now = Date.now();
    if(!p._cd[key] || now > p._cd[key]){
        p._cd[key] = now + ms;
        return true;
    }
    return false;
}

// =============================
// FIXED TICK ENGINE (IMPORTANT)
// =============================

function addTick(name, fn){

    if(!elements[name]) return;

    if(!elements[name]._ticks){
        elements[name]._ticks = [];
    }

    elements[name]._ticks.push(fn);

    if(elements[name]._wrapped) return;

    const old = elements[name].tick;

    elements[name].tick = function(p){

        if(old) old(p);

        let list = elements[name]._ticks;

        for(let i=0;i<list.length;i++){
            try { list[i](p); } catch(e){}
        }
    };

    elements[name]._wrapped = true;
}

// =============================
// NEIGHBOR SYSTEM
// =============================

function neighbors(p){
    return [
        pixelMap?.[p.x+1]?.[p.y],
        pixelMap?.[p.x-1]?.[p.y],
        pixelMap?.[p.x]?.[p.y+1],
        pixelMap?.[p.x]?.[p.y-1]
    ].filter(Boolean);
}

// =============================
// BASE ELEMENTS
// =============================

safeElement("sand",{color:"#d6c39a",behavior:behaviors.POWDER});
safeElement("dirt",{color:"#6b4f2a",behavior:behaviors.POWDER});
safeElement("humus",{color:"#3b2a1f",behavior:behaviors.POWDER});

safeElement("fertilizer_n",{color:"#66cc66",behavior:behaviors.POWDER});
safeElement("fertilizer_p",{color:"#6699ff",behavior:behaviors.POWDER});
safeElement("fertilizer_k",{color:"#ffcc66",behavior:behaviors.POWDER});

// =============================
// SOIL TYPES
// =============================

safeElement("sandy_soil",{color:"#c4a772",behavior:behaviors.POWDER});
safeElement("fertile_soil",{color:"#3d2416",behavior:behaviors.POWDER});
safeElement("rich_soil",{color:"#4b2f1a",behavior:behaviors.POWDER});
safeElement("super_fertile_soil",{color:"#2d1b12",behavior:behaviors.POWDER});

safeElement("moist_soil",{color:"#4f3727",behavior:behaviors.POWDER});
safeElement("eroded_soil",{color:"#9b7f60",behavior:behaviors.POWDER});

// =============================
// ORGANIC
// =============================

safeElement("compost",{color:"#5a3d22",behavior:behaviors.POWDER});
safeElement("manure",{color:"#6b4423",behavior:behaviors.POWDER});
safeElement("peat",{color:"#2a1b12",behavior:behaviors.POWDER});

// =============================
// BIOLOGY
// =============================

safeElement("mycorrhiza",{color:"#e8d8b0",behavior:behaviors.POWDER});

safeElement("earthworm",{color:"#b08c6a",behavior:behaviors.MOVINGPOWDER});

// =============================
// MACHINE
// =============================

safeElement("composter",{color:"#8b5a2b",behavior:behaviors.WALL});

// =============================
// SEEDS
// =============================

safeElement("wheat_seed",{color:"#d9c27a",behavior:behaviors.POWDER});

// =============================
// SOIL EVOLUTION CORE
// =============================

// dirt + sand → sandy
addTick("dirt", function(p){
    if(!cd(p,"d",4000)) return;
    if(neighbors(p).find(x=>x.element==="sand")){
        changePixel(p,"sandy_soil");
    }
});

// sandy + humus
addTick("sandy_soil", function(p){
    if(!cd(p,"s",4000)) return;
    if(neighbors(p).find(x=>x.element==="humus")){
        changePixel(p,"fertile_soil");
    }
});

// fertile + humus
addTick("fertile_soil", function(p){
    if(!cd(p,"f",4000)) return;
    if(neighbors(p).find(x=>x.element==="humus")){
        changePixel(p,"rich_soil");
    }
});

// rich + fertilizer
addTick("rich_soil", function(p){
    if(!cd(p,"r",4000)) return;
    if(neighbors(p).find(x=>x.element?.includes("fertilizer"))){
        changePixel(p,"super_fertile_soil");
    }
});

// =============================
// PLANT GROWTH
// =============================

addTick("wheat_seed", function(p){

    p.g = p.g || 0;

    let b = pixelMap?.[p.x]?.[p.y+1];

    if(b){
        if(b.element==="moist_soil") p.g += 0.02;
        if(b.element==="fertile_soil") p.g += 0.03;
        if(b.element==="rich_soil") p.g += 0.05;
        if(b.element==="super_fertile_soil") p.g += 0.08;
        if(b.element==="eroded_soil") p.g += 0.005;
    }

    if(p.g > 1){
        changePixel(p,"plant");
    }

    // root influence
    neighbors(p).forEach(n=>{
        if(n.element==="fertile_soil") changePixel(n,"rich_soil");
        if(n.element==="rich_soil") changePixel(n,"super_fertile_soil");
    });
});

// =============================
// MOISTURE
// =============================

addTick("moist_soil", function(p){
    if(Math.random()<0.0005){
        changePixel(p,"eroded_soil");
    }
});

// =============================
// MYCORRHIZA (FIXED - ACTIVE)
// =============================

addTick("mycorrhiza", function(p){

    neighbors(p).forEach(n=>{

        if(n.element==="rich_soil" && Math.random()<0.05){
            changePixel(n,"super_fertile_soil");
        }

        if(n.element==="compost" && Math.random()<0.08){
            changePixel(n,"humus");
        }
    });
});

// =============================
// EARTHWORM (FIXED MOVEMENT)
// =============================

addTick("earthworm", function(p){

    let dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    let d = dirs[Math.floor(Math.random()*dirs.length)];

    let t = pixelMap?.[p.x+d[0]]?.[p.y+d[1]];

    if(!t) return;

    if(t.element==="dirt"){
        changePixel(t,"fertile_soil");
    }

    if(t.element==="fertile_soil"){
        changePixel(t,"rich_soil");
    }

    // movement simulation
    if(Math.random()<0.4 && t){
        swapPixel?.(p,t);
    }
});

// =============================
// COMPOSTER
// =============================

addTick("composter", function(p){

    neighbors(p).forEach(n=>{
        if(["plant","wood","leaf","grass","dead_plant"].includes(n.element)){
            changePixel(n,"compost");
        }
    });
});

// =============================
// FERTILIZER OVERUSE
// =============================

addTick("super_fertile_soil", function(p){

    if(neighbors(p).find(x=>x.element?.includes("fertilizer"))){
        if(Math.random()<0.001){
            changePixel(p,"acidic_soil");
        }
    }
});

// =============================
// INTEGRATION
// =============================

addReaction("dirt","sand",{elem2:"sandy_soil"});

console.log("SOIL-MOD v4 LOADED ✔");