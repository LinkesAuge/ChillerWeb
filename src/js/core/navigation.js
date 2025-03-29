/**
 * navigation.js
 *
 * Description: Handles view switching and updates navigation link styles.
 * Usage:
 *     import { initializeNavigation, navigateTo } from './core/navigation.js';
 *     initializeNavigation(); // Call once on app load
 *     navigateTo('dashboard'); // Programmatically switch view
 */

import { getState, setState } from './state.js';

// Define the IDs of the main view containers expected in index.html
const VIEW_IDS = ['dashboard', 'detailed-view', 'analytics', 'player-detail', 'settings']; // Added settings as a potential view
const NAV_LINK_SELECTOR = '[data-nav-link]'; // Selector for navigation links
const VIEW_CONTAINER_SELECTOR = '[data-view]'; // Selector for view containers
const ACTIVE_NAV_CLASS = 'active'; // Class added to the active navigation link

/**
 * Shows the specified view and hides all others.
 * Updates the active state of navigation links.
 *
 * Args:
 *     viewId (string): The ID of the view to navigate to (must match VIEW_IDS and data-view attribute).
 */
export function navigateTo(viewId) {
    if (!VIEW_IDS.includes(viewId)) {
        console.error(`Navigation error: Unknown view ID '${viewId}'`);
        return;
    }

    console.log(`Navigating to view: ${viewId}`);

    // Hide all view containers
    document.querySelectorAll(VIEW_CONTAINER_SELECTOR).forEach(el => {
        el.classList.add('hidden');
    });

    // Show the target view container
    const targetView = document.querySelector(`${VIEW_CONTAINER_SELECTOR}[data-view="${viewId}"]`);
    if (targetView) {
        targetView.classList.remove('hidden');
    } else {
        console.warn(`Navigation warning: View container not found for ID '${viewId}'`);
        // Optionally show a default view or an error message container
    }

    // Update navigation link styles
    document.querySelectorAll(NAV_LINK_SELECTOR).forEach(link => {
        if (link.getAttribute('data-nav-link') === viewId) {
            link.classList.add(ACTIVE_NAV_CLASS);
        } else {
            link.classList.remove(ACTIVE_NAV_CLASS);
        }
    });

    // Update the current view in the application state
    setState('currentView', viewId);

    // Optional: Update URL hash or use History API for browser navigation integration
    // window.location.hash = viewId;
}

/**
 * Initializes navigation by attaching event listeners to nav links
 * and showing the initial view based on the current state or default.
 */
export function initializeNavigation() {
    console.log("Initializing navigation...");

    document.querySelectorAll(NAV_LINK_SELECTOR).forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            const targetViewId = link.getAttribute('data-nav-link');
            if (targetViewId) {
                navigateTo(targetViewId);
            } else {
                console.warn("Navigation link clicked without a 'data-nav-link' attribute:", link);
            }
        });
    });

    // Show the initial view
    const initialView = getState('currentView') || 'dashboard'; // Default to dashboard if not set
    console.log(`Attempting to show initial view: ${initialView}`);
    // Use setTimeout to ensure the DOM is fully ready, especially if called early
    setTimeout(() => navigateTo(initialView), 0);

    console.log("Navigation initialization complete.");
} 