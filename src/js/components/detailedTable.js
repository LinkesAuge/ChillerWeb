/**
 * detailedTable.js
 *
 * Description: Handles rendering and potentially interactions for the detailed player table.
 * Usage:
 *     import { renderDetailedTable } from './components/detailedTable.js';
 *     renderDetailedTable(filteredPlayerData);
 */

import { getState, setState } from '../core/state.js';
import { getTranslation } from '../core/i18n.js';
import { $, $$ } from '../utils/dom.js';
import { formatNumber, formatPercentage, formatDate } from '../utils/formatters.js';

// --- Constants for Selectors ---
const TABLE_CONTAINER_SELECTOR = '#detailed-table-container'; // Container for the whole table section
const TABLE_BODY_SELECTOR = '#detailed-table-body'; // tbody element
const TABLE_HEAD_SELECTOR = '#detailed-table-head'; // thead element (for potential dynamic headers or sort indicators)

/**
 * Generates the HTML string for a single row in the detailed table.
 *
 * Args:
 *     player (object): Player data object.
 *     index (number): The index of the player in the current list (for ranking).
 *
 * Returns:
 *     string: HTML string for the table row (<tr>...</tr>).
 */
function createTableRow(player, index) {
    // TODO: Define the exact columns and formatting based on the original table
    // This is a simplified example based on common stats
    const rank = index + 1;
    const playerName = player['Spieler Name'] || 'N/A';
    const totalScore = player['Gesamtwertung'] !== undefined ? formatNumber(player['Gesamtwertung'], { maximumFractionDigits: 1 }) : 'N/A';
    const matchesPlayed = player['Anzahl Spiele'] !== undefined ? formatNumber(player['Anzahl Spiele'], { maximumFractionDigits: 0 }) : 'N/A';
    const winRate = player['Winrate'] !== undefined ? formatPercentage(player['Winrate']) : 'N/A';
    // Add other relevant columns...

    // Use data attributes for potential interactions (e.g., opening player detail)
    return `
        <tr data-player-id="${player.ID}" class="border-b border-border hover:bg-muted/50">
            <td class="p-2 text-center">${rank}</td>
            <td class="p-2 font-medium">${playerName}</td>
            <td class="p-2 text-center">${totalScore}</td>
            <td class="p-2 text-center">${matchesPlayed}</td>
            <td class="p-2 text-center">${winRate}</td>
            <!-- Add more <td> elements for other columns -->
        </tr>
    `;
}

/**
 * Renders the detailed player data table.
 *
 * Args:
 *     playersData (array): Array of player data objects to display (should be filtered/sorted).
 */
export function renderDetailedTable(playersData) {
    const tableBody = $(TABLE_BODY_SELECTOR);
    if (!tableBody) {
        console.error("Detailed Table: tbody element not found.");
        const container = $(TABLE_CONTAINER_SELECTOR);
        if (container) {
            container.innerHTML = `<p class="text-red-500 text-center p-4">${getTranslation('error.tableRender', 'Failed to find table body.')}</p>`;
        }
        return;
    }

    console.log(`Rendering detailed table with ${playersData.length} players...`);

    if (playersData.length === 0) {
        // Display a message when there are no players to show (e.g., after filtering)
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="p-4 text-center text-muted-foreground">${getTranslation('table.noPlayersFound', 'No players found matching criteria.')}</td>
                <!-- Adjust colspan based on the actual number of columns -->
            </tr>
        `;
        return;
    }

    // Generate rows and update table body
    // Use map().join('') for potentially better performance than repeated innerHTML+= or appendChild
    try {
        const tableRowsHtml = playersData.map(createTableRow).join('');
        tableBody.innerHTML = tableRowsHtml;
    } catch (error) {
        console.error("Error generating detailed table rows:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="p-4 text-center text-red-500">${getTranslation('error.tableRender', 'Error rendering table rows.')}</td>
                <!-- Adjust colspan based on the actual number of columns -->
            </tr>
        `;
    }

    // TODO: Add sorting indicators to table headers based on current sort state
    // updateSortIndicators();

    console.log("Detailed table rendering complete.");
}

/**
 * Initializes the detailed table component.
 * Sets up event listeners for sorting, filtering (if handled here), or row clicks.
 */
export function initializeDetailedTable() {
    console.log("Initializing detailed table component...");

    const tableHead = $(TABLE_HEAD_SELECTOR);
    if (tableHead) {
        tableHead.addEventListener('click', (event) => {
            const headerCell = event.target.closest('th[data-sort-key]');
            if (headerCell) {
                const sortKey = headerCell.dataset.sortKey;
                console.log(`Sort requested for key: ${sortKey}`);
                // TODO: Implement sorting logic
                // 1. Get current sort state (key, direction)
                // 2. Determine new sort state
                // 3. Update sort state
                // 4. Re-sort data
                // 5. Re-render table
                // 6. Update sort indicators
            }
        });
    }

    const tableBody = $(TABLE_BODY_SELECTOR);
    if (tableBody) {
        tableBody.addEventListener('click', (event) => {
            const row = event.target.closest('tr[data-player-id]');
            if (row) {
                const playerId = row.dataset.playerId;
                console.log(`Player row clicked, ID: ${playerId}`);
                // TODO: Navigate to player detail view or open modal
                // navigateTo('player-detail', { playerId: playerId });
            }
        });
    }

    console.log("Detailed table component initialized.");
}

// Initial setup
// initializeDetailedTable(); // Call from main or relevant view module 