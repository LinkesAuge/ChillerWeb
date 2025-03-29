/**
 * chartsView.js
 *
 * Description: Handles rendering logic for the dedicated Charts view.
 * Usage:
 *  import { renderChartsView } from './chartsView';
 *  renderChartsView(playerData);
 */

import { elements } from '../core/domElements';
import { 
    renderTopSourcesChart,
    renderScoreDistributionChart,
    renderScoreVsChestsChart,
    renderFrequentSourcesChart
} from '../components/chartManager';
import { getText } from '../core/i18n';

/**
 * Renders all charts within the dedicated charts view.
 *
 * @param {Array<object>} allPlayersData - All processed player data.
 */
export function renderChartsView(allPlayersData) {
    console.log('Rendering Charts View...');
    if (!elements.chartsSection) {
        console.error("Charts section container not found!");
        return;
    }

    // Check if data is available
    if (!allPlayersData || allPlayersData.length === 0) {
        elements.chartsSection.innerHTML = `
            <h2 class="text-xl font-semibold font-serif text-amber-300 border-l-4 border-primary pl-4" data-i18n-key="charts.title">Charts Overview</h2>
            <p class="text-center text-slate-400 py-10">${getText('table.noData')}</p>`;
        // TODO: Ensure i18n keys are updated if needed using updateUIText()
        return;
    }

    // Assuming the basic structure is already in index.html or created dynamically if needed.
    // We just need to render the charts into their containers.

     if (elements.chartsTopSourcesContainer) {
         renderTopSourcesChart(
            elements.chartsTopSourcesContainer.id,
            'chartsTopSources', // Unique key for this instance
            allPlayersData
         );
     }
     if (elements.chartsDistributionContainer) {
         renderScoreDistributionChart(
            elements.chartsDistributionContainer.id,
            'chartsDistribution', // Unique key
            allPlayersData
         );
     }
     if (elements.chartsScoreVsChestsContainer) {
         renderScoreVsChestsChart(
            elements.chartsScoreVsChestsContainer.id,
            'chartsScoreVsChests', // Unique key
            allPlayersData
         );
     }
     if (elements.chartsFrequentSourcesContainer) {
         renderFrequentSourcesChart(
            elements.chartsFrequentSourcesContainer.id,
            'chartsFrequentSources', // Unique key
            allPlayersData
         );
     }

    console.log('Charts View rendering complete.');
} 