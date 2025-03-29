/**
 * analyticsView.js
 *
 * Description: Handles rendering and interaction logic for the Analytics view.
 * Usage:
 *  import { renderAnalyticsView, setupAnalyticsListeners } from './analyticsView';
 *  renderAnalyticsView(allPlayersData, allHeaders);
 *  setupAnalyticsListeners();
 */

import { elements } from '../core/domElements';
import { state, updateState } from '../state';
import { renderCategoryChart } from '../components/chartManager';
import { renderCategoryRankingTable } from '../components/tableManager';
import { CORE_COLUMNS } from '../config';
import { getText } from '../core/i18n';
import { setStatus } from '../utils/helpers';

/**
 * Populates the category selection dropdown.
 *
 * @param {Array<string>} allHeaders - All available column headers.
 */
function populateCategorySelect(allHeaders) {
    if (!elements.categorySelect) return;

    const select = elements.categorySelect;
    // Clear existing options except the default placeholder
    select.innerHTML = `<option value="" data-i18n-key="analytics.selectCategoryPrompt">${getText('analytics.selectCategoryPrompt')}</option>`;

    const fragment = document.createDocumentFragment();
    const sortedCategories = allHeaders
        .filter(header => header && !CORE_COLUMNS.includes(header))
        .sort((a, b) => a.localeCompare(b)); // Sort alphabetically

    sortedCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.replace(/_/g, ' '); // Make it readable
        fragment.appendChild(option);
    });

    select.appendChild(fragment);
    console.log("Category select populated.");
}

/**
 * Renders the content of the category analysis section (table and chart).
 *
 * @param {string} category - The selected category key.
 */
function renderCategoryAnalysisContent(category) {
    console.log(`Rendering analysis content for category: ${category}`);
    if (!elements.categoryAnalysisContent || !elements.categoryNameTable || !elements.categoryNameChart || !elements.categoryRankingBody || !elements.categoryChartContainer) {
        console.error('Required elements for category analysis not found.');
        return;
    }

    const readableCategory = category.replace(/_/g, ' ');
    elements.categoryNameTable.textContent = readableCategory;
    elements.categoryNameChart.textContent = readableCategory;

    try {
        const categoryData = state.allPlayersData
            .filter(player => player.hasOwnProperty(category) && typeof player[category] === 'number' && player[category] > 0)
            .sort((a, b) => (b[category] ?? 0) - (a[category] ?? 0));

        // Render Table
        renderCategoryRankingTable(categoryData, category);

        // Render Chart
        renderCategoryChart(
            elements.categoryChartContainer.id,
            'analyticsCategory', // Unique key
            state.allPlayersData, // Pass all data for context if needed, though chart might only use filtered
            category
        );

        elements.categoryPrompt.classList.add('hidden');
        elements.categoryAnalysisContent.classList.remove('hidden');
        console.log("Finished rendering category analysis content.");

    } catch (error) {
        console.error("Error rendering category analysis content:", error);
        setStatus(getText('status.renderError'), 'error', 5000);
        // Display error state in the UI
        elements.categoryRankingBody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-red-500">${getText('status.renderError')}</td></tr>`;
        if (elements.categoryChartContainer) elements.categoryChartContainer.innerHTML = `<p class="text-center py-8 text-red-500">${getText('status.chartError')}</p>`;
        elements.categoryAnalysisContent.classList.remove('hidden');
        elements.categoryPrompt.classList.add('hidden');
    }
}

/**
 * Handles the change event on the category select dropdown.
 *
 * @param {Event} event - The change event object.
 */
function handleCategorySelectChange(event) {
    const selectedCategory = event.target.value;
    updateState({ selectedCategory: selectedCategory }); // Update state

    if (selectedCategory) {
        console.log(`Category selected: ${selectedCategory}`);
        renderCategoryAnalysisContent(selectedCategory);
    } else {
        console.log("No category selected (placeholder selected).");
        // Reset view to prompt
        if (elements.categoryAnalysisContent) elements.categoryAnalysisContent.classList.add('hidden');
        if (elements.categoryPrompt) elements.categoryPrompt.classList.remove('hidden');
        // Optionally destroy the category chart instance
        // destroyChart('analyticsCategory');
    }
}

/**
 * Initial setup for the Analytics view, populating the dropdown.
 *
 * @param {Array<string>} allHeaders - All available column headers.
 */
export function renderAnalyticsView(allHeaders) {
    console.log("Initializing Analytics View...");
    if (!elements.analyticsSection) {
        console.error("Analytics section element not found!");
        return;
    }
    populateCategorySelect(allHeaders);
    // Ensure the initial state shows the prompt
    if (elements.categoryAnalysisContent) elements.categoryAnalysisContent.classList.add('hidden');
    if (elements.categoryPrompt) elements.categoryPrompt.classList.remove('hidden');
    console.log("Analytics View initialized.");
}

/**
 * Sets up event listeners specific to the Analytics view.
 */
export function setupAnalyticsListeners() {
    if (elements.categorySelect && !elements.categorySelect.hasAttribute('data-listener-added')) {
        elements.categorySelect.addEventListener('change', handleCategorySelectChange);
        elements.categorySelect.setAttribute('data-listener-added', 'true');
        console.log("Category select listener added.");
    }
} 