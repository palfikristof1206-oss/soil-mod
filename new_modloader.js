window.registerElement = function(name, data){

    if(!window.elements) window.elements = {};

    // 🧱 HARD REGISTER
    elements[name] = data;

    // 🧠 registry marker
    if(!elements.__registry){
        elements.__registry = {};
    }

    elements.__registry[name] = true;

    // 🔥 FORCE UI UPDATE (Sandboxels hooks)
    requestAnimationFrame(() => {
        if(typeof window.updatePalette === "function") window.updatePalette();
        if(typeof window.rebuildPalette === "function") window.rebuildPalette();
    });

    console.log("🧱 FORCE REGISTERED:", name);
};