// =====================================================================
// 🌱 SOIL-MOD v5.1 – COMPLETE ECOSYSTEM SIMULATION
// Egy fájlba integrált teljes verzió – Javított mycorrhiza + Mixing
// =====================================================================

console.log("🌱 SOIL-MOD v5.1 LOADING...");

// =====================================================================
// 1. CORE HELPERS
// =====================================================================

function safeElement(name, data) {
    if (!elements[name]) {
        data.category = data.category || "soil_mod";
        data.state = data.state || "solid";
        data.temp = data.temp || 20;
        data.tempHigh = data.tempHigh || (data.burn ? 200 : 1500);
        data.stateHigh = data.stateHigh || (data.burn ? "fire" : "molten_silicate");
        data.tempLow = data.tempLow || -100;
        data.stateLow = data.stateLow || "ice";
        elements[name] = data;
    }
}

function changePixel(p, newElement) {
    if (p && newElement && elements[newElement] && pixelMap && pixelMap[p.x] && pixelMap[p.x][p.y]) {
        pixelMap[p.x][p.y].element = newElement;
        pixelMap[p.x][p.y].color = elements[newElement].color;
    }
}

function swapPixel(p1, p2) {
    if (!p1 || !p2) return;
    let tempEl = p1.element;
    let tempCol = p1.color;
    let tempTemp = p1.temp;
    p1.element = p2.element;
    p1.color = p2.color;
    p1.temp = p2.temp;
    p2.element = tempEl;
    p2.color = tempCol;
    p2.temp = tempTemp;
}

function cd(p, key, ms) {
    p._cd = p._cd || {};
    let now = Date.now();
    if (!p._cd[key] || now > p._cd[key]) {
        p._cd[key] = now + ms;
        return true;
    }
    return false;
}

function neighbors(p) {
    return [
        pixelMap?.[p.x + 1]?.[p.y],
        pixelMap?.[p.x - 1]?.[p.y],
        pixelMap?.[p.x]?.[p.y + 1],
        pixelMap?.[p.x]?.[p.y - 1]
    ].filter(Boolean);
}

function neighbors8(p) {
    return [
        pixelMap?.[p.x + 1]?.[p.y],
        pixelMap?.[p.x - 1]?.[p.y],
        pixelMap?.[p.x]?.[p.y + 1],
        pixelMap?.[p.x]?.[p.y - 1],
        pixelMap?.[p.x + 1]?.[p.y + 1],
        pixelMap?.[p.x - 1]?.[p.y + 1],
        pixelMap?.[p.x + 1]?.[p.y - 1],
        pixelMap?.[p.x - 1]?.[p.y - 1]
    ].filter(Boolean);
}

function addTick(name, fn) {
    if (!elements[name]) return;
    if (!elements[name]._ticks) {
        elements[name]._ticks = [];
    }
    elements[name]._ticks.push(fn);
    if (elements[name]._wrapped) return;
    const old = elements[name].tick;
    elements[name].tick = function (p) {
        if (old) old(p);
        let list = elements[name]._ticks;
        for (let i = 0; i < list.length; i++) {
            try { list[i](p); } catch (e) {}
        }
    };
    elements[name]._wrapped = true;
}

function addReaction(name, from, result) {
    if (!elements[name]) return;
    elements[name].reactions = elements[name].reactions || {};
    elements[name].reactions[from] = result;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(percent) {
    return Math.random() * 100 < percent;
}

console.log("✅ [1/14] Core Helpers loaded");

// =====================================================================
// 2. TALAJTÍPUSOK
// =====================================================================

// Alap talajok
safeElement("dirt", { color: "#6b4f2a", behavior: behaviors.POWDER, category: "soil_basic" });
safeElement("sand", { color: "#d6c39a", behavior: behaviors.POWDER, category: "soil_basic" });
safeElement("mud", { color: "#5c4a2a", behavior: behaviors.POWDER, category: "soil_basic" });

// Fejlett talajok
safeElement("sandy_soil", { color: "#c4a772", behavior: behaviors.POWDER, category: "soil_advanced" });
safeElement("fertile_soil", { color: "#3d2416", behavior: behaviors.POWDER, category: "soil_advanced" });
safeElement("rich_soil", { color: "#4b2f1a", behavior: behaviors.POWDER, category: "soil_advanced" });
safeElement("super_fertile_soil", { color: "#2d1b12", behavior: behaviors.POWDER, category: "soil_advanced" });

// Reális talajok
safeElement("loam", { color: "#8b7355", behavior: behaviors.POWDER, category: "soil_realistic" });
safeElement("sandy_loam", { color: "#b8a67c", behavior: behaviors.POWDER, category: "soil_realistic" });
safeElement("silt_loam", { color: "#9c8b6e", behavior: behaviors.POWDER, category: "soil_realistic" });
safeElement("clay_soil", { color: "#8b6b4a", behavior: behaviors.POWDER, category: "soil_realistic" });
safeElement("peaty_soil", { color: "#2a1b12", behavior: behaviors.POWDER, category: "soil_realistic" });
safeElement("forest_soil", { color: "#3b2b15", behavior: behaviors.POWDER, category: "soil_realistic" });
safeElement("black_earth", { color: "#1a0f08", behavior: behaviors.POWDER, category: "soil_realistic" });
safeElement("volcanic_soil", { color: "#4a3a2a", behavior: behaviors.POWDER, category: "soil_realistic" });
safeElement("rocky_soil", { color: "#8b8b7a", behavior: behaviors.POWDER, category: "soil_realistic" });

// Speciális talajok
safeElement("compacted_soil", { color: "#6b5b4a", behavior: behaviors.SUPPORT, category: "soil_special" });
safeElement("eroded_soil", { color: "#9b7f60", behavior: behaviors.POWDER, category: "soil_special" });
safeElement("depleted_soil", { color: "#7b6b5a", behavior: behaviors.POWDER, category: "soil_special" });
safeElement("waterlogged_soil", { color: "#3b3b2a", behavior: behaviors.POWDER, category: "soil_special" });
safeElement("cracked_soil", { color: "#8b6b4a", behavior: behaviors.SUPPORT, category: "soil_special" });
safeElement("burnt_soil", { color: "#2a1a0a", behavior: behaviors.POWDER, category: "soil_special" });

// Mutált talajok
safeElement("irradiated_soil", { color: "#4a8b2a", behavior: behaviors.POWDER, category: "soil_mutated" });
safeElement("living_soil", { color: "#3b5a1a", behavior: behaviors.POWDER, category: "soil_mutated" });
safeElement("old_growth_soil", { color: "#1b0a05", behavior: behaviors.POWDER, category: "soil_mutated" });
safeElement("fertile_volcanic_soil", { color: "#3a2a1a", behavior: behaviors.POWDER, category: "soil_mutated" });

// pH talajok
safeElement("acidic_soil", { color: "#8b9e4b", behavior: behaviors.POWDER, category: "soil_ph" });
safeElement("neutral_soil", { color: "#8b7b5a", behavior: behaviors.POWDER, category: "soil_ph" });
safeElement("alkaline_soil", { color: "#9b9b7a", behavior: behaviors.POWDER, category: "soil_ph" });
safeElement("lime", { color: "#eeeeee", behavior: behaviors.POWDER, category: "soil_ph" });

console.log("✅ [2/14] Soil Types loaded");

// =====================================================================
// 3. SZERVES ANYAGOK + NPK
// =====================================================================

safeElement("compost", { color: "#5a3d22", behavior: behaviors.POWDER, burn: 40, category: "organic" });
safeElement("humus", { color: "#3b2a1f", behavior: behaviors.POWDER, burn: 50, category: "organic" });
safeElement("manure", { color: "#6b4423", behavior: behaviors.POWDER, burn: 35, category: "organic" });
safeElement("peat", { color: "#2a1b12", behavior: behaviors.POWDER, burn: 60, category: "organic" });
safeElement("leaf_litter", { color: "#8b6b2a", behavior: behaviors.POWDER, burn: 30, category: "organic" });
safeElement("leaf", { color: "#4a8b2a", behavior: behaviors.POWDER, burn: 25, category: "organic" });

// NPK műtrágyák
safeElement("fertilizer_n", { color: "#66cc66", behavior: behaviors.POWDER, category: "npk" });
safeElement("fertilizer_p", { color: "#6699ff", behavior: behaviors.POWDER, category: "npk" });
safeElement("fertilizer_k", { color: "#ffcc66", behavior: behaviors.POWDER, category: "npk" });

// Égéstermékek
safeElement("charcoal", { color: "#1a1a1a", behavior: behaviors.POWDER, burn: 80, category: "organic_burned" });
safeElement("ash", { color: "#cccccc", behavior: behaviors.POWDER, category: "organic_burned" });

console.log("✅ [3/14] Organic Materials + NPK loaded");

// =====================================================================
// 4. LEBOMLÁSI LÁNC
// =====================================================================

// leaf → leaf_litter
addTick("leaf", function (p) {
    if (!cd(p, "decay_leaf", 5000)) return;
    if (chance(2)) changePixel(p, "leaf_litter");
});

// leaf_litter → compost
addTick("leaf_litter", function (p) {
    if (!cd(p, "decay_litter", 6000)) return;
    let wet = neighbors(p).find(x => x.element === "water");
    if (chance(wet ? 8 : 3)) changePixel(p, "compost");
});

// compost → humus
addTick("compost", function (p) {
    if (!cd(p, "decay_compost", 8000)) return;
    if (chance(2)) changePixel(p, "humus");
});

// manure → humus (gyorsabban)
addTick("manure", function (p) {
    if (!cd(p, "decay_manure", 4000)) return;
    if (chance(5)) changePixel(p, "humus");
});

// peat → humus (lassan)
addTick("peat", function (p) {
    if (!cd(p, "decay_peat", 15000)) return;
    if (chance(1)) changePixel(p, "humus");
});

// humus + talaj → forest_soil
addTick("humus", function (p) {
    if (!cd(p, "humus_soil", 10000)) return;
    neighbors(p).forEach(n => {
        if (["dirt", "fertile_soil", "rich_soil"].includes(n.element) && chance(3)) {
            changePixel(n, "forest_soil");
        }
    });
});

// Tápanyagfogyás
addTick("super_fertile_soil", function (p) {
    if (!cd(p, "nutrient_drain", 30000)) return;
    let hasNutrient = neighbors(p).find(x =>
        ["humus", "compost", "manure", "fertilizer_n", "fertilizer_p", "fertilizer_k"].includes(x.element)
    );
    if (!hasNutrient && chance(5)) changePixel(p, "rich_soil");
});

addTick("rich_soil", function (p) {
    if (!cd(p, "rich_drain", 40000)) return;
    let hasNutrient = neighbors(p).find(x => ["humus", "compost", "manure"].includes(x.element));
    if (!hasNutrient && chance(3)) changePixel(p, "fertile_soil");
});

addTick("fertile_soil", function (p) {
    if (!cd(p, "fertile_drain", 50000)) return;
    let hasNutrient = neighbors(p).find(x => ["humus", "compost", "manure"].includes(x.element));
    if (!hasNutrient && chance(2)) changePixel(p, "dirt");
});

console.log("✅ [4/14] Decomposition Chain loaded");

// =====================================================================
// 5. NÖVÉNYEK
// =====================================================================

// ---- BÚZA ----
safeElement("wheat_seed", { color: "#d9c27a", behavior: behaviors.POWDER, category: "plants" });
safeElement("wheat_sprout", { color: "#7ab648", behavior: behaviors.WALL, category: "plants" });
safeElement("wheat_stem", { color: "#5a8a2a", behavior: behaviors.WALL, category: "plants" });
safeElement("wheat_head", { color: "#d4a843", behavior: behaviors.WALL, category: "plants" });

addTick("wheat_seed", function (p) {
    p.g = p.g || 0;
    let below = pixelMap?.[p.x]?.[p.y + 1];
    if (!below) return;
    if (below.element === "moist_soil") p.g += 0.02;
    if (below.element === "fertile_soil") p.g += 0.03;
    if (below.element === "rich_soil") p.g += 0.05;
    if (below.element === "super_fertile_soil") p.g += 0.08;
    if (below.element === "forest_soil") p.g += 0.06;
    if (below.element === "eroded_soil") p.g += 0.005;
    if (below.element === "depleted_soil") p.g += 0.01;
    if (neighbors(p).find(x => x.element === "mycorrhiza")) p.g += 0.02;
    if (p.g > 1) changePixel(p, "wheat_sprout");
});

addTick("wheat_sprout", function (p) {
    p.g = p.g || 0;
    p.g += 0.03;
    if (p.g > 1.5) changePixel(p, "wheat_stem");
});

addTick("wheat_stem", function (p) {
    p.g = p.g || 0;
    p.g += 0.02;
    if (p.g > 2) changePixel(p, "wheat_head");
});

// ---- PARADICSOM ----
safeElement("tomato_seed", { color: "#e8d8a0", behavior: behaviors.POWDER, category: "plants" });
safeElement("tomato_root", { color: "#8b6b3a", behavior: behaviors.WALL, category: "plants" });
safeElement("tomato_stem", { color: "#4a7a2a", behavior: behaviors.WALL, category: "plants" });
safeElement("tomato_leaf", { color: "#3a8a2a", behavior: behaviors.WALL, category: "plants" });
safeElement("tomato_flower", { color: "#f0f060", behavior: behaviors.WALL, category: "plants" });
safeElement("tomato_fruit", { color: "#e83020", behavior: behaviors.WALL, category: "plants" });

addTick("tomato_seed", function (p) {
    p.g = p.g || 0;
    let below = pixelMap?.[p.x]?.[p.y + 1];
    if (!below) return;
    if (below.element === "fertile_soil") p.g += 0.04;
    if (below.element === "rich_soil") p.g += 0.06;
    if (below.element === "super_fertile_soil") p.g += 0.09;
    if (p.g > 1) changePixel(p, "tomato_root");
});
addTick("tomato_root", function(p) { p.g = p.g || 0; p.g += 0.03; if (p.g > 1.2) changePixel(p, "tomato_stem"); });
addTick("tomato_stem", function(p) { p.g = p.g || 0; p.g += 0.02; if (p.g > 1.8) changePixel(p, "tomato_leaf"); });
addTick("tomato_leaf", function(p) { p.g = p.g || 0; p.g += 0.03; if (p.g > 2.2) changePixel(p, "tomato_flower"); });
addTick("tomato_flower", function(p) { p.g = p.g || 0; p.g += 0.04; if (p.g > 2.8) changePixel(p, "tomato_fruit"); });

// ---- BURGONYA ----
safeElement("potato_seed", { color: "#c8b080", behavior: behaviors.POWDER, category: "plants" });
safeElement("potato_root", { color: "#6b4b2a", behavior: behaviors.WALL, category: "plants" });
safeElement("potato_plant", { color: "#3a6a1a", behavior: behaviors.WALL, category: "plants" });
safeElement("potato_tuber", { color: "#b09060", behavior: behaviors.WALL, category: "plants" });

addTick("potato_seed", function (p) {
    p.g = p.g || 0;
    let below = pixelMap?.[p.x]?.[p.y + 1];
    if (!below) return;
    if (below.element === "fertile_soil") p.g += 0.04;
    if (below.element === "rich_soil") p.g += 0.06;
    if (below.element === "super_fertile_soil") p.g += 0.09;
    if (p.g > 1) changePixel(p, "potato_root");
});
addTick("potato_root", function(p) { p.g = p.g || 0; p.g += 0.03; if (p.g > 1.3) changePixel(p, "potato_plant"); });
addTick("potato_plant", function(p) { p.g = p.g || 0; p.g += 0.02; if (p.g > 2) changePixel(p, "potato_tuber"); });

// ---- FA ----
safeElement("tree_seed", { color: "#8b5a2b", behavior: behaviors.POWDER, category: "plants" });
safeElement("tree_sapling", { color: "#5a8a3a", behavior: behaviors.WALL, category: "plants" });
safeElement("tree_trunk", { color: "#6b4a2b", behavior: behaviors.WALL, category: "plants" });
safeElement("tree_leaves", { color: "#3a7a2a", behavior: behaviors.WALL, category: "plants" });

addTick("tree_seed", function (p) {
    p.g = p.g || 0;
    let below = pixelMap?.[p.x]?.[p.y + 1];
    if (!below) return;
    if (below.element?.includes("soil")) p.g += 0.01;
    if (below.element === "forest_soil") p.g += 0.04;
    if (below.element === "super_fertile_soil") p.g += 0.05;
    if (p.g > 3) changePixel(p, "tree_sapling");
});

addTick("tree_sapling", function (p) {
    p.g = p.g || 0;
    p.g += 0.01;
    if (p.g > 5) {
        changePixel(p, "tree_trunk");
        neighbors8(p).forEach(n => {
            if (n.element === "empty" || n.element === "air") changePixel(n, "tree_leaves");
        });
    }
});

addTick("tree_leaves", function (p) {
    if (!cd(p, "leaf_fall", 20000)) return;
    if (chance(0.5)) changePixel(p, "leaf");
});

console.log("✅ [5/14] Plants loaded");

// =====================================================================
// 6. BIOLÓGIA (EARTHWORM + MYCORRHIZA)
// =====================================================================

// ---- GILISZTA ----
safeElement("earthworm", { color: "#b08c6a", behavior: behaviors.POWDER, category: "biology" });
safeElement("worm_tunnel", { color: "#4a3a2a", behavior: behaviors.POWDER, category: "biology" });

addTick("earthworm", function (p) {
    if (!cd(p, "worm_move", 2000)) return;
    let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let d = dirs[randInt(0, 3)];
    let t = pixelMap?.[p.x + d[0]]?.[p.y + d[1]];
    if (!t) return;

    if (t.element === "dirt") changePixel(t, "fertile_soil");
    else if (t.element === "fertile_soil") changePixel(t, "rich_soil");
    else if (t.element === "compost" && chance(30)) changePixel(t, "humus");

    let movable = ["empty", "dirt", "fertile_soil", "rich_soil", "compost", "humus", "worm_tunnel",
                   "sandy_soil", "loam", "forest_soil", "depleted_soil"];
    if (movable.includes(t.element)) {
        changePixel(p, "worm_tunnel");
        t.element = "earthworm";
        t.color = elements["earthworm"].color;
    }

    if (chance(0.1) && neighbors(p).find(x => x.element === "earthworm")) {
        let emptySpot = neighbors(p).find(x => movable.includes(x.element) && x.element !== "earthworm");
        if (emptySpot) changePixel(emptySpot, "earthworm");
    }
});

addTick("worm_tunnel", function (p) {
    if (!cd(p, "tunnel_fill", 30000)) return;
    let below = pixelMap?.[p.x]?.[p.y + 1];
    if (below && below.element?.includes("soil")) changePixel(p, below.element);
    else changePixel(p, "fertile_soil");
});

// ---- MIKORRHIZA (CSAK NŐ ÉS TOLJA A FÖLDET) ----
safeElement("mycorrhiza", { color: "#e8d8b0", behavior: behaviors.POWDER, category: "biology" });

addTick("mycorrhiza", function (p) {
    if (!cd(p, "myco_grow", 2000)) return;

    // Minden talajtípus, amiben nőhet
    let allSoils = [
        "dirt", "sand", "mud", "sandy_soil", "fertile_soil", "rich_soil",
        "super_fertile_soil", "loam", "sandy_loam", "silt_loam", "clay_soil",
        "peaty_soil", "forest_soil", "black_earth", "volcanic_soil", "rocky_soil",
        "compacted_soil", "eroded_soil", "depleted_soil", "waterlogged_soil",
        "cracked_soil", "burnt_soil", "irradiated_soil", "living_soil",
        "old_growth_soil", "fertile_volcanic_soil", "acidic_soil", "neutral_soil",
        "alkaline_soil", "moist_soil", "compost", "humus", "manure", "peat",
        "leaf_litter", "worm_tunnel"
    ];

    // Keresünk talajt/üres helyet a szomszédban
    let targets = neighbors(p).filter(n =>
        allSoils.includes(n.element) || n.element === "empty" || n.element === "air"
    );

    if (targets.length > 0 && chance(30)) {
        // Véletlen célpont
        let target = targets[randInt(0, targets.length - 1)];

        // HA a célpont talaj → a mycorrhiza "belenő" és a talajt arrébb tolja
        if (allSoils.includes(target.element)) {
            // A talajt áttoljuk a mycorrhiza régi helyére (swap)
            swapPixel(p, target);
            // Most p (régi célpont) mycorrhiza lett, target (régi mycorrhiza helye) pedig a talaj
        }
        // HA a célpont üres → a mycorrhiza simán nő oda, régi helye üres marad
        else if (target.element === "empty" || target.element === "air") {
            changePixel(target, "mycorrhiza");
            // A régi hely NEM változik meg (üres marad? Vagy maradjon mycorrhiza?)
            // Ha azt szeretnéd, hogy a régi helyen is mycorrhiza maradjon, akkor ne csinálj semmit
            // Ha azt, hogy eltűnjön: changePixel(p, "empty");
            // Alap: marad mycorrhiza (sűrűsödik)
        }
    }

    // Növekedés: új mycorrhiza létrehozása üres/talaj szomszédokba (lassú terjedés)
    let spreadTargets = neighbors(p).filter(n =>
        allSoils.includes(n.element) || n.element === "empty" || n.element === "air"
    );
    if (spreadTargets.length > 0 && chance(10)) {
        let target = spreadTargets[randInt(0, spreadTargets.length - 1)];
        if (target.element === "empty" || target.element === "air") {
            changePixel(target, "mycorrhiza");
        } else if (allSoils.includes(target.element)) {
            // Belenő a talajba, a talajt a régi helyére teszi
            swapPixel(p, target);
        }
    }

    // Növények növekedésének gyorsítása (mycorrhiza szimbiózis)
    neighbors(p).forEach(n => {
        if (n.element?.includes("seed") || n.element?.includes("sprout") ||
            n.element?.includes("root") || n.element?.includes("stem") ||
            n.element?.includes("sapling")) {
            if (n.g !== undefined) n.g += 0.02;
        }
    });
});

console.log("✅ [6/14] Biology (Earthworm + Mycorrhiza) loaded");

// =====================================================================
// 7. MUTÁCIÓK
// =====================================================================

addReaction("dirt", "radiation", { elem1: "irradiated_soil" });
addReaction("fertile_soil", "radiation", { elem1: "irradiated_soil" });
addReaction("rich_soil", "radiation", { elem1: "irradiated_soil" });

safeElement("mutant_plant", { color: "#6a1b9a", behavior: behaviors.WALL, category: "mutated" });

addTick("irradiated_soil", function (p) {
    neighbors(p).forEach(n => {
        if (["wheat_seed", "wheat_sprout", "tomato_seed", "potato_seed", "plant"].includes(n.element) && chance(5)) {
            changePixel(n, "mutant_plant");
        }
    });
    if (chance(0.01)) changePixel(p, "depleted_soil");
});

addTick("rich_soil", function (p) {
    if (neighbors(p).find(x => x.element === "earthworm") && chance(0.5)) changePixel(p, "living_soil");
});

addTick("forest_soil", function (p) {
    if (neighbors(p).find(x => x.element === "humus") && chance(0.3)) changePixel(p, "old_growth_soil");
});

addReaction("volcanic_soil", "water", { elem1: "fertile_volcanic_soil" });

console.log("✅ [7/14] Mutations loaded");

// =====================================================================
// 8. HŐMÉRSÉKLETI RENDSZER
// =====================================================================

["humus", "compost", "manure", "leaf_litter", "peat"].forEach(name => {
    if (elements[name]) {
        elements[name].tempHigh = 200;
        elements[name].stateHigh = "fire";
        elements[name].burn = 80;
    }
});

["dirt", "sandy_soil", "fertile_soil", "rich_soil", "super_fertile_soil",
 "forest_soil", "loam", "clay_soil"].forEach(name => {
    if (elements[name]) {
        elements[name].tempHigh = 1200;
        elements[name].stateHigh = "molten_silicate";
    }
});

addReaction("humus", "fire", { elem1: "charcoal", elem2: "ash" });
addReaction("compost", "fire", { elem1: "charcoal", elem2: "ash" });
addReaction("manure", "fire", { elem1: "charcoal", elem2: "ash" });
addReaction("leaf_litter", "fire", { elem1: "charcoal", elem2: "ash" });
addReaction("charcoal", "fire", { elem1: "ash" });

["super_fertile_soil", "fertile_soil", "rich_soil", "forest_soil", "humus"].forEach(name => {
    addTick(name, function (p) {
        if (p.temp > 500 && chance(10)) changePixel(p, "burnt_soil");
    });
});

console.log("✅ [8/14] Temperature System loaded");

// =====================================================================
// 9. pH RENDSZER
// =====================================================================

addTick("acidic_soil", function (p) {
    if (neighbors(p).find(x => x.element === "lime") && chance(10)) changePixel(p, "neutral_soil");
});

addTick("alkaline_soil", function (p) {
    if (neighbors(p).find(x => x.element === "fertilizer_n") && chance(5)) changePixel(p, "neutral_soil");
});

addTick("super_fertile_soil", function (p) {
    if (!cd(p, "ph_check", 10000)) return;
    let fertCount = neighbors(p).filter(x => x.element?.includes("fertilizer")).length;
    if (fertCount >= 2 && chance(fertCount * 2)) changePixel(p, "acidic_soil");
});

addTick("wheat_seed", function (p) {
    let below = pixelMap?.[p.x]?.[p.y + 1];
    if (below && below.element === "acidic_soil") p.g = (p.g || 0) * 0.5;
});

addTick("tomato_seed", function (p) {
    let below = pixelMap?.[p.x]?.[p.y + 1];
    if (below && below.element === "alkaline_soil") p.g = (p.g || 0) * 0.6;
});

console.log("✅ [9/14] pH System loaded");

// =====================================================================
// 10. IDŐJÁRÁS
// =====================================================================

safeElement("rain_cloud", { color: "#8899aa", behavior: behaviors.GAS, category: "weather" });
safeElement("storm_cloud", { color: "#445566", behavior: behaviors.GAS, category: "weather" });
safeElement("acid_rain_cloud", { color: "#88aa66", behavior: behaviors.GAS, category: "weather" });
safeElement("snow_cloud", { color: "#ccddff", behavior: behaviors.GAS, category: "weather" });

addTick("rain_cloud", function (p) {
    if (!cd(p, "rain", 500)) return;
    let below = pixelMap?.[p.x]?.[p.y + 1];
    if (below && (below.element === "empty" || below.element === "air")) changePixel(below, "water");
    if (below && below.element?.includes("soil") && chance(30)) changePixel(below, "moist_soil");
    if (chance(0.1)) changePixel(p, "steam");
});

addTick("storm_cloud", function (p) {
    if (!cd(p, "storm", 300)) return;
    let below = pixelMap?.[p.x]?.[p.y + 1];
    if (below && (below.element === "empty" || below.element === "air")) changePixel(below, "water");
    if (chance(0.5) && below) changePixel(below, "fire");
    if (chance(0.05)) changePixel(p, "rain_cloud");
});

addTick("acid_rain_cloud", function (p) {
    if (!cd(p, "acid_rain", 500)) return;
    let below = pixelMap?.[p.x]?.[p.y + 1];
    if (below && (below.element === "empty" || below.element === "air")) changePixel(below, "acid");
    if (below && ["fertile_soil", "rich_soil", "super_fertile_soil", "forest_soil"].includes(below.element) && chance(20)) {
        changePixel(below, "acidic_soil");
    }
    if (chance(0.05)) changePixel(p, "rain_cloud");
});

addTick("snow_cloud", function (p) {
    if (!cd(p, "snow", 500)) return;
    let below = pixelMap?.[p.x]?.[p.y + 1];
    if (below && (below.element === "empty" || below.element === "air")) changePixel(below, "snow");
    if (chance(0.05)) changePixel(p, "steam");
});

safeElement("moist_soil", { color: "#4f3727", behavior: behaviors.POWDER, category: "soil_special" });

addTick("moist_soil", function (p) {
    if (!cd(p, "dry_out", 15000)) return;
    let above = pixelMap?.[p.x]?.[p.y - 1];
    if (!above || above.element !== "water") {
        if (chance(10)) {
            let below = pixelMap?.[p.x]?.[p.y + 1];
            if (below && below.element?.includes("soil")) changePixel(p, below.element);
            else changePixel(p, "dirt");
        }
    }
});

window._soilSeason = window._soilSeason || "spring";
window._soilSeasonTimer = window._soilSeasonTimer || 0;

function updateSeason() {
    window._soilSeasonTimer++;
    if (window._soilSeasonTimer > 50000) {
        window._soilSeasonTimer = 0;
        let seasons = ["spring", "summer", "autumn", "winter"];
        let idx = seasons.indexOf(window._soilSeason);
        window._soilSeason = seasons[(idx + 1) % 4];
        console.log("🌍 Season changed to:", window._soilSeason);
    }
}

console.log("✅ [10/14] Weather System loaded");

// =====================================================================
// 11. ERÓZIÓ
// =====================================================================

addTick("moist_soil", function (p) {
    if (!cd(p, "erosion", 20000)) return;
    if (chance(0.5)) changePixel(p, "eroded_soil");
});

["dirt", "fertile_soil", "rich_soil", "super_fertile_soil", "sandy_soil"].forEach(name => {
    addTick(name, function (p) {
        let waterNeighbor = neighbors(p).find(x => x.element === "water");
        if (waterNeighbor && chance(0.3)) changePixel(p, "eroded_soil");
    });
});

addTick("eroded_soil", function (p) {
    if (!cd(p, "erode_further", 30000)) return;
    if (chance(2)) changePixel(p, "depleted_soil");
});

["stone", "iron", "steel", "concrete"].forEach(heavy => {
    if (elements[heavy]) {
        addReaction("fertile_soil", heavy, { elem1: "compacted_soil" });
        addReaction("rich_soil", heavy, { elem1: "compacted_soil" });
        addReaction("super_fertile_soil", heavy, { elem1: "compacted_soil" });
    }
});

addTick("compacted_soil", function (p) {
    if (!cd(p, "crack", 40000)) return;
    if (chance(1)) changePixel(p, "cracked_soil");
});

["dirt", "fertile_soil", "rich_soil", "clay_soil"].forEach(name => {
    addTick(name, function (p) {
        let waterCount = neighbors(p).filter(x => x.element === "water").length;
        if (waterCount >= 3 && chance(waterCount * 2)) changePixel(p, "waterlogged_soil");
    });
});

console.log("✅ [11/14] Erosion System loaded");

// =====================================================================
// 12. GÉPEK
// =====================================================================

safeElement("composter", { color: "#8b5a2b", behavior: behaviors.WALL, category: "machines" });
safeElement("irrigation_system", { color: "#4488cc", behavior: behaviors.WALL, category: "machines" });
safeElement("tiller", { color: "#888888", behavior: behaviors.WALL, category: "machines" });
safeElement("greenhouse", { color: "#aaddcc", behavior: behaviors.WALL, category: "machines" });

addTick("composter", function (p) {
    if (!cd(p, "compost_work", 3000)) return;
    neighbors(p).forEach(n => {
        if (["plant", "wood", "leaf", "grass", "dead_plant", "wheat_sprout", "wheat_stem",
             "wheat_head", "tomato_leaf", "tomato_stem", "potato_plant", "tree_leaves",
             "leaf_litter", "tree_sapling"].includes(n.element)) {
            changePixel(n, "compost");
        }
    });
});

addTick("irrigation_system", function (p) {
    if (!cd(p, "irrigate", 2000)) return;
    neighbors(p).forEach(n => {
        if (n.element?.includes("soil") && n.element !== "waterlogged_soil" && n.element !== "moist_soil") {
            changePixel(n, "moist_soil");
        }
        if (["wheat_seed", "wheat_sprout", "tomato_seed", "tomato_root",
             "potato_seed", "potato_root", "tree_seed", "tree_sapling"].includes(n.element)) {
            if (n.g !== undefined) n.g += 0.05;
        }
    });
});

addTick("tiller", function (p) {
    if (!cd(p, "till", 3000)) return;
    neighbors8(p).forEach(n => {
        if (n.element === "dirt") changePixel(n, "fertile_soil");
        else if (n.element === "compacted_soil") changePixel(n, "fertile_soil");
        else if (n.element === "cracked_soil") changePixel(n, "fertile_soil");
    });
});

addTick("greenhouse", function (p) {
    if (!cd(p, "greenhouse_effect", 5000)) return;
    neighbors(p).forEach(n => {
        if (n.element?.includes("seed") || n.element?.includes("sprout") ||
            n.element?.includes("root") || n.element?.includes("stem") ||
            n.element?.includes("sapling")) {
            if (n.g !== undefined) n.g += 0.1;
        }
        if (n.element?.includes("soil") && n.temp < 30) n.temp += 0.5;
    });
});

console.log("✅ [12/14] Machines loaded");

// =====================================================================
// 13. BIOME-OK (AKTÍV NÖVESZTÉS + TERJEDÉS)
// =====================================================================

safeElement("forest_biome_seed", { color: "#1a4a0a", behavior: behaviors.WALL, category: "biomes" });
safeElement("swamp_biome_seed", { color: "#2a3a1a", behavior: behaviors.WALL, category: "biomes" });
safeElement("plains_biome_seed", { color: "#8aaa4a", behavior: behaviors.WALL, category: "biomes" });
safeElement("desert_biome_seed", { color: "#d4c89a", behavior: behaviors.WALL, category: "biomes" });
safeElement("volcanic_biome_seed", { color: "#4a1a0a", behavior: behaviors.WALL, category: "biomes" });

// Forest biome
addTick("forest_biome_seed", function (p) {
    if (!cd(p, "forest_grow", 3000)) return;
    neighbors8(p).forEach(n => {
        if (["dirt", "sand", "sandy_soil", "fertile_soil", "rich_soil"].includes(n.element) && chance(20)) changePixel(n, "forest_soil");
        if (["forest_soil", "rich_soil", "super_fertile_soil"].includes(n.element) && chance(2)) {
            let above = pixelMap?.[n.x]?.[n.y - 1];
            if (above && (above.element === "empty" || above.element === "air")) changePixel(above, "tree_seed");
        }
        if (n.element === "forest_soil" && chance(5)) {
            let above = pixelMap?.[n.x]?.[n.y - 1];
            if (above && (above.element === "empty" || above.element === "air")) changePixel(above, "leaf_litter");
        }
        if (n.element === "forest_soil" && chance(8)) changePixel(n, "mycorrhiza");
        if (n.element === "forest_soil" && chance(2)) changePixel(n, "earthworm");
    });
    let edgeNeighbors = neighbors(p).filter(n => ["dirt", "sand", "grass", "empty", "air"].includes(n.element));
    if (edgeNeighbors.length > 0 && chance(15)) {
        let target = edgeNeighbors[randInt(0, edgeNeighbors.length - 1)];
        if (target.element === "empty" || target.element === "air") changePixel(target, "tree_seed");
    }
    let farNeighbors = neighbors8(p).filter(n => ["dirt", "sandy_soil", "fertile_soil", "empty"].includes(n.element));
    if (farNeighbors.length > 0 && chance(3)) {
        let target = farNeighbors[randInt(0, farNeighbors.length - 1)];
        if (target.element !== "forest_biome_seed") changePixel(target, "forest_biome_seed");
    }
    if (chance(0.5)) {
        let above = pixelMap?.[p.x]?.[p.y - 1];
        if (above && (above.element === "empty" || above.element === "air")) changePixel(above, "steam");
    }
});

// Swamp biome
addTick("swamp_biome_seed", function (p) {
    if (!cd(p, "swamp_grow", 3000)) return;
    neighbors8(p).forEach(n => {
        if (["dirt", "sand", "fertile_soil", "rich_soil"].includes(n.element) && chance(20)) changePixel(n, "peaty_soil");
        if (n.element === "empty" && chance(5)) changePixel(n, "water");
        if (n.element === "water" && chance(10)) changePixel(n, "mud");
        if (n.element === "peaty_soil" && chance(3)) {
            let above = pixelMap?.[n.x]?.[n.y - 1];
            if (above && (above.element === "empty" || above.element === "air")) changePixel(above, "tree_seed");
        }
        if (n.element === "mud" && chance(8)) changePixel(n, "peat");
    });
    let edgeNeighbors = neighbors(p).filter(n => ["dirt", "sand", "empty", "grass"].includes(n.element));
    if (edgeNeighbors.length > 0 && chance(10)) {
        let target = edgeNeighbors[randInt(0, edgeNeighbors.length - 1)];
        if (target.element !== "swamp_biome_seed" && target.element !== "water") changePixel(target, "swamp_biome_seed");
    }
    if (chance(2)) {
        let below = pixelMap?.[p.x]?.[p.y + 1];
        if (below && ["dirt", "peaty_soil", "mud"].includes(below.element)) changePixel(below, "waterlogged_soil");
    }
});

// Plains biome
addTick("plains_biome_seed", function (p) {
    if (!cd(p, "plains_grow", 3000)) return;
    neighbors8(p).forEach(n => {
        if (["dirt", "sand", "sandy_soil"].includes(n.element) && chance(25)) changePixel(n, "loam");
        if (["loam", "fertile_soil", "rich_soil"].includes(n.element) && chance(3)) {
            let above = pixelMap?.[n.x]?.[n.y - 1];
            if (above && (above.element === "empty" || above.element === "air")) {
                let plantType = randInt(1, 3);
                if (plantType === 1) changePixel(above, "wheat_seed");
                if (plantType === 2) changePixel(above, "tomato_seed");
                if (plantType === 3) changePixel(above, "potato_seed");
            }
        }
        if (n.element === "loam" && chance(10)) {
            let above = pixelMap?.[n.x]?.[n.y - 1];
            if (above && (above.element === "empty" || above.element === "air")) changePixel(above, "wheat_seed");
        }
        if (n.element === "loam" && chance(3)) changePixel(n, "earthworm");
    });
    let edgeNeighbors = neighbors8(p).filter(n => ["dirt", "sand", "sandy_soil", "fertile_soil", "empty"].includes(n.element));
    if (edgeNeighbors.length > 0 && chance(12)) {
        let target = edgeNeighbors[randInt(0, edgeNeighbors.length - 1)];
        if (target.element !== "plains_biome_seed") changePixel(target, "plains_biome_seed");
    }
});

// Desert biome
addTick("desert_biome_seed", function (p) {
    if (!cd(p, "desert_grow", 3000)) return;
    neighbors8(p).forEach(n => {
        if (["dirt", "fertile_soil", "rich_soil", "loam", "mud"].includes(n.element) && chance(20)) changePixel(n, "sand");
        if (n.element === "water" && chance(30)) changePixel(n, "steam");
        if (["sandy_soil", "sand"].includes(n.element) && chance(10)) changePixel(n, "sandy_soil");
        if (n.element === "sandy_soil" && chance(1)) {
            let above = pixelMap?.[n.x]?.[n.y - 1];
            if (above && (above.element === "empty" || above.element === "air")) changePixel(above, "tree_seed");
        }
        if (n.element?.includes("soil") && n.element !== "sand" && n.element !== "sandy_soil" && chance(15)) changePixel(n, "cracked_soil");
    });
    let edgeNeighbors = neighbors8(p).filter(n => ["dirt", "fertile_soil", "rich_soil", "loam", "grass", "empty"].includes(n.element));
    if (edgeNeighbors.length > 0 && chance(8)) {
        let target = edgeNeighbors[randInt(0, edgeNeighbors.length - 1)];
        if (target.element !== "desert_biome_seed") changePixel(target, "desert_biome_seed");
    }
    if (chance(5)) p.temp = Math.min(p.temp + 2, 60);
});

// Volcanic biome
addTick("volcanic_biome_seed", function (p) {
    if (!cd(p, "volcanic_grow", 3000)) return;
    neighbors8(p).forEach(n => {
        if (["dirt", "sand", "fertile_soil", "rich_soil", "loam"].includes(n.element) && chance(20)) changePixel(n, "volcanic_soil");
        if (["stone", "rock"].includes(n.element) && chance(5)) changePixel(n, "magma");
        if (n.element === "empty" && chance(0.5)) changePixel(n, "lava");
        if (n.element === "volcanic_soil" && chance(8)) {
            let above = pixelMap?.[n.x]?.[n.y - 1];
            if (above && (above.element === "empty" || above.element === "air")) changePixel(above, "ash");
        }
        if (n.element === "volcanic_soil" && chance(5)) changePixel(n, "black_earth");
    });
    let edgeNeighbors = neighbors8(p).filter(n => ["dirt", "sand", "stone", "fertile_soil", "empty"].includes(n.element));
    if (edgeNeighbors.length > 0 && chance(6)) {
        let target = edgeNeighbors[randInt(0, edgeNeighbors.length - 1)];
        if (target.element !== "volcanic_biome_seed") changePixel(target, "volcanic_biome_seed");
    }
    if (chance(10)) p.temp = Math.min(p.temp + 5, 200);
    if (chance(0.3)) {
        let above = pixelMap?.[p.x]?.[p.y - 1];
        if (above && (above.element === "empty" || above.element === "air")) changePixel(above, "ash");
    }
});

// Biome kölcsönhatások
addTick("forest_biome_seed", function(p) {
    neighbors(p).forEach(n => {
        if (n.element === "desert_biome_seed" && chance(5)) changePixel(n, "forest_biome_seed");
    });
});
addTick("desert_biome_seed", function(p) {
    neighbors(p).forEach(n => {
        if (n.element === "swamp_biome_seed" && chance(5)) changePixel(n, "desert_biome_seed");
    });
});
addTick("volcanic_biome_seed", function(p) {
    neighbors(p).forEach(n => {
        if (["forest_biome_seed", "swamp_biome_seed", "plains_biome_seed", "desert_biome_seed"].includes(n.element) && chance(8)) {
            changePixel(n, "volcanic_biome_seed");
        }
    });
});
addTick("swamp_biome_seed", function(p) {
    neighbors(p).forEach(n => {
        if (n.element === "plains_biome_seed" && chance(3)) {
            neighbors8(p).forEach(n2 => {
                if (n2.element === "loam" || n2.element === "peaty_soil") changePixel(n2, "super_fertile_soil");
            });
        }
    });
});

console.log("✅ [13/14] Biomes loaded (Active Growth + Spreading)");

// =====================================================================
// 14. INTEGRÁCIÓ + MIXING (JAVÍTVA)
// =====================================================================

// ---- TALAJKÉPZŐDÉS ----
addReaction("dirt", "sand", { elem1: "sandy_soil" });
addReaction("dirt", "water", { elem1: "mud" });
addReaction("sand", "water", { elem1: "wet_sand" });

// JAVÍTVA: humus + sand = dirt (nem sandy_soil)
addReaction("humus", "sand", { elem1: "dirt" });
addReaction("sand", "humus", { elem1: "dirt" });

// humus + sandy_soil = fertile_soil (jobb talaj)
addReaction("sandy_soil", "humus", { elem1: "fertile_soil" });
addReaction("fertile_soil", "humus", { elem1: "rich_soil" });
addReaction("rich_soil", "fertilizer_n", { elem1: "super_fertile_soil" });
addReaction("rich_soil", "fertilizer_p", { elem1: "super_fertile_soil" });
addReaction("rich_soil", "fertilizer_k", { elem1: "super_fertile_soil" });

// ---- LOAM KÉPZŐDÉS ----
addReaction("sand", "clay_soil", { elem1: "sandy_loam" });
addReaction("sandy_soil", "clay_soil", { elem1: "sandy_loam" });
addReaction("dirt", "clay_soil", { elem1: "loam" });
addReaction("loam", "humus", { elem1: "fertile_soil" });

// ---- SZERVES ANYAGOK JAVÍTJÁK A TALAJT ----
// compost hatása
addReaction("dirt", "compost", { elem1: "fertile_soil" });
addReaction("sandy_soil", "compost", { elem1: "fertile_soil" });
addReaction("eroded_soil", "compost", { elem1: "fertile_soil" });
addReaction("depleted_soil", "compost", { elem1: "dirt" });
addReaction("acidic_soil", "compost", { elem1: "neutral_soil" });
addReaction("burnt_soil", "compost", { elem1: "dirt" });

// manure hatása
addReaction("dirt", "manure", { elem1: "fertile_soil" });
addReaction("depleted_soil", "manure", { elem1: "fertile_soil" });
addReaction("sandy_soil", "manure", { elem1: "fertile_soil" });
addReaction("eroded_soil", "manure", { elem1: "fertile_soil" });

// humus hatása
addReaction("dirt", "humus", { elem1: "fertile_soil" });
addReaction("sandy_soil", "humus", { elem1: "fertile_soil" });
addReaction("eroded_soil", "humus", { elem1: "fertile_soil" });
addReaction("burnt_soil", "humus", { elem1: "fertile_soil" });
addReaction("depleted_soil", "humus", { elem1: "fertile_soil" });

// peat hatása
addReaction("dirt", "peat", { elem1: "fertile_soil" });
addReaction("sandy_soil", "peat", { elem1: "peaty_soil" });

// leaf_litter hatása
addReaction("dirt", "leaf_litter", { elem1: "fertile_soil" });
addReaction("eroded_soil", "leaf_litter", { elem1: "dirt" });

// ---- NPK KEVEREDÉS ----
addReaction("fertilizer_n", "fertilizer_p", { elem1: "fertilizer_k", elem2: "compost" });
addReaction("compost", "fertilizer_n", { elem1: "humus" });
addReaction("compost", "fertilizer_p", { elem1: "humus" });
addReaction("compost", "fertilizer_k", { elem1: "humus" });

// NPK javítja a talajt
addReaction("dirt", "fertilizer_n", { elem1: "fertile_soil" });
addReaction("dirt", "fertilizer_p", { elem1: "fertile_soil" });
addReaction("dirt", "fertilizer_k", { elem1: "fertile_soil" });
addReaction("fertile_soil", "fertilizer_n", { elem1: "rich_soil" });
addReaction("fertile_soil", "fertilizer_p", { elem1: "rich_soil" });
addReaction("fertile_soil", "fertilizer_k", { elem1: "rich_soil" });

// ---- VÍZ KÖLCSÖNHATÁSOK ----
addReaction("dirt", "water", { elem1: "mud" });
addReaction("mud", "sand", { elem1: "sandy_soil" });
addReaction("mud", "compost", { elem1: "fertile_soil" });
addReaction("waterlogged_soil", "sand", { elem1: "mud" });

// ---- GILISZTA KÖLCSÖNHATÁSOK ----
addReaction("dirt", "earthworm", { elem1: "fertile_soil" });
addReaction("compost", "earthworm", { elem1: "humus" });
addReaction("depleted_soil", "earthworm", { elem1: "dirt" });

// ---- MIKORRHIZA KÖLCSÖNHATÁSOK ----
addReaction("fertile_soil", "mycorrhiza", { elem1: "rich_soil" });
addReaction("compost", "mycorrhiza", { elem1: "humus" });
addReaction("dirt", "mycorrhiza", { elem1: "fertile_soil" });

// ---- pH RENDSZER KEVEREDÉS (JAVÍTVA) ----
// lime javítja a pH-t
addReaction("acidic_soil", "lime", { elem1: "neutral_soil" });
addReaction("alkaline_soil", "fertilizer_n", { elem1: "neutral_soil" });
addReaction("alkaline_soil", "compost", { elem1: "neutral_soil" });
addReaction("acidic_soil", "ash", { elem1: "neutral_soil" });

// lime + savas talaj = jobb talaj
addReaction("acidic_soil", "lime", { elem1: "fertile_soil" }); // lime közvetlenül javítja
// Ez ütközhet, úgyhogy maradjon a neutral_soil

// ---- ÉGÉS UTÁNI TALAJ ----
addReaction("ash", "water", { elem1: "dirt" });
addReaction("burnt_soil", "compost", { elem1: "dirt" });
addReaction("burnt_soil", "humus", { elem1: "fertile_soil" });
addReaction("charcoal", "dirt", { elem1: "fertile_soil" });
addReaction("ash", "compost", { elem1: "dirt" });

// ---- NÖVÉNYI MARADVÁNYOK ----
addReaction("plant", "water", { elem1: "compost" });
addReaction("wheat_head", "water", { elem1: "compost" });
addReaction("tomato_fruit", "water", { elem1: "compost" });
addReaction("potato_tuber", "water", { elem1: "compost" });
addReaction("tree_leaves", "water", { elem1: "leaf_litter" });

// ---- SPECIÁLIS INTEGRÁCIÓK ----
addReaction("living_soil", "water", { elem1: "super_fertile_soil" });
addReaction("old_growth_soil", "compost", { elem1: "super_fertile_soil" });
addReaction("irradiated_soil", "lime", { elem1: "depleted_soil" });
addReaction("fertile_volcanic_soil", "humus", { elem1: "super_fertile_soil" });

// ---- BIOME INTEGRÁCIÓ ----
addReaction("forest_soil", "water", { elem1: "mud" });
addReaction("peaty_soil", "fire", { elem1: "burnt_soil" });
addReaction("volcanic_soil", "water", { elem1: "stone" });
addReaction("black_earth", "compost", { elem1: "super_fertile_soil" });

// ---- GÉP INTEGRÁCIÓ ----
addReaction("composter", "plant", { elem1: "compost" });
addReaction("irrigation_system", "water", { elem1: "irrigation_system" });

// =============================
// ÉVSZAK FRISSÍTÉS (globális)
// =============================
addTick("dirt", function (p) {
    if (!cd(p, "season_update", 10000)) return;
    updateSeason();
});

console.log("✅ [14/14] Integration + Mixing loaded (Javított: humus+sand=dirt, compost javítja a talajt, lime javítja a pH-t)");

// =====================================================================
// 🎉 SOIL-MOD v5.1 TELJESEN BETÖLTVE
// =====================================================================
console.log("══════════════════════════════════════");
console.log("🌍 SOIL-MOD v5.1 FULLY LOADED");
console.log("══════════════════════════════════════");
console.log("  1. Core Helpers        ✅");
console.log("  2. Soil Types          ✅");
console.log("  3. Organic + NPK       ✅");
console.log("  4. Decomposition       ✅");
console.log("  5. Plants              ✅");
console.log("  6. Biology             ✅ (Mycorrhiza: nő + tolja a földet)");
console.log("  7. Mutations           ✅");
console.log("  8. Temperature         ✅");
console.log("  9. pH System           ✅");
console.log(" 10. Weather             ✅");
console.log(" 11. Erosion             ✅");
console.log(" 12. Machines            ✅");
console.log(" 13. Biomes              ✅ (Aktív növesztés + terjedés)");
console.log(" 14. Integration+Mixing  ✅ (Javított mixing)");
console.log("══════════════════════════════════════");
console.log("🌱 The soil is alive. The ecosystem breathes.");
console.log("══════════════════════════════════════");