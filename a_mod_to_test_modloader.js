// SUS BLOCK MOD (Sandboxels Compatible)

console.log("🟣 SUS BLOCK loading...");

registerElement("sus_block", {
    color: "#ff00ff",
    behavior: behaviors.WALL,
    category: "solids",
    state: "solid",
    density: 2000,

    breakInto: "dirt",
    tick: function(pixel){
        // idle anim / fun logic
        if(Math.random() < 0.0005){
            pixel.color = Math.random() > 0.5 ? "#ff00ff" : "#cc00ff";
        }
    }
});

console.log("🟣 SUS BLOCK READY");