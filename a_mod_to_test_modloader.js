// =====================================
// SUS TEST MOD
// =====================================

console.log("Sus Mod loading...");

if (window.elements) {

    window.elements.sus = {
        color: ["#ff0000", "#aa0000", "#ff5555"],
        behavior: behaviors.WALL,
        category: "test_mod",
        state: "solid",
        density: 2000,

        tick: function(pixel){
            // kis "sus effect": villogás
            if (Math.random() < 0.01) {
                pixel.color = ["#ff0000", "#00ff00", "#0000ff"][
                    Math.floor(Math.random()*3)
                ];
            }
        },

        reactions: {
            water: { elem1: "dirt" },
            fire: { elem1: "ash" }
        }
    };

    console.log("Sus block registered!");
} else {
    console.log("Sandboxels elements not found!");
}

console.log("Sus Mod loaded!");