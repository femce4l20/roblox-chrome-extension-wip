// =====================================================
// CVTMVTTS TWEAKER - REMOVE CONTENT MODULE
//
// Removes unwanted UI elements and updates the Home heading.
// Controlled by settings toggles.
// =====================================================

(function () {
    const shared = window.CvtmvttsTweaker?.shared;
    if (!shared) return;

    const { log, normalizeText, createScheduler, onReady } = shared;

    let contentObserverStarted = false;

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

            const isMakeup = text === "makeup" || aria.includes("makeup");

            if (isMakeup) {
                btn.remove();
                log("Removed Makeup filter");
            }
        }
    }

    // =====================================================
    // AVATAR EDITOR: REMOVE MAKEUP CATEGORY
    // =====================================================

    function removeMakeupCategory() {
        const makeupButton =
            document.getElementById("label.makeup-dropdown") ||
            document.querySelector('[id="label.makeup-dropdown"]');

        if (!makeupButton) return;

        const tabItem = makeupButton.closest("li.rbx-tab") || makeupButton.closest("li");
        if (!tabItem) return;

        tabItem.remove();
        log("Removed Makeup category tab");
    }

    // =====================================================
    // NAVBAR: REMOVE DOWNLOAD APP ITEM
    // =====================================================

    function removeDownloadAppItem() {
        const item = document.querySelector(
            "#right-navigation-header > div.navbar-right.rbx-navbar-right > ul > li.navbar-icon-item.navbar-download-app-item"
        );

        if (!item) return;

        item.remove();
        log("Removed Download App item");
    }

    // =====================================================
    // ITEM PAGE: REMOVE TIMED OPTIONS CONTAINER
    // =====================================================

    function removeTimedOptionsContainer() {
        const container = document.querySelector(
            "#item-details > div.price-row-container > div > div.clearfix.item-info-row-container.timed-options-row-container > span > div.timed-options-container"
        );

        if (!container) return;

        container.remove();
        log("Removed timed options container");
    }

    // =====================================================
    // ITEM PAGE: REMOVE EXTRA DETAIL SECTION
    // =====================================================

    function removeItemDetailSection() {
        const section = document.querySelector("#item-details > div:nth-child(8)");

        if (!section) return;

        section.remove();
        log("Removed item-details nth-child(8) section");
    }

    // =====================================================
    // CATALOG PAGE: REMOVE SPONSORED CATALOG ITEMS
    // =====================================================

    function removeSponsoredCatalogItems() {
        const sponsored = document.querySelector("#sponsored-catalog-items");

        if (!sponsored) return;

        sponsored.remove();
        log("Removed sponsored catalog items");
    }

    // =====================================================
    // HOME PAGE: WELCOME HEADING
    // =====================================================

    function getLoggedInUsername() {
        const possibleSources = [
            window.Roblox?.CurrentUser?.name,
            window.Roblox?.CurrentUser?.username,
            document.querySelector('meta[name="user-name"]')?.content,
            document.querySelector('meta[name="username"]')?.content,
            document.querySelector('meta[property="rbx:username"]')?.content
        ];

        for (const source of possibleSources) {
            const value = (source || "").toString().trim();
            if (value) return value;
        }

        const anchors = Array.from(document.querySelectorAll('a[href*="/users/"]'));

        for (const a of anchors) {
            const text = (a.textContent || "").trim();
            if (text && text.length <= 20) {
                return text;
            }
        }

        return "";
    }

    function capitalizeFirstLetter(text) {
        if (!text) return text;
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    function updateHomeHeading() {
        if (window.location.pathname !== "/home") return;

        const heading = document.querySelector("#HomeContainer > div.section > div > h1");
        if (!heading) return;

        let username = getLoggedInUsername();
        if (!username) return;

        username = capitalizeFirstLetter(username);

        const desiredText = `Welcome, ${username}!`;

        if (heading.textContent !== desiredText) {
            heading.textContent = desiredText;
            log("Updated Home heading");
        }
    }

    // =====================================================
    // APPLY / WATCHER
    // =====================================================

    function applyAllChanges() {
        const settings = window.CvtmvttsTweaker?.getSettings?.() || {};

        if (settings.removeMakeupFilter) removeMakeupFilter();
        if (settings.removeMakeupCategory) removeMakeupCategory();
        if (settings.removeDownloadAppItem) removeDownloadAppItem();
        if (settings.removeTimedOptionsContainer) removeTimedOptionsContainer();
        if (settings.removeItemDetailSection) removeItemDetailSection();
        if (settings.removeSponsoredCatalogItems) removeSponsoredCatalogItems();
        if (settings.updateHomeHeading) updateHomeHeading();
    }

    function startContentObserver() {
        if (contentObserverStarted) return;
        contentObserverStarted = true;

        applyAllChanges();

        const scheduleUpdate = createScheduler(applyAllChanges);
        const observer = new MutationObserver(scheduleUpdate);

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    window.CvtmvttsTweaker = window.CvtmvttsTweaker || {};
    window.CvtmvttsTweaker.modules = window.CvtmvttsTweaker.modules || {};
    window.CvtmvttsTweaker.modules.removeContent = {
        removeMakeupFilter,
        removeMakeupCategory,
        removeDownloadAppItem,
        removeTimedOptionsContainer,
        removeItemDetailSection,
        removeSponsoredCatalogItems,
        updateHomeHeading,
        applyAllChanges
    };

    onReady(startContentObserver);
})();
