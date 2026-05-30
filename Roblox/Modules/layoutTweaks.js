// =====================================================
// CVTMVTTS TWEAKER - LAYOUT / TEXT TWEAKS MODULE
// Controlled by settings toggles.
// =====================================================

(function () {
    const shared = window.CvtmvttsTweaker?.shared;
    if (!shared) return;

    const { log, findButtonByLabel, createScheduler, onReady, normalizeText } = shared;

    let observerStarted = false;

    // =====================================================
    // CAROUSEL ORDER FIX
    // =====================================================

    function enforceCarouselOrder() {
        const friend = document.querySelector(".friend-carousel-container");
        const game = document.querySelector(".game-sort-carousel-wrapper");
        if (!friend || !game) return;

        const parent = friend.parentElement;
        if (!parent) return;

        if (friend.nextElementSibling === game) return;

        friend.insertAdjacentElement("afterend", game);
        log("Fixed carousel order");
    }

    // =====================================================
    // CATALOG: CLASSIC CLOTHING ABOVE 3D CLOTHING
    // =====================================================

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

        log("Moved Classic Clothing above 3D Clothing");
    }

    // =====================================================
    // TEXT REPLACEMENT
    // =====================================================

    function replaceTextInNode(node) {
        if (!node) return;

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

        node.childNodes?.forEach(replaceTextInNode);
    }

    function applyTextReplacements() {
        replaceTextInNode(document.body);
    }

    // =====================================================
    // APPLY ALL MODIFICATIONS
    // =====================================================

    function applyTweaks() {
        const settings = window.CvtmvttsTweaker?.getSettings?.() || {};

        if (settings.enforceCarouselOrder) enforceCarouselOrder();
        if (settings.enforceClassicClothingOrder) enforceClassicClothingOrder();
        if (settings.textReplacements) applyTextReplacements();
    }

    function start() {
        if (observerStarted) return;
        observerStarted = true;

        applyTweaks();

        const scheduleApply = createScheduler(applyTweaks);
        const observer = new MutationObserver(scheduleApply);

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    window.CvtmvttsTweaker = window.CvtmvttsTweaker || {};
    window.CvtmvttsTweaker.modules = window.CvtmvttsTweaker.modules || {};
    window.CvtmvttsTweaker.modules.layoutTweaks = {
        enforceCarouselOrder,
        enforceClassicClothingOrder,
        applyTextReplacements,
        applyTweaks
    };

    onReady(start);
})();
