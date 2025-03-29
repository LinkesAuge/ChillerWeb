/**
 * api.js
 *
 * Description: Handles fetching and parsing data from external sources (CSV files).
 * Usage:
 *     import { loadData } from './core/api.js';
 *     const { playerData, scoreRules } = await loadData();
 */

import Papa from 'papaparse'; // Import PapaParse library
import { setState } from './state.js'; // Import setState to update the application state

/**
 * Parses CSV data fetched via PapaParse.
 *
 * Args:
 *     url (string): The URL of the CSV file to fetch and parse.
 *     config (object): Configuration options for PapaParse.
 *
 * Returns:
 *     Promise<object>: A promise that resolves with the parsed data object { data: [], errors: [], meta: {} }
 *                      or rejects with an error if fetching/parsing fails critically.
 */
function parseCSV(url, config) {
    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            ...config,
            download: true, // Essential for fetching files via URL
            complete: (results) => {
                if (results.errors && results.errors.length > 0) {
                    console.warn(`PapaParse encountered errors parsing ${url}:`, results.errors);
                    // Decide if errors are critical. Often, PapaParse recovers.
                    // If specific errors should halt execution, reject here.
                }
                if (results.data) {
                    // console.log(`Successfully parsed ${url}:`, results.data.length, "rows");
                    resolve(results); // Resolve with the full results object
                } else {
                    // This case might indicate a more severe issue
                    reject(new Error(`PapaParse failed to return data for ${url}. Meta: ${JSON.stringify(results.meta)}`));
                }
            },
            error: (error) => {
                // This error usually relates to fetching the file or critical parse issues
                console.error(`PapaParse critical error parsing ${url}:`, error);
                reject(new Error(`Failed to fetch or parse ${url}: ${error.message}`));
            }
        });
    });
}

/**
 * Fetches and parses both player data and score rules CSV files.
 *
 * Returns:
 *     Promise<object>: A promise that resolves with an object containing:
 *                      - playerData: Array of player data objects.
 *                      - scoreRules: Object representing score rules.
 *                      Rejects if either file fails to load/parse critically.
 */
export async function loadData() {
    console.log("Attempting to load data and rules CSV files...");
    const dataUrl = '/data/data.csv'; // Path relative to the public directory
    const rulesUrl = '/data/rules.csv'; // Path relative to the public directory

    const dataConfig = {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true // Automatically convert numbers, booleans
    };

    const rulesConfig = {
        header: true,
        skipEmptyLines: true,
    };

    const [dataResult, rulesResult] = await Promise.allSettled([
        parseCSV(dataUrl, dataConfig),
        parseCSV(rulesUrl, rulesConfig)
    ]);

    // Check results
    if (dataResult.status === 'rejected') {
        throw new Error(`Failed to load player data: ${dataResult.reason}`);
    }
    if (rulesResult.status === 'rejected') {
        throw new Error(`Failed to load score rules: ${rulesResult.reason}`);
    }

    const playerData = dataResult.value.data;
    const rawRules = rulesResult.value.data;

    // Transform rules array into an object for easier lookup
    const scoreRules = rawRules.reduce((acc, rule) => {
        if (rule.Key && rule.Value !== undefined && rule.Value !== null) {
            // Convert numeric values if possible, otherwise keep as string
            const numValue = Number(rule.Value);
            acc[rule.Key] = isNaN(numValue) ? rule.Value : numValue;
        }
        return acc;
    }, {});

    const timestamp = new Date();
    console.log("Data and rules loaded successfully at:", timestamp);

    // Update state
    setState('allPlayersData', playerData);
    setState('scoreRules', scoreRules);
    setState('lastDataUpdate', timestamp);

    return { playerData, scoreRules };
} 