/**
 * detailedTableView.js
 *
 * Description: Handles rendering logic for the Detailed Table view, including column toggles.
 * Usage:
 *  import { renderDetailedView } from './detailedTableView';
 *  renderDetailedView(filteredData, allHeaders);
 */

import { elements } from '../core/domElements';
import { state, updateState } from '../state';
import { renderDetailedTable, setupColumnToggle } from '../components/tableManager';
import { CORE_COLUMNS } from '../config';
import { filterAndSortData } from '../core/dataProcessor';
import { debounce } from '../utils/helpers';

let columnToggleControls = null;
let currentVisibleColumns = [];

/**
 * Handles the filtering of the detailed table based on search input.
 */
const handleDetailedTableFilter = debounce(() => {
    if (!elements.playerSearchInput) return;
    const filterText = elements.playerSearchInput.value;
    updateState({ currentDetailFilter: filterText }); // Store filter in state if needed
    const filteredData = filterAndSortData(
        state.allPlayersData,
        filterText,
        state.currentSort // Use the main sort state
    );
    renderDetailedTable(filteredData, currentVisibleColumns);
}, 300);

/**
 * Handles changes in column visibility.
 *
 * @param {Array<string>} visibleColumns - The updated list of visible column keys.
 */
function handleColumnVisibilityChange(visibleColumns) {
    console.log("Column visibility changed:", visibleColumns);
    currentVisibleColumns = visibleColumns;
    // Re-render the table with the new column set
    const filterText = elements.playerSearchInput?.value || '';
    const filteredData = filterAndSortData(
        state.allPlayersData,
        filterText,
        state.currentSort // Use the main sort state
    );
    renderDetailedTable(filteredData, currentVisibleColumns);
}

/**
 * Renders the detailed table view, including setting up column toggles and search.
 *
 * @param {Array<object>} allPlayersData - All processed player data.
 * @param {Array<string>} allHeaders - All available column headers.
 */
export function renderDetailedView(allPlayersData, allHeaders) {
    console.log("Rendering Detailed Table View...");
    if (!elements.detailedTableSection) {
        console.error("Detailed table section element not found!");
        return;
    }

    // Setup column toggles (only needs to be done once or if headers change)
    if (!columnToggleControls) {
        // Define initially visible columns (e.g., core + a few important ones)
        const initialCols = [
            ...CORE_COLUMNS,
            // Add other default columns if desired, e.g.:
            // ...allHeaders.filter(h => !CORE_COLUMNS.includes(h)).slice(0, 5)
        ];
         // Ensure only valid headers are included
         const validInitialCols = initialCols.filter(col => allHeaders.includes(col));
         currentVisibleColumns = validInitialCols;

        columnToggleControls = setupColumnToggle(
            allHeaders,
            currentVisibleColumns,
            handleColumnVisibilityChange
        );
    } else {
         // If controls exist, ensure currentVisibleColumns is up-to-date
         currentVisibleColumns = columnToggleControls.getVisibleColumns();
    }

    // Add input listener for search/filter if not already added
    if (elements.playerSearchInput && !elements.playerSearchInput.hasAttribute('data-listener-added')) {
        elements.playerSearchInput.addEventListener('input', handleDetailedTableFilter);
        elements.playerSearchInput.setAttribute('data-listener-added', 'true');
    }

    // Initial render of the table
     const filterText = elements.playerSearchInput?.value || '';
     const filteredData = filterAndSortData(
        allPlayersData,
        filterText,
        state.currentSort // Use the main sort state
     );
    renderDetailedTable(filteredData, currentVisibleColumns);

    console.log("Detailed Table View rendering complete.");
} 