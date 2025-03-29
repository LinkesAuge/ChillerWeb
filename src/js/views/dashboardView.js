/**
 * dashboardView.js
 *
 * Description: Handles rendering logic specific to the Dashboard view.
 * Usage:
 *  import { renderDashboard } from './dashboardView';
 *  renderDashboard(playerData, filteredData);
 */

import { elements } from '../core/domElements';
import { state } from '../state';
import { updateStatsCards } from '../components/statsCards';
import { renderRankingTable, renderTopChestsTable } from '../components/tableManager';
import { 
    renderTopSourcesChart,
    renderScoreDistributionChart,
    renderScoreVsChestsChart,
    renderFrequentSourcesChart
} from '../components/chartManager';
import { getText } from '../core/i18n';

/**
 * Renders all components within the dashboard view.
 *
 * @param {Array<object>} allPlayersData - All processed player data.
 * @param {Array<object>} filteredPlayersData - Data filtered by the search input.
 */
export function renderDashboard(allPlayersData, filteredPlayersData) {
    console.log("Rendering Dashboard View...");
    if (!elements.dashboardSection) {
        console.error("Dashboard section element not found!");
        return;
    }

    // 1. Update Stats Cards
    updateStatsCards(allPlayersData);

    // 2. Render Ranking Table (using filtered data)
    renderRankingTable(filteredPlayersData);

    // 3. Render Top Chests Widget (using all data)
    renderTopChestsTable(allPlayersData);

    // 4. Render Dashboard Charts (using all data)
    // Ensure container IDs match the ones expected by chartManager
    if (elements.dashboardTopSourcesChartContainer) {
         renderTopSourcesChart(
            elements.dashboardTopSourcesChartContainer.id,
            'dashboardTopSources',
            allPlayersData
         );
    }
     if (elements.dashboardDistributionChartContainer) {
        renderScoreDistributionChart(
            elements.dashboardDistributionChartContainer.id,
            'dashboardDistribution',
            allPlayersData
         );
     }
     if (elements.dashboardScoreVsChestsChartContainer) {
         renderScoreVsChestsChart(
            elements.dashboardScoreVsChestsChartContainer.id,
            'dashboardScoreVsChests',
            allPlayersData
         );
     }
     if (elements.dashboardFrequentSourcesChartContainer) {
         renderFrequentSourcesChart(
            elements.dashboardFrequentSourcesChartContainer.id,
            'dashboardFrequentSources',
            allPlayersData
         );
     }

    console.log("Dashboard View rendering complete.");
} 