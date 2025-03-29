/**
 * helpers.js
 *
 * Description: Provides utility functions used across the application.
 * Includes debounce, status updates, number formatting, etc.
 */

import { elements } from '../core/domElements'; // Needed for setStatus

let statusTimeout = null;

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @returns {Function} The new debounced function.
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Displays a status message to the user.
 *
 * @param {string} message - The message to display.
 * @param {'info'|'success'|'warning'|'error'} type - The type of message.
 * @param {number|null} [duration=null] - Auto-hide duration in ms (null for persistent).
 */
export function setStatus(message, type = 'info', duration = null) {
    // Re-implemented from uiManager to avoid circular dependency, consider refactor later if needed
    if (!elements.statusMessage || !elements.statusArea) {
        console.warn("Status elements not found, cannot display message:", message);
        return;
    }

    console.log(`setStatus (${type}): ${message}`);
    elements.statusMessage.textContent = message;
    // Remove previous type classes
    elements.statusArea.classList.remove('text-blue-400', 'text-green-400', 'text-yellow-400', 'text-red-500', 'bg-blue-900/30', 'bg-green-900/30', 'bg-yellow-900/30', 'bg-red-900/30');

    let typeClass = '';
    let bgClass = '';
    switch (type) {
        case 'success': typeClass = 'text-green-400'; bgClass = 'bg-green-900/30'; break;
        case 'warning': typeClass = 'text-yellow-400'; bgClass = 'bg-yellow-900/30'; break;
        case 'error': typeClass = 'text-red-500'; bgClass = 'bg-red-900/30'; break;
        case 'info':
        default: typeClass = 'text-blue-400'; break; // Optional bgClass = 'bg-blue-900/30';
    }
    elements.statusArea.classList.add(typeClass);
    if(bgClass) elements.statusArea.classList.add(bgClass);
    elements.statusArea.classList.remove('opacity-0');

    // Clear previous timeout if set
    if (statusTimeout) {
        clearTimeout(statusTimeout);
    }

    // Set new timeout if duration is provided
    if (duration !== null) {
        statusTimeout = setTimeout(() => {
            clearStatusHelper(); // Use helper to avoid naming conflict
        }, duration);
    }
}

/**
 * Helper to clear the status message.
 */
function clearStatusHelper() {
    if (!elements.statusMessage || !elements.statusArea) return;
    elements.statusMessage.textContent = '';
    elements.statusArea.classList.add('opacity-0');
    elements.statusArea.classList.remove('text-blue-400', 'text-green-400', 'text-yellow-400', 'text-red-500', 'bg-blue-900/30', 'bg-green-900/30', 'bg-yellow-900/30', 'bg-red-900/30');
    if (statusTimeout) {
        clearTimeout(statusTimeout);
        statusTimeout = null;
    }
}

/**
 * Formats a number using Intl.NumberFormat with compact notation for large numbers.
 * Uses 'en-GB' for consistent formatting regardless of browser locale.
 *
 * @param {number} value - The number to format.
 * @returns {string} The formatted number string.
 */
export const NUMERIC_FORMATTER = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 });

/**
 * Formats a number using the standard Intl.NumberFormat.
 * Uses 'en-GB' locale.
 *
 * @param {number} value - The number to format.
 * @param {object} [options] - Optional Intl.NumberFormat options.
 * @returns {string} The formatted number string.
 */
export function formatNumber(value, options = {}) {
    if (typeof value !== 'number' || isNaN(value)) {
        // console.warn(`formatNumber received non-numeric value: ${value}`);
        return '-'; // Or return 'N/A', 0, etc.
    }
    try {
        return new Intl.NumberFormat('en-GB', options).format(value);
    } catch (e) {
        console.error("Error formatting number:", value, e);
        return String(value); // Fallback to string conversion
    }
}

/**
 * Downloads generated data as a file.
 * NOTE: This is a simplified version. Consider a more robust CSV/JSON generation if needed.
 *
 * @param {string} dataString The data content as a string.
 * @param {string} filename The desired filename (e.g., 'data.csv').
 * @param {string} type The MIME type (e.g., 'text/csv;charset=utf-8;').
 */
export function downloadFile(dataString, filename, type) {
    try {
        const blob = new Blob(["\uFEFF" + dataString], { type: type }); // Add BOM for Excel CSV compatibility
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`File download initiated: ${filename}`);
    } catch (error) {
        console.error("Error initiating file download:", error);
        setStatus(getText('status.downloadError'), 'error', 5000); // Assuming getText is available or passed in
    }
} 