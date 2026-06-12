// =====================================
// Soil Expansion v3.0 - EXPANSION PACK
// =====================================

log("Soil Expansion Expansion Pack loading...");

// =====================================
// 🌱 PLANT GROWTH SYSTEM
// =====================================

function soilGrowthChance(pixel, chance){
    if(Math.random() < chance){
        pixel.state = "grown";
    }
}

// basic crop growth logic
if(!elements.wheat_seed.tick){
    elements.wheat_seed.tick = function(pixel){
        if(pixel.yield == null) pixel.yield = 0;

        let below = pixelMap[pixel.x]?.[pixel.y+1];

        if(below){
            if(below.element === "moist_soil") pixel.yield += 0.05;
            if(below.element === "rich_soil") pixel.yield += 0.03;
            if(below.element === "super_fertile_soil") pixel.yield += 0.08;
            if(below.element === "eroded_soil") pixel.yield += 0.005;
        }

        if(pixel.yield > 1){
            changePixel(pixel, "plant");
        }
    };
}

// =====================================
// 🪨 SOIL COMPACTION SYSTEM
// =====================================

function checkCompaction(pixel){
    let heavy = ["stone","concrete","iron","steel","lead"];

    let above = pixelMap[pixel.x]?.[pixel.y-1];
    if(above && heavy.includes(above.element)){
        if(Math.random() < 0.001){
            changePixel(pixel, "compacted_soil");
        }
    }
}

elements.fertile_soil.tick = function(pixel){
    checkCompaction(pixel);
};

elements.rich_soil.tick = function(pixel){
    checkCompaction(pixel);
};

// =====================================
// 🌧️ WEATHER CYCLE SYSTEM
// =====================================

let weatherState = {
    rain: 0,
    dry: 0
};

function weatherTick(){
    weatherState.rain += Math.random()*0.02;
    weatherState.dry += Math.random()*0.01;

    if(weatherState.rain > 1){
        weatherState.rain = 0;
        spawn("water", Math.random()*width, 0);
    }

    if(weatherState.dry > 2){
        weatherState.dry = 0;
        if(Math.random() < 0.5){
            changeAll("moist_soil","dry_soil");
        }
    }
}

// hook into simulation tick
if(!window.soilWeatherInit){
    window.soilWeatherInit = true;
    setInterval(weatherTick, 1000);
}

// =====================================
// 🌧️ EROSION SYSTEM UPGRADE
// =====================================

elements.moist_soil.tick = function(pixel){
    if(Math.random() < 0.0005){
        changePixel(pixel, "eroded_soil");
    }

    if(weatherState.dry > 1){
        changePixel(pixel, "dry_soil");
    }
};

// =====================================
// 🦠 MICROBIOME SPREAD SYSTEM
// =====================================

function spreadMicrobes(pixel){
    let dirs = [
        [1,0],[-1,0],[0,1],[0,-1]
    ];

    for(let d of dirs){
        let p = pixelMap[pixel.x+d[0]]?.[pixel.y+d[1]];
        if(!p) continue;

        if(p.element === "rich_soil" && Math.random() < 0.01){
            changePixel(p, "super_fertile_soil");
        }

        if(p.element === "compost" && Math.random() < 0.02){
            changePixel(p, "humus");
        }
    }
}

elements.mycorrhiza.tick = function(pixel){
    spreadMicrobes(pixel);
};

// =====================================
// ☀️ DROUGHT SYSTEM
// =====================================

function droughtSystem(pixel){
    if(weatherState.dry > 1.5){
        if(pixel.element === "moist_soil"){
            if(Math.random() < 0.01){
                changePixel(pixel, "dry_soil");
            }
        }
    }
}

// attach drought effect
elements.fertile_soil.tick = function(pixel){
    checkCompaction(pixel);
    droughtSystem(pixel);
};

// =====================================
// END PACK
// =====================================

log("Expansion Pack loaded!");