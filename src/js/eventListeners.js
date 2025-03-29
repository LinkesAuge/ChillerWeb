/**
 * eventListeners.js
 *
 * Description: Sets up all global event listeners for the application.
 * Handles user interactions like navigation, filtering, sorting, theme switching, etc.
 * Usage:
 *  import { setupEventListeners } from './eventListeners';
 *  setupEventListeners(); // Call once after initial DOM setup
 */

import { elements } from './core/domElements';
import { state, updateState } from './state';
import { showView, toggleTheme } from './core/uiManager';
import { loadLanguage, updateUIText, getText } from './core/i18n';
import { filterAndSortData } from './core/dataProcessor';
import { renderDashboard } from './views/dashboardView';
import { renderDetailedView } from './views/detailedTableView';
import { setupAnalyticsListeners } from './views/analyticsView';
import { setupPlayerDetailListeners } from './views/playerDetailView';
import { debounce, setStatus, downloadFile } from './utils/helpers';

/**
 * Handles navigation link clicks.
 *
 * @param {Event} event - The click event object.
 */
function handleNavClick(event) {
    event.preventDefault();
    // Find the closest ancestor that is a button or link with the data attribute
    const targetElement = event.target.closest('[data-target-view]');
    if (!targetElement) return;

    const targetId = targetElement.dataset.targetView;
    if (targetId && targetId !== state.currentView) {
        console.log(`Navigating to: ${targetId}`);
        updateState({ previousView: state.currentView }); // Track previous view for back buttons
        showView(targetId);
    }
}

/**
 * Handles changes in the global filter input (debounced).
 */
const handleGlobalFilterChange = debounce(() => {
    if (!elements.filterInput) return;
    const filterText = elements.filterInput.value;
    updateState({ currentFilter: filterText });
    console.log(`Global filter changed: ${filterText}`);

    // Re-render the currently active view that uses this filter
    if (state.currentView === 'dashboard') {
        const filteredData = filterAndSortData(state.allPlayersData, filterText, state.currentSort);
        // Only re-render necessary parts, not the whole dashboard ideally
        // For now, re-rendering the main content might be acceptable
        renderDashboard(state.allPlayersData, filteredData); // Assuming this function handles partial updates or is fast enough
    }
    // Note: Detailed view uses its own filter input, handled in detailedTableView.js
}, 300); // 300ms debounce

/**
 * Handles changes in the global sort select.
 */
function handleGlobalSortChange() {
    if (!elements.sortSelect) return;
    const sortValue = elements.sortSelect.value.split(':');
    const sortKey = sortValue[0];
    const sortOrder = sortValue[1] || 'desc'; // Default to desc if order not specified

    // Prevent re-rendering if sort hasn't actually changed
    if (state.currentSort.key === sortKey && state.currentSort.order === sortOrder) {
        return;
    }

    updateState({ currentSort: { key: sortKey, order: sortOrder } });
    console.log(`Global sort changed: Key=${sortKey}, Order=${sortOrder}`);

    // Re-render the currently active view that uses sorting
    const filteredData = filterAndSortData(state.allPlayersData, state.currentFilter, state.currentSort);

    if (state.currentView === 'dashboard') {
        renderDashboard(state.allPlayersData, filteredData); // Re-render dashboard with new sort
    }
    // Detailed view also uses the global sort state, trigger its re-render
    if (state.currentView === 'detailed-table') {
        // The renderDetailedView function should use the latest state.currentSort when called
        renderDetailedView(state.allPlayersData, state.allHeaders);
    }
}

/**
 * Handles language selection changes.
 */
async function handleLanguageChange() {
    if (!elements.languageSelect) return;
    const lang = elements.languageSelect.value;
    console.log(`Language selected: ${lang}`);
    try {
        await loadLanguage(lang);
        updateUIText(); // Update static text elements
        // Re-render dynamic content that might have language-specific formats or text
        console.log("UI text updated for new language.");

         // Re-render current view to apply changes fully (e.g., chart titles, table headers)
         const filteredData = filterAndSortData(state.allPlayersData, state.currentFilter, state.currentSort);
         switch(state.currentView) {
             case 'dashboard':
                 renderDashboard(state.allPlayersData, filteredData);
                 break;
             case 'detailed-table':
                  renderDetailedView(state.allPlayersData, state.allHeaders);
                  break;
            // Add cases for other views if they need re-rendering on language change
            // e.g., chartsView, analyticsView might need chart re-renders if titles are translated
         }
        setStatus(getText('status.languageLoaded', { lang }), 'success', 2000); // Provide feedback
    } catch (error) {
        console.error("Failed to load language:", error);
        setStatus(getText('status.languageLoadError'), 'error', 3000);
    }
}

/**
 * Handles clicks on the theme toggle button.
 */
function handleThemeToggle() {
    console.log("Theme toggle clicked.");
    toggleTheme();
}

/**
 * Handles clicks on download buttons.
 *
 * @param {Event} event - The click event.
 */
function handleDownloadClick(event) {
    const button = event.currentTarget;
    const format = button.dataset.format; // 'csv' or 'json'
    const scope = button.dataset.scope; // 'all', 'filtered', 'player'
    console.log(`Download button clicked: Format=${format}, Scope=${scope}`);

    let dataToDownload;
    let filename;

    setStatus(getText('status.preparingDownload'), 'info'); // Show feedback

    try {
        if (scope === 'player' && state.selectedPlayer) {
            dataToDownload = [state.selectedPlayer]; // downloadManager expects an array
            filename = `player_${state.selectedPlayer.PLAYER}_chiller_data.${format}`.replace(/[^a-z0-9_\-\.]/gi, '_'); // Sanitize filename
        } else if (scope === 'filtered') {
             // Use the currently active filter/sort for the relevant view
             // For simplicity, let's assume 'filtered' applies to the main dataset filter/sort
             dataToDownload = filterAndSortData(state.allPlayersData, state.currentFilter, state.currentSort);
             filename = `filtered_chiller_data.${format}`;
        } else { // Default to 'all'
             dataToDownload = filterAndSortData(state.allPlayersData, '', state.currentSort); // Download all, but sorted
             filename = `all_chiller_data.${format}`;
        }

        if (dataToDownload && dataToDownload.length > 0) {
            // Convert data to string format (CSV or JSON)
            let dataString;
            if (format === 'csv') {
                // Basic CSV conversion (consider using PapaParse.unparse if more complex)
                const headers = Object.keys(dataToDownload[0]);
                const csvRows = [
                    headers.join(','), // header row
                    ...dataToDownload.map(row => 
                        headers.map(fieldName => 
                             JSON.stringify(row[fieldName], (_, value) => value === null ? '' : value) // Handle nulls, quote strings
                        ).join(',')
                    )
                ];
                dataString = csvRows.join('\r\n');
            } else { // JSON format
                dataString = JSON.stringify(dataToDownload, null, 2); // Pretty print JSON
            }

            const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
            downloadFile(dataString, filename, mimeType); // Use helper
            setStatus(getText('status.downloadReady'), 'success', 3000);
        } else {
            console.warn("No data available for download for the selected scope.");
            setStatus(getText('status.noDataToDownload'), 'warning', 3000);
        }
    } catch (error) {
        console.error("Error preparing or initiating download:", error);
        setStatus(getText('status.downloadError'), 'error', 5000);
    }
}


/**
 * Sets up all global event listeners for the application.
 * Should be called once after the DOM is fully loaded and initial rendering is complete.
 */
export function setupEventListeners() {
    console.log("Setting up global event listeners...");

    // --- Navigation --- 
    // Use event delegation on a common ancestor if possible, e.g., the nav bar
    const navContainer = document.querySelector('nav'); // Or a more specific container
    if (navContainer) {
        navContainer.addEventListener('click', (event) => {
             // Check if the clicked element or its parent has the data-target-view attribute
             if (event.target.closest('[data-target-view]')) {
                 handleNavClick(event);
             }
        });
        console.log("Navigation listener added to nav container.")
    } else {
         // Fallback to individual links if no suitable container
        console.warn("Nav container not found, attaching listeners individually.");
         elements.navLinks?.forEach(link => {
             if (!link.hasAttribute('data-listener-added')) {
                 link.addEventListener('click', handleNavClick);
                 link.setAttribute('data-listener-added', 'true');
             }
         });
    }

    // --- Theme Toggle --- 
    if (elements.themeToggle && !elements.themeToggle.hasAttribute('data-listener-added')) {
        elements.themeToggle.addEventListener('click', handleThemeToggle);
        elements.themeToggle.setAttribute('data-listener-added', 'true');
        console.log("Theme toggle listener added.");
    }

    // --- Language Select --- 
    if (elements.languageSelect && !elements.languageSelect.hasAttribute('data-listener-added')) {
        elements.languageSelect.addEventListener('change', handleLanguageChange);
        elements.languageSelect.setAttribute('data-listener-added', 'true');
        console.log("Language select listener added.");
    }

    // --- Global Filter Input --- 
    if (elements.filterInput && !elements.filterInput.hasAttribute('data-listener-added')) {
        elements.filterInput.addEventListener('input', handleGlobalFilterChange);
        elements.filterInput.setAttribute('data-listener-added', 'true');
        console.log("Global filter listener added.");
    }

    // --- Global Sort Select --- 
    if (elements.sortSelect && !elements.sortSelect.hasAttribute('data-listener-added')) {
        elements.sortSelect.addEventListener('change', handleGlobalSortChange);
        elements.sortSelect.setAttribute('data-listener-added', 'true');
        console.log("Global sort listener added.");
    }

    // --- Download Buttons --- 
    const downloadButtons = [
        elements.downloadCsvButton,
        elements.downloadJsonButton,
        elements.downloadCsvPlayerButton,
        elements.downloadJsonPlayerButton
    ];
    downloadButtons.forEach(button => {
        if (button && !button.hasAttribute('data-listener-added')) {
            button.addEventListener('click', handleDownloadClick);
            button.setAttribute('data-listener-added', 'true');
        }
    });
    console.log("Download button listeners added (if buttons exist).");

    // --- View-Specific Listeners --- 
    // These functions handle adding their own specific listeners
    setupAnalyticsListeners();
    setupPlayerDetailListeners();

    console.log("Global event listeners setup complete.");
} 