/**
 * dom.js
 *
 * Description: Provides utility functions for DOM manipulation.
 * Usage:
 *     import { $, $$, showLoading, hideLoading, updateText } from './utils/dom.js';
 *     const titleElement = $('#main-title');
 *     showLoading();
 */

/**
 * Alias for document.querySelector.
 *
 * Args:
 *     selector (string): CSS selector.
 *     parent (Element|Document): Parent element to search within (default: document).
 *
 * Returns:
 *     Element|null: The first matching element or null.
 */
export function $(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * Alias for document.querySelectorAll.
 *
 * Args:
 *     selector (string): CSS selector.
 *     parent (Element|Document): Parent element to search within (default: document).
 *
 * Returns:
 *     NodeList: A NodeList containing all matching elements.
 */
export function $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

/**
 * Shows the main loading spinner.
 * Assumes a spinner element with id="loading-spinner" exists.
 */
export function showLoading() {
    const spinner = $('#loading-spinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    } else {
        console.warn("showLoading: Spinner element #loading-spinner not found.");
    }
}

/**
 * Hides the main loading spinner.
 * Assumes a spinner element with id="loading-spinner" exists.
 */
export function hideLoading() {
    const spinner = $('#loading-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    } else {
        console.warn("hideLoading: Spinner element #loading-spinner not found.");
    }
}

/**
 * Updates the text content of an element safely.
 *
 * Args:
 *     selector (string): CSS selector for the target element.
 *     text (string): The new text content.
 *     parent (Element|Document): Parent element to search within (default: document).
 */
export function updateText(selector, text, parent = document) {
    const element = $(selector, parent);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`updateText: Element not found for selector "${selector}"`);
    }
}

/**
 * Updates the HTML content of an element safely.
 * Use with caution, ensure HTML is sanitized or trusted.
 *
 * Args:
 *     selector (string): CSS selector for the target element.
 *     html (string): The new HTML content.
 *     parent (Element|Document): Parent element to search within (default: document).
 */
export function updateHTML(selector, html, parent = document) {
    const element = $(selector, parent);
    if (element) {
        element.innerHTML = html;
    } else {
        console.warn(`updateHTML: Element not found for selector "${selector}"`);
    }
}

// Add more DOM utility functions as needed (e.g., addClass, removeClass, toggleClass, setAttribute) 