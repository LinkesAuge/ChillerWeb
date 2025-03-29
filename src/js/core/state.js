/**
 * state.js
 *
 * Description: Manages the central application state.
 *              Provides functions to get and set state properties.
 * Usage:
 *     import { getState, setState } from './core/state.js';
 *     const players = getState('allPlayersData');
 *     setState('currentView', 'dashboard');
 */

// The central state object
const appState = {
    // Data related state
    allPlayersData: [], // Raw data loaded from data.csv
    processedPlayersData: [], // Data after initial processing (scores calculated, etc.)
    filteredPlayersData: [], // Data currently displayed after filtering/sorting
    scoreRules: {}, // Scoring rules loaded from rules.csv
    lastDataUpdate: null, // Timestamp of the last data fetch/update

    // UI related state
    currentView: 'dashboard', // Identifier for the currently visible view/section
    currentLanguage: 'en', // Currently selected language code (e.g., 'en', 'de')
    currentTheme: 'dark', // Currently active theme ('light' or 'dark')
    isLoading: false, // Flag indicating if a background operation is in progress
    statusMessage: { text: '', type: 'info' }, // For displaying status updates to the user
    sortState: { // State for table sorting
        column: 'Gesamtwertung', // Default sort column
        direction: 'desc'      // Default sort direction
    },
    filterState: { // State for filtering
        searchTerm: '',
        // Add other filter criteria here if needed (e.g., role, rank)
    }
    // Add other state properties as needed
};

/**
 * Gets a value from the application state.
 *
 * Args:
 *     key (string): The key of the state property to retrieve.
 *
 * Returns:
 *     any: The value of the state property, or undefined if the key doesn't exist.
 */
function getState(key) {
    if (key in appState) {
        return appState[key];
    } else {
        console.warn(`Attempted to get unknown state key: ${key}`);
        return undefined;
    }
}

/**
 * Sets a value in the application state.
 *
 * Args:
 *     key (string): The key of the state property to set.
 *     value (any): The new value for the state property.
 */
function setState(key, value) {
    if (key in appState) {
        appState[key] = value;
        // Optional: Add logic here to notify subscribers of state changes (e.g., using CustomEvent)
        // console.log(`State updated: ${key} =`, value);
    } else {
        console.warn(`Attempted to set unknown state key: ${key}`);
    }
}

// Export the getter and setter functions
export { getState, setState };

// Optional: Export the state object directly for debugging or specific use cases
// export const state = appState; 