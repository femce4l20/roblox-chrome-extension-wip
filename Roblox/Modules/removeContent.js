// =====================================================
// REMOVE CONTENT MODULE

// This module:
// - Removes the "Makeup" filter from the Catalog search sidebar and tab from the Avatar Editor.
// - Uses a MutationObserver to watch for dynamic UI changes and re-apply removals as needed.
// =====================================================

function normalizeText(text) {
    return (text || "").toLowerCase().replace(/\s+/g, " ").trim();
}

// CATALOG: REMOVE MAKEUP FILTER

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
            console.log("[Cvtmvtts Tweaker] Removed Makeup filter");
        }
    }
}

// AVATAR EDITOR: REMOVE MAKEUP CATEGORY

function removeMakeupCategory() {
    // Use the actual ID directly so the dot in the ID does not cause selector issues.
    const makeupButton =
        document.getElementById("label.makeup-dropdown") ||
        document.querySelector('[id="label.makeup-dropdown"]');

    if (!makeupButton) return;

    const tabItem = makeupButton.closest("li.rbx-tab") || makeupButton.closest("li");
    if (!tabItem) return;

    tabItem.remove();
    console.log("[Cvtmvtts Tweaker] Removed Makeup category tab");
}

// RUN / WATCH FOR DYNAMIC UI

let makeupObserverStarted = false;

function removeMakeupContent() {
    removeMakeupFilter();
    removeMakeupCategory();
}

function startMakeupObserver() {
    if (makeupObserverStarted) return;
    makeupObserverStarted = true;

    removeMakeupContent();

    const observer = new MutationObserver(() => {
        removeMakeupContent();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startMakeupObserver);
} else {
    startMakeupObserver();
}
