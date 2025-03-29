/**
 * dataLoader.js
 *
 * Description: Handles fetching and parsing data (CSV, JSON) for the application.
 * Usage:
 *  import { loadAllData } from './dataLoader';
 *  const { playerData, rulesData, lastUpdated } = await loadAllData();
 */

import Papa from 'papaparse';
import { DATA_PATH, RULES_PATH } from '../config';
import { setStatus } from '../utils/helpers'; // Assuming setStatus is moved to helpers
import { getText } from './i18n'; // Assuming getText is in i18n

/**
 * Fetches and parses a CSV file from the specified path.
 *
 * @param {string} path - The path to the CSV file.
 * @param {string} dataType - A description of the data being loaded (for logging/errors).
 * @returns {Promise<{data: Array<object>, headers: Array<string>}>} - A promise that resolves with the parsed data and headers.
 * @throws {Error} If fetching or parsing fails.
 */
async function loadCsvData(path, dataType) {
    setStatus(getText('status.loadingFile', { 0: dataType }), 'info');
    console.log(`Fetching ${dataType} from: ${path}`);
    try {
        const response = await fetch(path, { cache: "no-store" }); // Prevent caching
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} while fetching ${dataType}`);
        }
        const csvText = await response.text();
        console.log(`${dataType} text length:`, csvText.length);

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: 'greedy',
                dynamicTyping: true,
                transformHeader: header => header.trim(), // Trim header whitespace
                complete: (results) => {
                    if (results.errors.length) {
                        console.error(`Errors parsing ${dataType}:`, results.errors);
                        // Try to return data even with errors, but warn
                        // reject(new Error(`Error parsing ${dataType}: ${results.errors[0].message}`));
                        setStatus(getText('status.parseWarning', { 0: dataType }), 'warning');
                    }
                    if (!results.data || results.data.length === 0) {
                        console.warn(`${dataType} parsed data is empty.`);
                         // Reject only if absolutely no data
                         // reject(new Error(`No data found after parsing ${dataType}`));
                    }
                     // Filter out rows that are completely empty or only contain null/empty string values
                    const cleanedData = results.data.filter(row => 
                        row && Object.values(row).some(value => value !== null && value !== '')
                    );
                    console.log(`Parsed ${dataType} - Headers:`, results.meta.fields);
                    console.log(`Parsed ${dataType} - Rows (initial):`, results.data.length);
                    console.log(`Parsed ${dataType} - Rows (cleaned):`, cleanedData.length);
                    resolve({ data: cleanedData, headers: results.meta.fields || [] });
                },
                error: (error) => {
                    console.error(`PapaParse error for ${dataType}:`, error);
                    reject(new Error(`Failed to parse ${dataType}: ${error.message}`));
                }
            });
        });
    } catch (error) {
        console.error(`Failed to load or parse ${dataType} from ${path}:`, error);
        setStatus(getText('status.loadError', { 0: dataType }), 'error');
        throw error; // Re-throw the error to be caught by the caller
    }
}

/**
 * Fetches the last modified date of the data file.
 *
 * @param {string} path - The path to the data file.
 * @returns {Promise<Date|null>} - A promise that resolves with the last modified date or null.
 */
async function fetchLastUpdated(path) {
    try {
        const response = await fetch(path, { method: 'HEAD', cache: "no-store" });
        if (response.ok) {
            const lastModifiedHeader = response.headers.get('Last-Modified');
            if (lastModifiedHeader) {
                console.log("Last-Modified header:", lastModifiedHeader);
                return new Date(lastModifiedHeader);
            }
        }
        console.warn('Could not retrieve Last-Modified header for data file.');
        return null;
    } catch (error) {
        console.error('Error fetching Last-Modified date:', error);
        return null;
    }
}

/**
 * Loads both player data and score rules concurrently.
 *
 * @returns {Promise<{playerData: Array<object>, allHeaders: Array<string>, rulesData: Array<object>, lastUpdated: Date|null}>} An object containing the loaded data.
 * @throws {Error} If any critical data fails to load.
 */
export async function loadAllData() {
    setStatus(getText('status.loadingAllData'), 'info');
    try {
        const [playerResult, rulesResult, lastUpdated] = await Promise.all([
            loadCsvData(DATA_PATH, 'Player Data'),
            loadCsvData(RULES_PATH, 'Score Rules'),
            fetchLastUpdated(DATA_PATH)
        ]);

        if (!playerResult || !playerResult.data || playerResult.data.length === 0) {
            throw new Error('Critical error: Player data could not be loaded or is empty.');
        }
        if (!rulesResult || !rulesResult.data || rulesResult.data.length === 0) {
             console.warn('Score rules could not be loaded or are empty. Proceeding without rules.');
            // throw new Error('Critical error: Score rules could not be loaded or are empty.');
        }

        setStatus(getText('status.dataLoaded'), 'success', 1500);
        return {
            playerData: playerResult.data,
            allHeaders: playerResult.headers,
            rulesData: rulesResult ? rulesResult.data : [], // Return empty array if rules failed
            lastUpdated: lastUpdated
        };
    } catch (error) {
        console.error("Error loading initial data:", error);
        setStatus(getText('status.dataLoadError', {0: DATA_PATH}), 'error');
        // Depending on the app's requirements, you might want to display an error
        // state to the user or try to continue with partial data.
        // For now, re-throw to indicate failure.
        throw error;
    }
} 