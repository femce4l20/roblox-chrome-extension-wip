// =====================================================
// CVTMVTTS TWEAKER - SHARED UTILITIES + SETTINGS STATE
// =====================================================

(function () {
    if (window.CvtmvttsTweaker?.shared) return;

    const NS = window.CvtmvttsTweaker = window.CvtmvttsTweaker || {};

    const STORAGE_KEY = "cvtmvtts-tweaker-settings";

    const DEFAULT_SETTINGS = Object.freeze({
        removeMakeupFilter: true,
        removeMakeupCategory: true,
        removeDownloadAppItem: true,
        removeTimedOptionsContainer: true,
        removeItemDetailSection: true,
        removeSponsoredCatalogItems: true,
        updateHomeHeading: true,

        enforceCarouselOrder: true,
        enforceClassicClothingOrder: true,
        textReplacements: true
    });

    function log(...args) {
        console.log("[Cvtmvtts Tweaker]", ...args);
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeText(text) {
        return (text || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function getButtonLabel(btn) {
        const span = btn?.querySelector?.(".filter-option-name");
        return normalizeText(span ? span.textContent : btn?.textContent);
    }

    function findButtonByLabel(container, labels) {
        if (!container) return null;

        return Array.from(container.querySelectorAll("button")).find(btn => {
            const text = getButtonLabel(btn);
            return labels.includes(text);
        }) || null;
    }

    function sanitizeSettings(input) {
        const source = input && typeof input === "object" ? input : {};
        const clean = {};

        for (const key of Object.keys(DEFAULT_SETTINGS)) {
            clean[key] = Boolean(source[key] ?? DEFAULT_SETTINGS[key]);
        }

        return clean;
    }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return clone(DEFAULT_SETTINGS);

            const parsed = JSON.parse(raw);
            return sanitizeSettings(parsed);
        } catch (error) {
            log("Failed to load saved settings, using defaults", error);
            return clone(DEFAULT_SETTINGS);
        }
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeSettings(settings)));
        } catch (error) {
            log("Failed to save settings", error);
        }
    }

    function ensureStyle(styleId, cssText) {
        if (document.getElementById(styleId)) return;

        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = cssText;
        document.head.appendChild(style);
    }

    function onReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn, { once: true });
        } else {
            fn();
        }
    }

    function createScheduler(callback) {
        let scheduled = false;

        return function schedule() {
            if (scheduled) return;
            scheduled = true;

            requestAnimationFrame(() => {
                scheduled = false;
                callback();
            });
        };
    }

    const state = {
        activeSettings: loadSettings(),
        draftSettings: null
    };

    function getActiveSettings() {
        return clone(state.activeSettings);
    }

    function getDraftSettings() {
        return clone(state.draftSettings || state.activeSettings);
    }

    function beginSettingsEdit() {
        state.draftSettings = clone(state.activeSettings);
        return getDraftSettings();
    }

    function setDraftSetting(key, value) {
        if (!Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, key)) {
            return getDraftSettings();
        }

        if (!state.draftSettings) {
            state.draftSettings = clone(state.activeSettings);
        }

        state.draftSettings[key] = Boolean(value);
        return getDraftSettings();
    }

    function commitSettingsEdit() {
        if (state.draftSettings) {
            state.activeSettings = sanitizeSettings(state.draftSettings);
            saveSettings(state.activeSettings);
            state.draftSettings = null;
        }

        return getActiveSettings();
    }

    function discardSettingsEdit() {
        state.draftSettings = null;
        return getActiveSettings();
    }

    function resetSettingsToDefaults() {
        state.activeSettings = clone(DEFAULT_SETTINGS);
        saveSettings(state.activeSettings);
        state.draftSettings = null;
        return getActiveSettings();
    }

    function applyAll() {
        NS.modules?.removeContent?.applyAllChanges?.();
        NS.modules?.layoutTweaks?.applyTweaks?.();
    }

    NS.shared = {
        log,
        normalizeText,
        getButtonLabel,
        findButtonByLabel,
        ensureStyle,
        onReady,
        createScheduler,
        loadSettings,
        saveSettings,
        sanitizeSettings,
        DEFAULT_SETTINGS
    };

    NS.getSettings = getActiveSettings;
    NS.getDraftSettings = getDraftSettings;
    NS.beginSettingsEdit = beginSettingsEdit;
    NS.setDraftSetting = setDraftSetting;
    NS.commitSettingsEdit = commitSettingsEdit;
    NS.discardSettingsEdit = discardSettingsEdit;
    NS.resetSettingsToDefaults = resetSettingsToDefaults;
    NS.applyAll = applyAll;
    NS.state = state;
})();
