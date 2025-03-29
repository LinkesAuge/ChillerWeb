/**
 * i18n.js
 *
 * Description: Handles internationalization (i18n) by loading language files
 *              and providing translation capabilities.
 * Usage:
 *     import { initializeI18n, setLanguage, getTranslation } from './core/i18n.js';
 *     await initializeI18n();
 *     const greeting = getTranslation('welcomeMessage');
 *     await setLanguage('de');
 */

import { getState, setState } from './state.js';

// Stores the currently loaded translations
let translations = {};
const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = ['en', 'de']; // Define supported languages

/**
 * Fetches and loads the language file for the given language code.
 *
 * Args:
 *     langCode (string): The language code (e.g., 'en', 'de').
 *
 * Returns:
 *     Promise<object>: A promise that resolves with the loaded translation object
 *                      or rejects if the file cannot be fetched or parsed.
 */
async function loadLanguageFile(langCode) {
    if (!SUPPORTED_LANGUAGES.includes(langCode)) {
        console.warn(`Unsupported language code: ${langCode}. Falling back to ${DEFAULT_LANGUAGE}.`);
        langCode = DEFAULT_LANGUAGE;
    }
    const langFileUrl = `/locales/${langCode}.json`; // Path relative to public directory
    console.log(`Attempting to load language file: ${langFileUrl}`);

    try {
        const response = await fetch(langFileUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching ${langFileUrl}`);
        }
        const data = await response.json();
        console.log(`Successfully loaded language: ${langCode}`);
        return data;
    } catch (error) {
        console.error(`Failed to load or parse language file ${langFileUrl}:`, error);
        throw error; // Re-throw to be caught by the caller
    }
}

/**
 * Sets the current language for the application.
 * Loads the corresponding language file and updates the state.
 *
 * Args:
 *     langCode (string): The language code to set (e.g., 'en', 'de').
 *
 * Returns:
 *     Promise<void>: A promise that resolves when the language is set and loaded.
 */
export async function setLanguage(langCode) {
    try {
        const loadedTranslations = await loadLanguageFile(langCode);
        translations = loadedTranslations;
        setState('currentLanguage', langCode);
        // Optional: Save preference to localStorage
        localStorage.setItem('language', langCode);
        // Optional: Update the lang attribute of the <html> tag
        document.documentElement.lang = langCode;
        console.log(`Language set to: ${langCode}`);
    } catch (error) {
        console.error(`Failed to set language to ${langCode}:`, error);
        // Optionally fall back to default language if setting fails
        if (getState('currentLanguage') !== DEFAULT_LANGUAGE) {
            console.warn(`Falling back to default language: ${DEFAULT_LANGUAGE}`);
            await setLanguage(DEFAULT_LANGUAGE);
        }
    }
}

/**
 * Retrieves a translated string for the given key.
 *
 * Args:
 *     key (string): The translation key (e.g., 'welcomeMessage', 'table.header.rank').
 *     fallback (string|undefined): Optional fallback string if key not found.
 *
 * Returns:
 *     string: The translated string, the fallback string, or the key itself if not found.
 */
export function getTranslation(key, fallback = undefined) {
    const keys = key.split('.');
    let result = translations;

    for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
            break;
        }
    }

    if (result === undefined) {
        console.warn(`Translation key not found: '${key}' for language '${getState('currentLanguage')}'`);
        return fallback !== undefined ? fallback : key; // Return fallback or key
    }

    return String(result); // Ensure result is a string
}

/**
 * Initializes the i18n system.
 * Determines the initial language (from localStorage or default) and loads it.
 *
 * Returns:
 *     Promise<void>: A promise that resolves when the initial language is loaded.
 */
export async function initializeI18n() {
    console.log("Initializing i18n...");
    const savedLang = localStorage.getItem('language');
    const initialLang = (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) ? savedLang : DEFAULT_LANGUAGE;
    await setLanguage(initialLang);
    console.log("i18n initialization complete.");
} 