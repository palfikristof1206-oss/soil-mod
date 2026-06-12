// =====================================
// SUS BLOCK MOD
// =====================================

console.log("🟣 SUS MOD LOADED");

// SUS BLOCK
elements.sus_block = {
    color: "#ff00ff",
    behavior: behaviors.WALL,
    category: "special",
    state: "solid",
    density: 9999,

    tick: function(pixel){
        // optional fun effect
        if(Math.random() < 0.001){
            pixel.color = "#ff00ff";
        }
    }
};

console.log("🧱 sus_block registered");