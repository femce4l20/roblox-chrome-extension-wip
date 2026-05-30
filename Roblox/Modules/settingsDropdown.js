// =====================================================
// CVTMVTTS TWEAKER - SETTINGS DROPDOWN MODULE
//
// Adds a custom settings dropdown item to Roblox's settings menu.
// The panel now has live toggles, an Apply button, and persists state.
// Improved for viewport resilience, dependable icons, and Roblox-style UI.
// =====================================================

(function () {
    const shared = window.CvtmvttsTweaker?.shared;
    if (!shared) return;

    const { log, ensureStyle, onReady } = shared;

    const STYLE_ID = "cvtmvtts-settings-style";
    const PANEL_ID = "cvtmvtts-settings-panel";
    const BUTTON_ID = "cvtmvtts-settings-button";

    const MENU_SELECTORS = [
        "#settings-popover-menu",
        "ul#settings-popover-menu",
        "div#settings-popover-menu",
        "[id='settings-popover-menu']"
    ];

    const SECTIONS = [
        {
            title: "Content cleanup",
            icon: "filter",
            description: "Turn individual removals on or off.",
            items: [
                { key: "removeMakeupFilter", label: "Remove Makeup filter", desc: "Removes the Makeup filter from Catalog search." },
                { key: "removeMakeupCategory", label: "Remove Makeup category tab", desc: "Removes the Makeup tab in Avatar Editor." },
                { key: "removeDownloadAppItem", label: "Remove Download App item", desc: "Removes the top-right Download App navbar item." },
                { key: "removeTimedOptionsContainer", label: "Remove timed options", desc: "Removes the timed options container on item pages." },
                { key: "removeItemDetailSection", label: "Remove extra item section", desc: "Removes the extra item details block." },
                { key: "removeSponsoredCatalogItems", label: "Remove sponsored catalog items", desc: "Removes sponsored catalog blocks." },
                { key: "updateHomeHeading", label: "Welcome heading", badge: "HOME", desc: 'Changes Home to "Welcome, {Username}!"' }
            ]
        },
        {
            title: "Layout and text tweaks",
            icon: "layout",
            description: "Control ordering and text replacement changes.",
            items: [
                { key: "enforceCarouselOrder", label: "Fix carousel order", desc: "Moves the friend carousel before the game sort carousel." },
                { key: "enforceClassicClothingOrder", label: "Classic clothing above 3D", desc: "Moves classic clothing filters above 3D clothing filters." },
                { key: "textReplacements", label: "Replace Roblox text labels", desc: 'Changes labels like "Charts" and "Marketplace".' }
            ]
        }
    ];

    let keyHandlerBound = false;
    let observerStarted = false;
    let resizeBound = false;

    const ICONS = {
        "adjustments-horizontal": `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 7h8M18 7h2M12 7a2 2 0 1 0-4 0a2 2 0 0 0 4 0Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M4 17h2M10 17h10M8 17a2 2 0 1 0-4 0a2 2 0 0 0 4 0Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M14 12h6M4 12h4M16 12a2 2 0 1 0-4 0a2 2 0 0 0 4 0Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `,
        x: `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"/>
            </svg>
        `,
        filter: `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
            </svg>
        `,
        layout: `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <rect x="4" y="5" width="6" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/>
                <rect x="12.5" y="5" width="7.5" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/>
                <rect x="12.5" y="13" width="7.5" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
        `
    };

    function icon(name, className = "") {
        const svg = ICONS[name] || ICONS["adjustments-horizontal"];
        return `<span class="cvtmvtts-icon ${className}" aria-hidden="true">${svg}</span>`;
    }

    function getMenu() {
        for (const selector of MENU_SELECTORS) {
            const menu = document.querySelector(selector);
            if (menu) return menu;
        }
        return null;
    }

    function injectStyles() {
        ensureStyle(STYLE_ID, `
            :root {
                --cvt-blue: #00a2ff;
                --cvt-blue-soft: rgba(0, 162, 255, 0.16);
                --cvt-blue-soft-2: rgba(0, 162, 255, 0.09);
                --cvt-bg: #18191c;
                --cvt-bg-2: #1f2126;
                --cvt-surface: #24262b;
                --cvt-border: rgba(255, 255, 255, 0.08);
                --cvt-text: rgba(255, 255, 255, 0.94);
                --cvt-subtext: rgba(255, 255, 255, 0.58);
                --cvt-muted: rgba(255, 255, 255, 0.42);
                --cvt-radius: 16px;
            }

            /* Menu item */
            #settings-popover-menu > li.cvtmvtts-settings-item > a,
            #settings-popover-menu > li#${BUTTON_ID} > a {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                width: 100% !important;
                box-sizing: border-box !important;
                padding: 9px 12px !important;
                color: rgba(255, 255, 255, 0.78) !important;
                text-decoration: none !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                line-height: 1.2 !important;
                border-radius: 10px !important;
                transition: background-color 0.14s ease, color 0.14s ease, transform 0.14s ease !important;
                user-select: none !important;
                -webkit-tap-highlight-color: transparent !important;
            }

            #settings-popover-menu > li.cvtmvtts-settings-item > a:hover,
            #settings-popover-menu > li#${BUTTON_ID} > a:hover {
                background: rgba(255, 255, 255, 0.065) !important;
                color: #ffffff !important;
            }

            #settings-popover-menu > li.cvtmvtts-settings-item > a:active,
            #settings-popover-menu > li#${BUTTON_ID} > a:active {
                transform: translateY(0.5px) !important;
            }

            #settings-popover-menu > li.cvtmvtts-settings-item > a .cvtmvtts-menu-icon,
            #settings-popover-menu > li#${BUTTON_ID} > a .cvtmvtts-menu-icon {
                width: 16px !important;
                height: 16px !important;
                flex-shrink: 0 !important;
                color: rgba(255, 255, 255, 0.46) !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: color 0.14s ease !important;
            }

            #settings-popover-menu > li.cvtmvtts-settings-item > a:hover .cvtmvtts-menu-icon,
            #settings-popover-menu > li#${BUTTON_ID} > a:hover .cvtmvtts-menu-icon {
                color: var(--cvt-blue) !important;
            }

            #settings-popover-menu > li.cvtmvtts-settings-item > a .cvtmvtts-menu-icon svg,
            #settings-popover-menu > li#${BUTTON_ID} > a .cvtmvtts-menu-icon svg,
            #${PANEL_ID} .cvtmvtts-icon svg {
                width: 100% !important;
                height: 100% !important;
                display: block !important;
            }

            /* Overlay */
            #${PANEL_ID} {
                position: fixed;
                inset: 0;
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 2147483647;
                background:
                    radial-gradient(circle at top, rgba(0, 162, 255, 0.12), transparent 34%),
                    rgba(0, 0, 0, 0.64);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                font-family: "Gotham", "Helvetica Neue", Arial, sans-serif;
                padding: 10px;
                box-sizing: border-box;
            }

            #${PANEL_ID}.is-open {
                display: flex;
            }

            /* Panel shell */
            #${PANEL_ID} .cvtmvtts-panel {
                width: min(720px, calc(100vw - 20px));
                max-height: min(88vh, 860px);
                border-radius: 18px;
                overflow: hidden;
                background:
                    linear-gradient(180deg, rgba(255,255,255,0.03), transparent 24%),
                    var(--cvt-bg);
                border: 1px solid var(--cvt-border);
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.58);
                color: var(--cvt-text);
                display: flex;
                flex-direction: column;
                min-width: 0;
                position: relative;
            }

            /* Header */
            #${PANEL_ID} .cvtmvtts-panel-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 16px 18px 14px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                flex: 0 0 auto;
                background: linear-gradient(180deg, rgba(0, 162, 255, 0.08), rgba(0, 0, 0, 0));
            }

            #${PANEL_ID} .cvtmvtts-header-left {
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 0;
            }

            #${PANEL_ID} .cvtmvtts-header-icon {
                width: 36px;
                height: 36px;
                border-radius: 11px;
                background: linear-gradient(180deg, rgba(0, 162, 255, 0.25), rgba(0, 162, 255, 0.13));
                display: flex;
                align-items: center;
                justify-content: center;
                color: #dff4ff;
                flex-shrink: 0;
                border: 1px solid rgba(0, 162, 255, 0.2);
                box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
            }

            #${PANEL_ID} .cvtmvtts-header-icon svg {
                width: 18px;
                height: 18px;
            }

            #${PANEL_ID} .cvtmvtts-title-wrap {
                display: flex;
                flex-direction: column;
                gap: 2px;
                min-width: 0;
            }

            #${PANEL_ID} .cvtmvtts-title {
                font-size: 16px;
                font-weight: 700;
                line-height: 1.2;
                margin: 0;
                color: #ffffff;
                letter-spacing: 0.01em;
            }

            #${PANEL_ID} .cvtmvtts-subtitle {
                font-size: 11.5px;
                color: var(--cvt-subtext);
                line-height: 1.35;
            }

            #${PANEL_ID} .cvtmvtts-close {
                appearance: none;
                border: 0;
                outline: 0;
                cursor: pointer;
                width: 32px;
                height: 32px;
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.06);
                color: rgba(255, 255, 255, 0.78);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                flex-shrink: 0;
                transition: background 0.14s ease, color 0.14s ease, transform 0.14s ease;
            }

            #${PANEL_ID} .cvtmvtts-close:hover {
                background: rgba(255, 255, 255, 0.11);
                color: #ffffff;
            }

            #${PANEL_ID} .cvtmvtts-close:active {
                transform: translateY(0.5px);
            }

            #${PANEL_ID} .cvtmvtts-close svg {
                width: 15px;
                height: 15px;
            }

            /* Body */
            #${PANEL_ID} .cvtmvtts-body {
                padding: 16px 18px 18px;
                overflow: auto;
                flex: 1 1 auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
                min-height: 0;
            }

            #${PANEL_ID} .cvtmvtts-body::-webkit-scrollbar {
                width: 10px;
            }

            #${PANEL_ID} .cvtmvtts-body::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.12);
                border: 2px solid rgba(0, 0, 0, 0);
                background-clip: padding-box;
                border-radius: 999px;
            }

            #${PANEL_ID} .cvtmvtts-body::-webkit-scrollbar-track {
                background: transparent;
            }

            /* Section */
            #${PANEL_ID} .cvtmvtts-section {
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.02));
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 14px;
                overflow: hidden;
            }

            #${PANEL_ID} .cvtmvtts-section-head {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 12px 14px 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                background: linear-gradient(180deg, rgba(0, 162, 255, 0.06), rgba(0, 0, 0, 0));
            }

            #${PANEL_ID} .cvtmvtts-section-head-icon {
                width: 18px;
                height: 18px;
                color: rgba(255, 255, 255, 0.58);
                margin-top: 1px;
                flex-shrink: 0;
            }

            #${PANEL_ID} .cvtmvtts-section-title {
                font-size: 12.5px;
                font-weight: 700;
                color: rgba(255, 255, 255, 0.92);
                margin: 0 0 2px;
                letter-spacing: 0.01em;
            }

            #${PANEL_ID} .cvtmvtts-section-desc {
                font-size: 11px;
                color: var(--cvt-muted);
                margin: 0;
                line-height: 1.35;
            }

            /* Toggles */
            #${PANEL_ID} .cvtmvtts-toggle-list {
                display: flex;
                flex-direction: column;
            }

            #${PANEL_ID} .cvtmvtts-toggle {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 11px 14px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                cursor: pointer;
                transition: background 0.12s ease;
                user-select: none;
            }

            #${PANEL_ID} .cvtmvtts-toggle:last-child {
                border-bottom: none;
            }

            #${PANEL_ID} .cvtmvtts-toggle:hover {
                background: rgba(255, 255, 255, 0.03);
            }

            #${PANEL_ID} .cvtmvtts-toggle input {
                width: 16px;
                height: 16px;
                flex-shrink: 0;
                accent-color: var(--cvt-blue);
                margin: 0;
                cursor: pointer;
            }

            #${PANEL_ID} .cvtmvtts-toggle-main {
                min-width: 0;
                flex: 1 1 auto;
            }

            #${PANEL_ID} .cvtmvtts-toggle-label {
                display: inline-flex;
                align-items: center;
                gap: 7px;
                font-size: 12.5px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.9);
                margin-bottom: 2px;
                line-height: 1.25;
            }

            #${PANEL_ID} .cvtmvtts-toggle-desc {
                font-size: 11px;
                line-height: 1.45;
                color: var(--cvt-muted);
            }

            #${PANEL_ID} .cvtmvtts-badge {
                font-size: 10px;
                font-weight: 700;
                padding: 2px 7px;
                border-radius: 999px;
                background: var(--cvt-blue-soft);
                color: #9fdcff;
                letter-spacing: 0.02em;
                vertical-align: middle;
                border: 1px solid rgba(0, 162, 255, 0.18);
            }

            /* Footer */
            #${PANEL_ID} .cvtmvtts-footer {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 10px;
                padding: 12px 18px 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.06);
                flex: 0 0 auto;
                background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(255,255,255,0.01));
            }

            #${PANEL_ID} .cvtmvtts-actions {
                display: flex;
                gap: 8px;
            }

            #${PANEL_ID} .cvtmvtts-btn {
                appearance: none;
                border: 0;
                cursor: pointer;
                border-radius: 11px;
                padding: 8px 16px;
                font-size: 13px;
                font-weight: 700;
                transition: background 0.14s ease, transform 0.14s ease, color 0.14s ease;
            }

            #${PANEL_ID} .cvtmvtts-btn:active {
                transform: translateY(0.5px);
            }

            #${PANEL_ID} .cvtmvtts-btn-secondary {
                background: rgba(255, 255, 255, 0.075);
                color: rgba(255, 255, 255, 0.82);
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            #${PANEL_ID} .cvtmvtts-btn-secondary:hover {
                background: rgba(255, 255, 255, 0.11);
                color: #ffffff;
            }

            #${PANEL_ID} .cvtmvtts-btn-primary {
                background: linear-gradient(180deg, #00b0ff, #008fe0);
                color: #ffffff;
                box-shadow: 0 10px 24px rgba(0, 162, 255, 0.22);
                border: 1px solid rgba(255, 255, 255, 0.08);
            }

            #${PANEL_ID} .cvtmvtts-btn-primary:hover {
                background: linear-gradient(180deg, #15b7ff, #0098eb);
            }

            /* Responsive sizing */
            @media (max-width: 700px) {
                #${PANEL_ID} {
                    padding: 6px;
                }

                #${PANEL_ID} .cvtmvtts-panel {
                    width: calc(100vw - 12px);
                    max-height: calc(100vh - 12px);
                    border-radius: 16px;
                }

                #${PANEL_ID} .cvtmvtts-panel-header {
                    padding: 14px 14px 12px;
                }

                #${PANEL_ID} .cvtmvtts-body {
                    padding: 14px;
                }

                #${PANEL_ID} .cvtmvtts-footer {
                    padding: 11px 14px 14px;
                }

                #${PANEL_ID} .cvtmvtts-title {
                    font-size: 15px;
                }
            }

            @media (max-width: 440px) {
                #${PANEL_ID} .cvtmvtts-panel-header {
                    align-items: flex-start;
                }

                #${PANEL_ID} .cvtmvtts-header-left {
                    gap: 10px;
                }

                #${PANEL_ID} .cvtmvtts-actions {
                    width: 100%;
                }

                #${PANEL_ID} .cvtmvtts-footer {
                    justify-content: stretch;
                }

                #${PANEL_ID} .cvtmvtts-btn {
                    flex: 1 1 0;
                    padding-inline: 12px;
                }
            }
        `);
    }

    function buildToggleMarkup(item, settings) {
        const checked = settings[item.key] ? "checked" : "";
        const badge = item.badge ? `<span class="cvtmvtts-badge">${item.badge}</span>` : "";

        return `
            <label class="cvtmvtts-toggle">
                <input type="checkbox" data-setting-key="${item.key}" ${checked}>
                <span class="cvtmvtts-toggle-main">
                    <span class="cvtmvtts-toggle-label">${item.label}${badge}</span>
                    <span class="cvtmvtts-toggle-desc">${item.desc}</span>
                </span>
            </label>
        `;
    }

    function buildPanelMarkup(settings) {
        const sectionsMarkup = SECTIONS.map(section => `
            <div class="cvtmvtts-section">
                <div class="cvtmvtts-section-head">
                    ${icon(section.icon, "cvtmvtts-section-head-icon")}
                    <div>
                        <p class="cvtmvtts-section-title">${section.title}</p>
                        <p class="cvtmvtts-section-desc">${section.description}</p>
                    </div>
                </div>
                <div class="cvtmvtts-toggle-list">
                    ${section.items.map(item => buildToggleMarkup(item, settings)).join("")}
                </div>
            </div>
        `).join("");

        return `
            <div class="cvtmvtts-panel" role="dialog" aria-modal="true" aria-label="Cvtmvtts Tweaker Settings">
                <div class="cvtmvtts-panel-header">
                    <div class="cvtmvtts-header-left">
                        <div class="cvtmvtts-header-icon">
                            ${icon("adjustments-horizontal")}
                        </div>
                        <div class="cvtmvtts-title-wrap">
                            <h2 class="cvtmvtts-title">Cvtmvtts Tweaker</h2>
                            <div class="cvtmvtts-subtitle">Toggle tweaks, then press Apply to save &amp; re-run.</div>
                        </div>
                    </div>
                    <button class="cvtmvtts-close" type="button" aria-label="Close">
                        ${icon("x")}
                    </button>
                </div>

                <div class="cvtmvtts-body">
                    ${sectionsMarkup}
                </div>

                <div class="cvtmvtts-footer">
                    <div class="cvtmvtts-actions">
                        <button class="cvtmvtts-btn cvtmvtts-btn-secondary" type="button" data-action="discard">Close</button>
                        <button class="cvtmvtts-btn cvtmvtts-btn-primary" type="button" data-action="apply">Apply</button>
                    </div>
                </div>
            </div>
        `;
    }

    function ensurePanel() {
        let overlay = document.getElementById(PANEL_ID);
        if (overlay) return overlay;

        overlay = document.createElement("div");
        overlay.id = PANEL_ID;

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                hidePanel();
            }
        });

        document.body.appendChild(overlay);
        return overlay;
    }

    function syncPanelLayout() {
        const overlay = document.getElementById(PANEL_ID);
        if (!overlay) return;
        const panel = overlay.querySelector(".cvtmvtts-panel");
        if (!panel) return;

        // Keep the panel comfortably inside the viewport, even when Roblox UI changes size.
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

        const paddingX = vw <= 700 ? 12 : 20;
        const paddingY = vh <= 700 ? 12 : 20;

        panel.style.maxWidth = `${Math.max(320, vw - paddingX)}px`;
        panel.style.maxHeight = `${Math.max(320, vh - paddingY)}px`;
    }

    function renderPanel() {
        const overlay = ensurePanel();
        const settings = window.CvtmvttsTweaker?.beginSettingsEdit?.() || window.CvtmvttsTweaker?.getSettings?.() || {};

        overlay.innerHTML = buildPanelMarkup(settings);

        overlay.querySelector(".cvtmvtts-close")?.addEventListener("click", hidePanel);
        overlay.querySelector('[data-action="discard"]')?.addEventListener("click", hidePanel);
        overlay.querySelector('[data-action="apply"]')?.addEventListener("click", applyChanges);

        overlay.querySelectorAll("input[data-setting-key]").forEach(input => {
            input.addEventListener("change", (event) => {
                const key = event.currentTarget.getAttribute("data-setting-key");
                window.CvtmvttsTweaker?.setDraftSetting?.(key, event.currentTarget.checked);
            });
        });

        syncPanelLayout();
    }

    function showPanel() {
        injectStyles();
        renderPanel();

        const overlay = document.getElementById(PANEL_ID);
        if (overlay) overlay.classList.add("is-open");

        if (!keyHandlerBound) {
            keyHandlerBound = true;
            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape") hidePanel();
            });
        }

        if (!resizeBound) {
            resizeBound = true;
            const onResize = () => syncPanelLayout();
            window.addEventListener("resize", onResize, { passive: true });
            window.addEventListener("orientationchange", onResize, { passive: true });
        }

        // Reflow once after opening so it stays centered and sized for the current Roblox page state.
        requestAnimationFrame(syncPanelLayout);
        setTimeout(syncPanelLayout, 0);
    }

    function hidePanel() {
        const overlay = document.getElementById(PANEL_ID);
        if (overlay) overlay.classList.remove("is-open");

        window.CvtmvttsTweaker?.discardSettingsEdit?.();
    }

    function applyChanges() {
        window.CvtmvttsTweaker?.commitSettingsEdit?.();
        window.CvtmvttsTweaker?.applyAll?.();
        hidePanel();
    }

    function createSettingsButton() {
        const menu = getMenu();
        if (!menu) return false;

        if (document.getElementById(BUTTON_ID)) return true;

        const li = document.createElement("li");
        li.id = BUTTON_ID;
        li.className = "cvtmvtts-settings-item";

        li.innerHTML = `
            <a href="#" role="button" tabindex="0">
                <span class="cvtmvtts-menu-icon">${icon("adjustments-horizontal")}</span>
                <span class="cvtmvtts-menu-text">Tweaker Settings</span>
            </a>
        `;

        const link = li.querySelector("a");
        link?.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            showPanel();
        });

        const firstItem = menu.querySelector("li");
        if (firstItem) {
            menu.insertBefore(li, firstItem);
        } else {
            menu.appendChild(li);
        }

        log("Inserted settings dropdown item");
        return true;
    }

    function apply() {
        injectStyles();
        createSettingsButton();
        if (document.getElementById(PANEL_ID)?.classList.contains("is-open")) {
            syncPanelLayout();
        }
    }

    function start() {
        if (observerStarted) return;
        observerStarted = true;

        apply();

        const scheduleApply = shared.createScheduler(apply);
        const observer = new MutationObserver(scheduleApply);

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    window.CvtmvttsTweaker = window.CvtmvttsTweaker || {};
    window.CvtmvttsTweaker.modules = window.CvtmvttsTweaker.modules || {};
    window.CvtmvttsTweaker.modules.settingsDropdown = {
        showPanel,
        hidePanel,
        createSettingsButton,
        apply
    };

    onReady(start);
})();
