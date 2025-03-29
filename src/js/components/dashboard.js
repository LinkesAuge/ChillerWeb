/**
 * dashboard.js
 *
 * Description: Handles rendering the main dashboard view, including stats cards,
 *              ranking table, and overview charts.
 * Usage:
 *     import { initializeDashboard } from './components/dashboard.js';
 *     initializeDashboard(); // Call once on app load to setup
 */

import { getState } from '../core/state.js';
import { getTranslation } from '../core/i18n.js';
import { $, $$ } from '../utils/dom.js'; // Assuming simple DOM selection needed
import { formatNumber } from '../utils/formatters.js';
// Import other components/modules if needed (e.g., chart rendering, table rendering)
// import { renderRankingTable } from './rankingTable.js';
// import { renderOverviewCharts } from './charts.js';

// --- Constants for Selectors ---
const STATS_CARD_CONTAINER_SELECTOR = '#dashboard-stats-cards';
const PLAYER_COUNT_SELECTOR = '#stats-player-count';
const AVG_SCORE_SELECTOR = '#stats-avg-score';
// Add selectors for other stats cards if they exist

/**
 * Updates the summary statistics cards on the dashboard.
 *
 * Args:
 *     playersData (array): Array of player data objects to calculate stats from.
 */
function updateStatsCards(playersData) {
    const container = $(STATS_CARD_CONTAINER_SELECTOR);
    if (!container) {
        console.warn("Dashboard: Stats card container not found.");
        return;
    }

    const playerCount = playersData.length;
    const totalScore = playersData.reduce((sum, player) => sum + (player.Gesamtwertung || 0), 0);
    const avgScore = playerCount > 0 ? totalScore / playerCount : 0;

    const playerCountEl = $(PLAYER_COUNT_SELECTOR, container);
    const avgScoreEl = $(AVG_SCORE_SELECTOR, container);

    if (playerCountEl) {
        playerCountEl.textContent = formatNumber(playerCount, { maximumFractionDigits: 0 });
    } else {
        console.warn("Dashboard: Player count element not found.");
    }

    if (avgScoreEl) {
        avgScoreEl.textContent = formatNumber(avgScore, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    } else {
        console.warn("Dashboard: Average score element not found.");
    }

    // Update other stats cards...
}

/**
 * Renders the full dashboard view.
 * This might involve calling functions to render different parts (stats, table, charts).
 *
 * Args:
 *     processedData (array): The processed player data to display.
 *     filteredData (array): The currently filtered/sorted data (might be the same initially).
 */
export function renderDashboard(processedData, filteredData) {
    console.log("Rendering dashboard...");
    const dashboardView = $('[data-view="dashboard"]');
    if (!dashboardView) {
        console.error("Dashboard view container not found!");
        return;
    }

    // 1. Update Stats Cards using the *overall* processed data
    updateStatsCards(processedData);

    // 2. Render Ranking Table using the *currently filtered/sorted* data
    // renderRankingTable(filteredData); // TODO: Implement and call table rendering
    console.log("TODO: Render Ranking Table with", filteredData.length, "players");

    // 3. Render Overview Charts using the *currently filtered/sorted* data
    // renderOverviewCharts(filteredData); // TODO: Implement and call chart rendering
    console.log("TODO: Render Overview Charts");

    console.log("Dashboard rendering complete (placeholders for table/charts).");
}

/**
 * Initializes the dashboard component.
 * Might involve setting up event listeners specific to the dashboard if any.
 * Currently, the main rendering is triggered by navigation.
 */
export function initializeDashboard() {
    console.log("Initializing dashboard component...");
    // Add any dashboard-specific setup here if needed
    // e.g., listeners for dashboard-only controls
    console.log("Dashboard component initialized.");
}

// Initial call to setup (if needed)
// initializeDashboard(); 