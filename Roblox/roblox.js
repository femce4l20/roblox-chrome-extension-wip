console.log("[Cvtmvtts Tweaker] Loaded");

// HELPERS

function normalizeText(text) {
    return (text || "").toLowerCase().replace(/\s+/g, " ").trim();
}

// Finds a button whose visible label exactly matches one of the given strings
function findButtonByLabel(container, labels) {
    return Array.from(container.querySelectorAll("button")).find(btn => {
        const span = btn.querySelector(".filter-option-name");
        const text = normalizeText(span ? span.textContent : btn.textContent);
        return labels.includes(text);
    }) || null;
}

// CAROUSEL ORDER FIX

function enforceCarouselOrder() {
    const friend = document.querySelector(".friend-carousel-container");
    const game = document.querySelector(".game-sort-carousel-wrapper");
    if (!friend || !game) return;
    const parent = friend.parentElement;
    if (!parent) return;
    if (friend.nextElementSibling === game) return;
    friend.insertAdjacentElement("afterend", game);
    console.log("[Cvtmvtts Tweaker] Fixed carousel order");
}

// CATALOG: CLASSIC CLOTHING ABOVE 3D CLOTHING

function enforceClassicClothingOrder() {
    const container = document.querySelector("#catalog-content .filter-options-container");
    if (!container) return;

    const shirtBtn = findButtonByLabel(container, ["shirts"]);
    if (!shirtBtn) return;

    const classicLabels = ["classic shirts", "classic t-shirts", "classic pants"];
    const classicButtons = classicLabels
        .map(label => findButtonByLabel(container, [label]))
        .filter(Boolean);

    if (classicButtons.length === 0) return;

    const children = Array.from(container.children);
    const shirtIndex = children.indexOf(shirtBtn);

    const allCorrect = classicButtons.every(btn => {
        const idx = children.indexOf(btn);
        return idx !== -1 && idx < shirtIndex;
    });

    if (allCorrect) return;

    for (const btn of classicButtons) {
        container.insertBefore(btn, shirtBtn);
    }

    console.log("[Cvtmvtts Tweaker] Moved Classic Clothing above 3D Clothing");
}

// TEXT REPLACEMENT

function replaceTextInNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent;
        const replacements = {
            "Charts": "Games",
            "Roblox Plus": "Premium",
            "Marketplace": "Catalog"
        };
        for (const [find, replace] of Object.entries(replacements)) {
            if (text.includes(find)) {
                text = text.replaceAll(find, replace);
            }
        }
        node.textContent = text;
    }
    node.childNodes.forEach(replaceTextInNode);
}

function applyTextReplacements() {
    replaceTextInNode(document.body);
}

// APPLY ALL MODIFICATIONS

function applyTweaks() {
    enforceCarouselOrder();
    enforceClassicClothingOrder();
    removeMakeupFilter();
    applyTextReplacements();
}

// INITIAL RUN

applyTweaks();

// OBSERVER
// Roblox constantly updates dynamically

let scheduled = false;

function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
        scheduled = false;
        applyTweaks();
    });
}

const observer = new MutationObserver(scheduleUpdate);
observer.observe(document.body, {
    childList: true,
    subtree: true
});
