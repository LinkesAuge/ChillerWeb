/**
 * modalManager.js
 *
 * Description: Handles the logic for the chart modal popup.
 * Usage:
 *  import { initModal } from './modalManager';
 *  initModal(chartRenderFunctions); // Pass functions to render charts in the modal
 */

import { elements } from '../core/domElements';
import { getText } from '../core/i18n';
import { state } from '../state';
import { 
    renderTopSourcesChart,
    renderScoreDistributionChart,
    renderScoreVsChestsChart,
    renderFrequentSourcesChart,
    renderPlayerChart,
    renderCategoryChart,
    destroyChart // Assuming destroyChart is exposed or handled internally
} from './chartManager';

/**
 * Initializes the chart modal, setting up event listeners for opening and closing.
 * It requires the chart rendering functions to be passed in.
 *
 * @param {object} chartRenderers - An object containing functions to render specific charts.
 *                                  Example: { topSources: renderTopSourcesChart, ... }
 */
export function initModal() {
    if (!elements.chartModal || !elements.modalCloseButton) {
        console.error('Modal elements not found. Cannot initialize modal.');
        return;
    }

    // Add event listeners to all chart expand buttons (using event delegation)
    document.body.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-chart-type]');
        if (button) {
            handleExpandChartClick(button.dataset.chartType);
        }
    });

    // Add event listener for the close button
    elements.modalCloseButton.addEventListener('click', handleModalClose);

    // Add event listener for clicking outside the modal content to close
    elements.chartModal.addEventListener('click', (event) => {
        if (event.target === elements.chartModal) { // Check if the click is on the backdrop
            handleModalClose();
        }
    });

    // Add event listener for the Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !elements.chartModal.classList.contains('hidden')) {
            handleModalClose();
        }
    });

    console.log('Chart modal initialized.');
}

/**
 * Handles the click event on an expand chart button.
 *
 * @param {string} chartType - The type of chart to display in the modal.
 */
function handleExpandChartClick(chartType) {
    console.log(`Expanding chart: ${chartType}`);
    if (!elements.chartModal || !elements.modalChartTitle || !elements.modalChartContainer) return;

    let titleKey = '';
    const modalContainerId = elements.modalChartContainer.id;
    const modalInstanceKey = 'modal';

    // Prepare container and destroy previous chart
     elements.modalChartContainer.innerHTML = '<div class="spinner mx-auto my-8"></div>';
     destroyChart(modalInstanceKey); // Use chartManager's destroy function

    if (state.allPlayersData.length === 0) {
        elements.modalChartContainer.innerHTML = `<p class="text-center text-slate-400">${getText('table.noData')}</p>`;
        titleKey = 'Chart'; // Generic title
    } else {
        // Determine which chart to render based on type
        switch (chartType) {
            case 'topSources':
                titleKey = 'dashboard.chartTopSourcesTitle';
                renderTopSourcesChart(modalContainerId, modalInstanceKey, state.allPlayersData);
                break;
            case 'scoreDistribution':
                titleKey = 'dashboard.chartScoreDistTitle';
                renderScoreDistributionChart(modalContainerId, modalInstanceKey, state.allPlayersData);
                break;
            case 'scoreVsChests':
                titleKey = 'dashboard.chartScoreVsChestsTitle';
                renderScoreVsChestsChart(modalContainerId, modalInstanceKey, state.allPlayersData);
                break;
            case 'frequentSources':
                titleKey = 'dashboard.chartFreqSourcesTitle';
                renderFrequentSourcesChart(modalContainerId, modalInstanceKey, state.allPlayersData);
                break;
            case 'player': // Assumes state.selectedPlayer holds the current player data
                titleKey = 'playerDetail.chartTitle';
                 if (state.selectedPlayer) {
                     renderPlayerChart(modalContainerId, modalInstanceKey, state.selectedPlayer);
                 } else {
                     elements.modalChartContainer.innerHTML = `<p class="text-center text-slate-400">${getText('status.noPlayerData')}</p>`;
                 }
                 break;
            case 'category': // Assumes state.selectedCategory holds the current category
                 titleKey = 'analytics.categoryChartTitle';
                 if (state.selectedCategory) {
                     renderCategoryChart(modalContainerId, modalInstanceKey, state.allPlayersData, state.selectedCategory);
                 } else {
                     elements.modalChartContainer.innerHTML = `<p class="text-center text-slate-400">${getText('analytics.selectCategoryPrompt')}</p>`;
                 }
                 break;
            default:
                console.error(`Unknown chart type for expand: ${chartType}`);
                elements.modalChartContainer.innerHTML = `<p class="text-center text-red-500">Unknown chart type.</p>`;
                titleKey = 'Error';
        }
    }

    // Update title and show modal
    elements.modalChartTitle.textContent = getText(titleKey || 'Chart');
    elements.chartModal.classList.remove('hidden');
    // Focus the close button for accessibility
     elements.modalCloseButton.focus();
}

/**
 * Handles closing the modal.
 */
function handleModalClose() {
    console.log("Closing chart modal");
    if (!elements.chartModal || !elements.modalChartContainer) return;

    destroyChart('modal'); // Destroy the modal chart instance
    elements.modalChartContainer.innerHTML = ''; // Clear content
    elements.chartModal.classList.add('hidden');
} 