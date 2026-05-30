console.log("[Cvtmvtts Tweaker] Loaded");

// =====================================================
// BOOTSTRAP / MODULE LOADER
// =====================================================

(function () {
    const MODULES = [
        "Roblox/Modules/shared.js",
        "Roblox/Modules/removeContent.js",
        "Roblox/Modules/layoutTweaks.js",
        "Roblox/Modules/settingsDropdown.js"
    ];

    const LOADER_ID_PREFIX = "cvtmvtts-loader-";

    function loadScriptOnce(src, id) {
        if (document.getElementById(id)) return;

        const script = document.createElement("script");
        script.id = id;
        script.src = chrome.runtime.getURL(src);
        script.async = false;

        (document.head || document.documentElement).appendChild(script);
    }

    function start() {
        for (const modulePath of MODULES) {
            const id = LOADER_ID_PREFIX + modulePath.replace(/[\/.]/g, "-");
            loadScriptOnce(modulePath, id);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
