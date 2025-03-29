/**
 * domElements.js
 *
 * Description: Centralized object to hold references to frequently accessed DOM elements.
 * Usage:
 *  import { elements } from './domElements';
 *  elements.statusMessage.textContent = 'Loading...';
 */

// Helper function to get elements by ID
const getElement = (id) => document.getElementById(id);

// Object to store element references
export const elements = {
    // Status & Loading
    statusArea: getElement('status-area'),
    loadingSpinner: getElement('loading-spinner'),
    statusMessage: getElement('status-message'),
    lastUpdatedInfo: getElement('last-updated-info'),

    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    breadcrumbNav: getElement('breadcrumb-nav'),
    breadcrumbCurrentPageItem: getElement('breadcrumb-current-page-item'),
    breadcrumbCurrentPageName: getElement('breadcrumb-current-page-name'),

    // Language
    langDeButton: getElement('lang-de'),
    langEnButton: getElement('lang-en'),

    // Downloads
    downloadCsvHeaderButton: getElement('download-csv-header-button'),
    downloadCsvPlayerButton: getElement('download-csv-player-button'),
    downloadJsonPlayerButton: getElement('download-json-player-button'),

    // View Containers
    emptyStateSection: getElement('empty-state-section'),
    dashboardSection: getElement('dashboard-section'),
    detailedTableSection: getElement('detailed-table-section'),
    chartsSection: getElement('charts-section'),
    analyticsSection: getElement('analytics-section'),
    scoreSystemSection: getElement('score-system-section'),
    playerDetailSection: getElement('player-detail-section'),

    // Dashboard Specific
    statTotalPlayers: getElement('stat-total-players'),
    statTotalScore: getElement('stat-total-score'),
    statTotalChests: getElement('stat-total-chests'),
    statAvgScore: getElement('stat-avg-score'),
    statAvgChests: getElement('stat-avg-chests'),
    filterInput: getElement('filter-input'),
    rankingSection: getElement('ranking-section'),
    rankingTableBody: getElement('ranking-table-body'),
    topChestsTableBody: getElement('top-chests-table-body'),
    dashboardTopSourcesChartContainer: getElement('top-sources-chart-container'), // Renamed for clarity
    dashboardDistributionChartContainer: getElement('score-distribution-chart-container'), // Renamed for clarity
    dashboardScoreVsChestsChartContainer: getElement('score-vs-chests-chart-container'), // Renamed for clarity
    dashboardFrequentSourcesChartContainer: getElement('frequent-sources-chart-container'), // Renamed for clarity

    // Detailed Table Specific
    detailedTableContainer: getElement('detailed-table-container'),
    detailedTableBody: getElement('detailed-table-body'),
    detailedTableHeader: getElement('detailed-table-header'),
    playerSearchInput: getElement('player-search-input'),
    columnToggleButtonContainer: getElement('column-toggle-button-container'),

    // Charts View Specific
    chartsTopSourcesContainer: getElement('charts-top-sources-container'),
    chartsDistributionContainer: getElement('charts-distribution-container'),
    chartsScoreVsChestsContainer: getElement('charts-score-vs-chests-container'),
    chartsFrequentSourcesContainer: getElement('charts-frequent-sources-container'),

    // Analytics Specific
    categorySelect: getElement('category-select'),
    categoryPrompt: getElement('category-prompt'),
    categoryAnalysisContent: getElement('category-analysis-content'),
    categoryNameTable: getElement('category-name-table'),
    categoryRankingBody: getElement('category-ranking-body'),
    categoryNameChart: getElement('category-name-chart'),
    categoryChartContainer: getElement('category-chart-container'),

    // Score System Specific
    scoreRulesTableContainer: getElement('score-rules-table-container'),
    scoreRulesTableBody: getElement('score-rules-table-body'),

    // Player Detail Specific
    playerDetailName: getElement('player-detail-name'),
    playerDetailBackButton: getElement('player-detail-back-button'),
    playerStatsContainer: getElement('player-stats-container'),
    playerChartContainer: getElement('player-chart-container'),

    // Chart Modal
    chartModal: getElement('chart-modal'),
    modalChartTitle: getElement('modal-chart-title'),
    modalChartContainer: getElement('modal-chart-container'),
    modalCloseButton: getElement('modal-close-button'),

    // Add other frequently used elements here
};

// Function to re-query elements if the DOM changes significantly (e.g., view switching)
// export function refreshElements() {
//     Object.keys(elements).forEach(key => {
//         const element = elements[key];
//         if (element instanceof NodeList) {
//             // Re-query NodeLists based on their selector (if stored or inferred)
//             // This is complex and might not be needed if elements are stable within views
//         } else if (element instanceof HTMLElement && element.id) {
//             elements[key] = document.getElementById(element.id);
//         }
//     });
// } 