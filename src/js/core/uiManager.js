/**
 * uiManager.js
 *
 * Description: Manages overall UI state, including view switching, status messages, and loading indicators.
 * Usage:
 *  import { showView, setStatus, showLoading, hideLoading } from './uiManager';
 *  showView('dashboard');
 *  setStatus('Data loaded.', 'success');
 */

import { elements } from './domElements';
import { state, updateState } from '../state';
import { getText, updateUIText } from './i18n'; // Assuming updateUIText is here
// Import View rendering functions
import { renderDashboard } from '../views/dashboardView';
import { renderDetailedView } from '../views/detailedTableView';
import { renderChartsView } from '../views/chartsView';
import { renderAnalyticsView } from '../views/analyticsView';
import { renderScoreSystemView } from '../views/scoreSystemView';
import { renderPlayerDetailView, findPlayerByName } from '../views/playerDetailView'; // Import findPlayerByName too
import { filterAndSortData } from './dataProcessor'; // Needed for rendering views with data

let statusTimeout = null;

/**
 * Displays a status message to the user.
 *
 * @param {string} message - The message to display.
 * @param {'info'|'success'|'warning'|'error'} type - The type of message.
 * @param {number|null} [duration=null] - Auto-hide duration in ms (null for persistent).
 */
export function setStatus(message, type = 'info', duration = null) {
    if (!elements.statusMessage || !elements.statusArea) return;

    console.log(`setStatus (${type}): ${message}`);
    elements.statusMessage.textContent = message;
    // Remove previous type classes
    elements.statusArea.classList.remove('text-blue-400', 'text-green-400', 'text-yellow-400', 'text-red-500', 'bg-blue-900/30', 'bg-green-900/30', 'bg-yellow-900/30', 'bg-red-900/30');

    let typeClass = '';
    let bgClass = '';
    switch (type) {
        case 'success':
            typeClass = 'text-green-400';
            bgClass = 'bg-green-900/30';
            break;
        case 'warning':
            typeClass = 'text-yellow-400';
            bgClass = 'bg-yellow-900/30';
            break;
        case 'error':
            typeClass = 'text-red-500';
            bgClass = 'bg-red-900/30';
            break;
        case 'info':
        default:
            typeClass = 'text-blue-400';
            // bgClass = 'bg-blue-900/30'; // Optional background for info
            break;
    }
    elements.statusArea.classList.add(typeClass);
    if(bgClass) elements.statusArea.classList.add(bgClass);
    elements.statusArea.classList.remove('opacity-0');

    // Clear previous timeout if set
    if (statusTimeout) {
        clearTimeout(statusTimeout);
    }

    // Set new timeout if duration is provided
    if (duration !== null) {
        statusTimeout = setTimeout(() => {
            clearStatus();
        }, duration);
    }
}

/**
 * Clears the status message.
 */
export function clearStatus() {
    if (!elements.statusMessage || !elements.statusArea) return;
    elements.statusMessage.textContent = '';
    elements.statusArea.classList.add('opacity-0');
    elements.statusArea.classList.remove('text-blue-400', 'text-green-400', 'text-yellow-400', 'text-red-500', 'bg-blue-900/30', 'bg-green-900/30', 'bg-yellow-900/30', 'bg-red-900/30');
    if (statusTimeout) {
        clearTimeout(statusTimeout);
        statusTimeout = null;
    }
}

/**
 * Shows the loading spinner.
 */
export function showLoading() {
    if (!elements.loadingSpinner) return;
    elements.loadingSpinner.classList.remove('hidden');
}

/**
 * Hides the loading spinner.
 */
export function hideLoading() {
    if (!elements.loadingSpinner) return;
    elements.loadingSpinner.classList.add('hidden');
}

/**
 * Switches the visible view/section in the main content area and triggers rendering.
 *
 * @param {string} viewId - The ID of the view section to show (e.g., 'dashboard', 'detailed-table').
 * @param {object} [options] - Optional parameters, e.g., { playerId: '...' } for player detail.
 */
export function showView(viewId, options = {}) {
    console.log(`Switching view to: ${viewId}`, options);
    const sections = [
        elements.emptyStateSection,
        elements.dashboardSection,
        elements.detailedTableSection,
        elements.chartsSection,
        elements.analyticsSection,
        elements.scoreSystemSection,
        elements.playerDetailSection
    ];

    let targetSection = null;
    let viewFound = false;

    sections.forEach(section => {
        if (section) {
            // Use section.id directly for matching as it should be unique
            if (section.id === viewId) {
                section.classList.remove('hidden');
                targetSection = section;
                viewFound = true;
            } else {
                section.classList.add('hidden');
            }
        }
    });

    // Handle specific 'empty' state or if view not found
    if (viewId === 'empty' && elements.emptyStateSection) {
        elements.emptyStateSection.classList.remove('hidden');
        targetSection = elements.emptyStateSection;
        viewFound = true;
    } else if (!viewFound) {
        console.warn(`View section with ID "${viewId}" not found. Falling back to dashboard.`);
        if (elements.dashboardSection) {
            elements.dashboardSection.classList.remove('hidden');
            targetSection = elements.dashboardSection;
            viewId = 'dashboard'; // Correct the viewId for state and rendering
            viewFound = true;
        }
    }

    // If a valid view section is now visible, update state and render
    if (viewFound && targetSection) {
        // Only update if the view actually changed
        if (state.currentView !== viewId) {
            updateState({ previousView: state.currentView }); // Store the view we came from
            updateState({ currentView: viewId });
            updateActiveNavLink(viewId);
            updateBreadcrumb(viewId);
        }

        // --- Render the specific view --- 
        try {
            const filteredData = filterAndSortData(state.allPlayersData, state.currentFilter, state.currentSort);
            const detailFilteredData = filterAndSortData(state.allPlayersData, state.currentDetailFilter, state.currentSort); // For detailed view filter

            switch (viewId) {
                case 'dashboard':
                    renderDashboard(state.allPlayersData, filteredData);
                    break;
                case 'detailed-table':
                    renderDetailedView(state.allPlayersData, state.allHeaders);
                    break;
                case 'charts':
                    renderChartsView(state.allPlayersData);
                    break;
                case 'analytics':
                    renderAnalyticsView(state.allHeaders); // Setup happens here
                    // If a category was previously selected, render it
                    if (state.selectedCategory) {
                        // Need to import and call the internal render function directly?
                        // Or, renderAnalyticsView should handle this based on state.
                        // Let's assume renderAnalyticsView handles it or it's handled via event listeners.
                    }
                    break;
                case 'score-system':
                    renderScoreSystemView(state.scoreRules);
                    break;
                case 'player-detail':
                    // Player ID might come from options or be retrieved from state if needed
                    const playerId = options.playerId || state.selectedPlayer?.PLAYER;
                    const playerData = playerId ? findPlayerByName(playerId) : null;
                    renderPlayerDetailView(playerData);
                    break;
                case 'empty':
                    // No specific rendering needed, already visible
                    break;
                 default:
                    console.warn(`No specific render function defined for view: ${viewId}`);
            }
            // After rendering, ensure any language-specific text is updated
            updateUIText();

            // Scroll to top of the main content area
            document.querySelector('main')?.scrollTo(0, 0);

        } catch (error) {
            console.error(`Error rendering view ${viewId}:`, error);
            setStatus(getText('status.renderError'), 'error', 5000);
            // Maybe show the empty state or a dedicated error view?
        }

    } else {
        console.error(`Failed to show view: ${viewId}. No target section found or view is invalid.`);
        // Fallback to dashboard if possible
        if (elements.dashboardSection) {
             elements.dashboardSection.classList.remove('hidden');
             if (state.currentView !== 'dashboard') {
                 updateState({ previousView: state.currentView });
                 updateState({ currentView: 'dashboard' });
                 updateActiveNavLink('dashboard');
                 updateBreadcrumb('dashboard');
                 renderDashboard(state.allPlayersData, filterAndSortData(state.allPlayersData, state.currentFilter, state.currentSort));
             }
         } else if (elements.emptyStateSection) {
              elements.emptyStateSection.classList.remove('hidden');
               if (state.currentView !== 'empty') {
                  updateState({ previousView: state.currentView });
                  updateState({ currentView: 'empty' });
                  updateActiveNavLink('empty');
                  updateBreadcrumb('empty');
              }
         }
    }
}

/**
 * Updates the active state of the main navigation links.
 *
 * @param {string} activeViewId - The ID of the currently active view.
 */
function updateActiveNavLink(activeViewId) {
    elements.navLinks.forEach(link => {
        if (link.dataset.view === activeViewId) {
            link.classList.add('active', 'border-primary', 'text-primary');
            link.classList.remove('border-transparent', 'hover:text-primary', 'hover:border-amber-500/50');
        } else {
            link.classList.remove('active', 'border-primary', 'text-primary');
            link.classList.add('border-transparent', 'hover:text-primary', 'hover:border-amber-500/50');
        }
    });
}

/**
 * Updates the breadcrumb navigation based on the current view.
 *
 * @param {string} currentViewId - The ID of the currently active view.
 */
function updateBreadcrumb(currentViewId) {
    if (!elements.breadcrumbNav || !elements.breadcrumbCurrentPageItem || !elements.breadcrumbCurrentPageName) {
        return;
    }

    // Ensure breadcrumb visibility is toggled correctly
    if (currentViewId === 'dashboard' || currentViewId === 'empty') {
        elements.breadcrumbNav.classList.add('hidden');
    } else {
        elements.breadcrumbNav.classList.remove('hidden');
    }

    // Set the text based on the view ID
    let pageNameKey = `nav.${currentViewId}`; // Default key pattern
    let pageNameText = '';

    if (currentViewId === 'player-detail') {
        pageNameKey = 'playerDetail.title'; // Specific key for player detail
        const playerName = state.selectedPlayer ? state.selectedPlayer.PLAYER : '...';
        pageNameText = `${getText(pageNameKey)} (${playerName})`; // Add player name dynamically
    } else {
        pageNameText = getText(pageNameKey); // Get text using the standard key
    }

    elements.breadcrumbCurrentPageName.textContent = pageNameText;
    elements.breadcrumbCurrentPageName.setAttribute('data-i18n-key', pageNameKey); // Set key for potential future updates
}

/**
 * Updates the display of the last updated time.
 *
 * @param {Date | null} lastUpdatedDate - The date object for the last update, or null.
 */
export function displayLastUpdated(lastUpdatedDate) {
    if (!elements.lastUpdatedInfo) return;

    if (lastUpdatedDate instanceof Date && !isNaN(lastUpdatedDate)) {
        try {
            const options = {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: false // Use 24-hour format based on locale
            };
            // Use state.currentLanguage for locale-specific formatting
            const formattedDate = new Intl.DateTimeFormat(state.currentLanguage === 'de' ? 'de-DE' : 'en-GB', options).format(lastUpdatedDate);
            elements.lastUpdatedInfo.textContent = getText('status.lastUpdated', { 0: formattedDate });
            elements.lastUpdatedInfo.classList.remove('hidden');
        } catch (e) {
             console.error("Error formatting last updated date:", e);
             elements.lastUpdatedInfo.textContent = getText('status.lastUpdatedError');
             elements.lastUpdatedInfo.classList.remove('hidden');
        }
    } else {
        elements.lastUpdatedInfo.textContent = ''; // Clear if no valid date
        elements.lastUpdatedInfo.classList.add('hidden');
    }
}

/**
 * Toggles the theme between light and dark mode.
 */
export function toggleTheme() {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateState({ theme: isDarkMode ? 'dark' : 'light' });

    // Update toggle button icon
    if (elements.themeToggleIcon) {
        elements.themeToggleIcon.classList.toggle('fa-sun', !isDarkMode);
        elements.themeToggleIcon.classList.toggle('fa-moon', isDarkMode);
    }

    // Update chart themes (this needs implementation in chartManager)
    // updateAllChartThemes(isDarkMode ? 'dark' : 'light');
    console.log(`Theme toggled to: ${isDarkMode ? 'dark' : 'light'}`);
}

/**
 * Initializes the theme based on localStorage or system preference.
 */
export function initializeTheme() {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let useDarkTheme;

    if (storedTheme) {
        useDarkTheme = storedTheme === 'dark';
    } else {
        useDarkTheme = systemPrefersDark;
    }

    if (useDarkTheme) {
        document.documentElement.classList.add('dark');
        updateState({ theme: 'dark' });
        if (elements.themeToggleIcon) {
            elements.themeToggleIcon.classList.remove('fa-sun');
            elements.themeToggleIcon.classList.add('fa-moon');
        }
    } else {
        document.documentElement.classList.remove('dark');
        updateState({ theme: 'light' });
         if (elements.themeToggleIcon) {
            elements.themeToggleIcon.classList.remove('fa-moon');
            elements.themeToggleIcon.classList.add('fa-sun');
        }
    }
    console.log(`Theme initialized to: ${state.theme}`);
    // Initial chart theme setting
    // updateAllChartThemes(state.theme);
} 