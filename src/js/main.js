/**
 * main.js
 *
 * Description: Main application entry point. Initializes the application,
 *              loads data, sets up navigation, and renders the initial view.
 * Usage:
 *     Included as the main script in index.html.
 *     Executes when the DOM content is loaded.
 */

// Core Modules Imports
import { initializeI18n, getTranslation } from './core/i18n.js';
import { loadData } from './core/api.js';
import { setState, getState } from './core/state.js';
import { initializeNavigation, navigateTo } from './core/navigation.js';

// View/Component Imports
import { renderDashboard } from './components/dashboard.js'; // Import dashboard renderer
// import { setupEventListeners } from './eventListeners.js';

// Utility Imports
import { showLoading, hideLoading } from './utils/dom.js';

/**
 * Initializes the application after the DOM is fully loaded.
 */
async function initializeApp() {
    console.log("DOM fully loaded and parsed. Initializing app...");
    showLoading();

    try {
        // 1. Initialize Internationalization (i18n)
        await initializeI18n();
        console.log("i18n initialized.");

        // 2. Load Data
        const { playerData, scoreRules } = await loadData();
        console.log("Data loaded.");
        // TODO: We need a data processing step here to calculate initial scores
        // before the first render. For now, we pass raw data.
        const initialProcessedData = getState('allPlayersData'); // Use raw for now
        const initialFilteredData = getState('allPlayersData'); // Use raw for now
        setState('processedPlayersData', initialProcessedData); // Set processed state
        setState('filteredPlayersData', initialFilteredData);   // Set filtered state

        // 3. Initialize Navigation
        initializeNavigation();
        console.log("Navigation initialized.");

        // 4. Setup Event Listeners
        // setupEventListeners(); // TODO: Refine eventListeners.js
        // console.log("Event listeners set up.");

        // 5. Initial Render
        // Since navigation just showed the container, now render the content
        if (getState('currentView') === 'dashboard') { // Check if dashboard is the initial view
             renderDashboard(initialProcessedData, initialFilteredData);
             console.log("Initial dashboard render complete.");
        } else {
            // TODO: Handle rendering other initial views if needed
            console.log(`Initial view is ${getState('currentView')}, skipping initial dashboard render.`);
        }

        // Clear the temporary placeholder message
        const appElement = document.getElementById('app');
        if (appElement && appElement.innerHTML.includes('Application is loading')) {
             // Ideally, the view rendering replaces this, but clear just in case
             // appElement.innerHTML = '';
        }

    } catch (error) {
        console.error("Error initializing application:", error);
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.innerHTML = '<p class="text-center text-red-500 text-lg mt-8">Failed to initialize application. Check console for details.</p>';
        }
    } finally {
        hideLoading();
        console.log("App initialization complete (or failed).");
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', initializeApp); 