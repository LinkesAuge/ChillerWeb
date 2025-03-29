// Application state management

export const state = {
    allPlayersData: [],
    filteredPlayersData: [],
    scoreRules: [],
    allColumnHeaders: [],
    currentView: 'dashboard',
    currentSort: {
        column: 'TOTAL_SCORE',
        direction: 'desc'
    },
    currentFilter: '',
    currentLanguage: 'de',
    translations: {},
    lastUpdated: null,
    // Add other state variables as needed
};

// Function to update state (optional, could use direct mutation for simplicity)
export function updateState(newState) {
    Object.assign(state, newState);
    // Potentially trigger UI updates or other side effects here if needed
} 