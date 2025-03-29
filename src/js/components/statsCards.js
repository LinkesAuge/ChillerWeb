/**
 * statsCards.js
 *
 * Description: Updates the summary statistics cards on the dashboard.
 * Usage:
 *  import { updateStatsCards } from './statsCards';
 *  updateStatsCards(playerData);
 */

import { elements } from '../core/domElements';
import { getText } from '../core/i18n';
import { NUMERIC_FORMATTER } from '../utils/helpers';

/**
 * Calculates and updates the dashboard statistics cards.
 *
 * @param {Array<object>} playersData - The processed player data.
 */
export function updateStatsCards(playersData) {
    console.log("Updating stats cards...");
    if (!playersData || playersData.length === 0) {
        console.warn('No player data available to update stats cards.');
        // Set default values or hide cards if no data
        if(elements.statTotalPlayers) elements.statTotalPlayers.textContent = '-';
        if(elements.statTotalScore) elements.statTotalScore.textContent = '-';
        if(elements.statTotalChests) elements.statTotalChests.textContent = '-';
        if(elements.statAvgScore) elements.statAvgScore.textContent = '-';
        if(elements.statAvgChests) elements.statAvgChests.textContent = '-';
        return;
    }

    const totalPlayers = playersData.length;
    const totalScore = playersData.reduce((sum, p) => sum + (p.TOTAL_SCORE || 0), 0);
    const totalChests = playersData.reduce((sum, p) => sum + (p.CHEST_COUNT || 0), 0);
    const avgScore = totalPlayers > 0 ? totalScore / totalPlayers : 0;
    const avgChests = totalPlayers > 0 ? totalChests / totalPlayers : 0;

    if(elements.statTotalPlayers) elements.statTotalPlayers.textContent = NUMERIC_FORMATTER.format(totalPlayers);
    if(elements.statTotalScore) elements.statTotalScore.textContent = NUMERIC_FORMATTER.format(totalScore);
    if(elements.statTotalChests) elements.statTotalChests.textContent = NUMERIC_FORMATTER.format(totalChests);
    if(elements.statAvgScore) elements.statAvgScore.textContent = NUMERIC_FORMATTER.format(avgScore);
    if(elements.statAvgChests) elements.statAvgChests.textContent = NUMERIC_FORMATTER.format(avgChests);

    console.log("Stats cards updated.");
} 