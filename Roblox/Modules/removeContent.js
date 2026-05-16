// =====================================================
// REMOVE CONTENT MODULE
// =====================================================

function normalizeText(text) {
    return (text || "").toLowerCase().replace(/\s+/g, " ").trim();
}

// =====================================================
// CATALOG: REMOVE MAKEUP FILTER
// =====================================================

function removeMakeupFilter() {
    const container = document.querySelector("#catalog-content .filter-options-container");
    if (!container) return;

    const buttons = container.querySelectorAll("button");

    for (const btn of buttons) {
        const span = btn.querySelector(".filter-option-name");
        const text = normalizeText(span ? span.textContent : btn.textContent);

        const aria = normalizeText(btn.getAttribute("aria-label"));

        const isMakeup =
            text === "makeup" ||
            aria.includes("makeup");

        if (isMakeup) {
            btn.remove();
            console.log("[Roblox Tweaker] Removed Makeup filter");
        }
    }
}