/**
 * dataProcessor.js
 *
 * Description: Handles processing and transforming the loaded data, including score calculation.
 * Usage:
 *  import { processPlayerData } from './dataProcessor';
 *  const processedData = processPlayerData(rawData, scoreRules);
 */

import { CORE_COLUMNS } from '../config';

/**
 * Calculates the total score and chest count for a single player based on rules.
 *
 * @param {object} player - The player data object.
 * @param {Array<object>} scoreRules - The array of score rules { Category, Score_Per_Unit }.
 * @returns {{totalScore: number, chestCount: number}} - The calculated total score and chest count.
 */
function calculatePlayerScores(player, scoreRules) {
    let totalScore = 0;
    let chestCount = 0;
    const safeRules = Array.isArray(scoreRules) ? scoreRules : [];

    // Create a map for faster rule lookup
    const ruleMap = new Map(safeRules.map(rule => [rule.Category, rule.Score_Per_Unit]));

    for (const category in player) {
        // Ensure the category is not a core column and the value is a number
        if (!CORE_COLUMNS.includes(category) && typeof player[category] === 'number') {
            const value = player[category];
            // Chest count is the sum of all numerical category values
            chestCount += value;
            // Look up the score rule for this category
            const scorePerUnit = ruleMap.get(category);
            if (typeof scorePerUnit === 'number') {
                totalScore += value * scorePerUnit;
            }
        }
    }
    return { totalScore, chestCount };
}

/**
 * Processes the raw player data: calculates scores, chest counts, and cleans data.
 *
 * @param {Array<object>} rawData - The raw player data from the CSV.
 * @param {Array<object>} scoreRules - The score rules data from the CSV.
 * @returns {Array<object>} The processed player data with TOTAL_SCORE and CHEST_COUNT.
 */
export function processPlayerData(rawData, scoreRules) {
    console.log(`Processing ${rawData.length} players with ${scoreRules?.length ?? 0} rules.`);
    if (!Array.isArray(rawData)) {
        console.error('Invalid rawData provided to processPlayerData', rawData);
        return [];
    }

    const processedData = rawData.map(player => {
        if (!player || typeof player !== 'object') {
            console.warn('Skipping invalid player data:', player);
            return null; // Skip invalid entries
        }
        // Ensure PLAYER field exists and is treated as a string
        const playerName = String(player.PLAYER || 'Unknown Player').trim();
        if (!playerName || playerName === 'Unknown Player') {
            console.warn('Skipping player data with missing or invalid name:', player);
            return null;
        }

        const { totalScore, chestCount } = calculatePlayerScores(player, scoreRules);

        // Create a new object with calculated fields and existing data
        const processedPlayer = {
            ...player,
            PLAYER: playerName,
            TOTAL_SCORE: totalScore,
            CHEST_COUNT: chestCount,
        };

        // Optionally clean up: ensure all category values are numbers or null
        Object.keys(processedPlayer).forEach(key => {
            if (!CORE_COLUMNS.includes(key) && typeof processedPlayer[key] !== 'number') {
                // If it's not a number, attempt conversion, else set null/0?
                const numValue = Number(processedPlayer[key]);
                processedPlayer[key] = isNaN(numValue) ? 0 : numValue; // Or null, depending on desired handling
            }
        });

        return processedPlayer;
    }).filter(player => player !== null); // Filter out any skipped invalid entries

    console.log(`Finished processing. ${processedData.length} players remain.`);
    return processedData;
}

/**
 * Filters and sorts the processed player data based on current state.
 *
 * @param {Array<object>} players - The processed player data.
 * @param {string} filterText - The text to filter player names by.
 * @param {{column: string, direction: string}} sortConfig - The sorting configuration.
 * @returns {Array<object>} The filtered and sorted player data.
 */
export function filterAndSortData(players, filterText, sortConfig) {
    const lowerFilter = filterText.toLowerCase();

    const filtered = players.filter(player =>
        player.PLAYER.toLowerCase().includes(lowerFilter)
    );

    const { column, direction } = sortConfig;
    const sorted = [...filtered].sort((a, b) => {
        const valA = a[column] ?? (typeof a[column] === 'string' ? '' : 0);
        const valB = b[column] ?? (typeof b[column] === 'string' ? '' : 0);

        if (typeof valA === 'string' && typeof valB === 'string') {
            return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            // Treat null/undefined as 0 for numerical sort
            const numA = Number(valA) || 0;
            const numB = Number(valB) || 0;
            return direction === 'asc' ? numA - numB : numB - numA;
        }
    });

    return sorted;
} 