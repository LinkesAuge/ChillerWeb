/**
 * formatters.js
 *
 * Description: Provides utility functions for formatting data for display.
 * Usage:
 *     import { formatNumber, formatPercentage } from './utils/formatters.js';
 *     const displayValue = formatNumber(12345.67, 2);
 *     const displayPercent = formatPercentage(0.75);
 */

import { getState } from '../core/state.js';

/**
 * Formats a number according to the current locale.
 *
 * Args:
 *     value (number | string | null | undefined): The number to format.
 *     options (object): Intl.NumberFormat options (e.g., { minimumFractionDigits: 2, maximumFractionDigits: 2 }).
 *     fallback (string): Value to return if input is not a valid number (default: 'N/A').
 *
 * Returns:
 *     string: The formatted number string or the fallback.
 */
export function formatNumber(value, options = {}, fallback = 'N/A') {
    const num = Number(value);
    if (value === null || value === undefined || isNaN(num)) {
        return fallback;
    }
    const lang = getState('currentLanguage') || 'en';
    try {
        return new Intl.NumberFormat(lang, options).format(num);
    } catch (error) {
        console.error(`Error formatting number ${value} with lang ${lang}:`, error);
        return String(num); // Fallback to basic string conversion on error
    }
}

/**
 * Formats a number as a percentage according to the current locale.
 *
 * Args:
 *     value (number | string | null | undefined): The number (0 to 1) to format as a percentage.
 *     options (object): Intl.NumberFormat options (default: { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).
 *     fallback (string): Value to return if input is not a valid number (default: 'N/A').
 *
 * Returns:
 *     string: The formatted percentage string or the fallback.
 */
export function formatPercentage(value, options = {}, fallback = 'N/A') {
    const num = Number(value);
    if (value === null || value === undefined || isNaN(num)) {
        return fallback;
    }
    const defaultOptions = {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    };
    const mergedOptions = { ...defaultOptions, ...options }; // Merge defaults with provided options
    const lang = getState('currentLanguage') || 'en';
    try {
        return new Intl.NumberFormat(lang, mergedOptions).format(num);
    } catch (error) {
        console.error(`Error formatting percentage ${value} with lang ${lang}:`, error);
        // Fallback to basic percentage formatting
        return `${(num * 100).toFixed(mergedOptions.maximumFractionDigits || 1)}%`;
    }
}

/**
 * Formats a date object or timestamp according to the current locale.
 *
 * Args:
 *     date (Date | number | string | null | undefined): The date object, timestamp (ms), or parsable string.
 *     options (object): Intl.DateTimeFormat options (default: { dateStyle: 'medium', timeStyle: 'short' }).
 *     fallback (string): Value to return if input is not a valid date (default: 'N/A').
 *
 * Returns:
 *     string: The formatted date/time string or the fallback.
 */
export function formatDate(date, options = {}, fallback = 'N/A') {
    let dateObj;
    if (date instanceof Date) {
        dateObj = date;
    } else if (date !== null && date !== undefined) {
        dateObj = new Date(date);
    }

    if (!dateObj || isNaN(dateObj.getTime())) {
        return fallback;
    }

    const defaultOptions = {
        // Example defaults - adjust as needed for the project
        dateStyle: 'short',
        timeStyle: 'short'
        // year: 'numeric',
        // month: 'short',
        // day: 'numeric'
    };
    const mergedOptions = { ...defaultOptions, ...options };
    const lang = getState('currentLanguage') || 'en';

    try {
        return new Intl.DateTimeFormat(lang, mergedOptions).format(dateObj);
    } catch (error) {
        console.error(`Error formatting date ${date} with lang ${lang}:`, error);
        try {
             // Attempt simpler ISO format as fallback
            return dateObj.toISOString();
        } catch { 
            return fallback; // Final fallback
        } 
    }
}

// Add more specific formatters as needed (e.g., currency, rank) 