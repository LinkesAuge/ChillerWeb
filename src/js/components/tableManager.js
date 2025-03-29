/**
 * tableManager.js
 *
 * Description: Handles rendering and interactions for various tables in the application.
 * Usage:
 *  import { renderRankingTable, renderDetailedTable, renderRulesTable, updateSortIcon } from './tableManager';
 *  renderRankingTable(filteredAndSortedData);
 */

import { elements } from '../core/domElements';
import { state } from '../state';
import { getText } from '../core/i18n';
import { NUMERIC_FORMATTER, setStatus } from '../utils/helpers'; // Assuming helpers holds the formatter
import { CORE_COLUMNS } from '../config';

/**
 * Renders the main ranking table on the dashboard.
 *
 * @param {Array<object>} playersData - The filtered and sorted player data to display.
 */
export function renderRankingTable(playersData) {
    console.log("Rendering ranking table...");
    if (!elements.rankingTableBody) return;

    const tableBody = elements.rankingTableBody;
    tableBody.innerHTML = ''; // Clear previous content

    if (!playersData || playersData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-12 text-slate-500">${getText('table.noDataFound')}</td></tr>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    playersData.forEach((player, index) => {
        const rank = index + 1;
        const row = document.createElement('tr');
        row.className = 'odd:bg-transparent even:bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors duration-150';
        row.setAttribute('data-player-id', player.PLAYER);
        row.innerHTML = `
            <td class="px-4 py-2 whitespace-nowrap text-right text-sm text-slate-400">${rank}</td>
            <td class="px-6 py-2 whitespace-nowrap font-medium text-foreground">${player.PLAYER}</td>
            <td class="px-6 py-2 whitespace-nowrap text-right">${NUMERIC_FORMATTER.format(player.TOTAL_SCORE ?? 0)}</td>
            <td class="px-6 py-2 whitespace-nowrap text-right">${NUMERIC_FORMATTER.format(player.CHEST_COUNT ?? 0)}</td>
        `;
        // Add click listener to navigate to player detail view
        // row.addEventListener('click', () => showPlayerDetail(player.PLAYER)); // TODO: Implement this connection
        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
    console.log("Ranking table rendered.");
}

/**
 * Renders the top N players by chest count widget on the dashboard.
 *
 * @param {Array<object>} allPlayers - All processed player data.
 */
export function renderTopChestsTable(allPlayers) {
    console.log("Rendering top chests table...");
    if(!elements.topChestsTableBody) return;

    const tableBody = elements.topChestsTableBody;
    tableBody.innerHTML = '';

    try {
        const topPlayers = [...allPlayers].sort((a, b) => (b.CHEST_COUNT || 0) - (a.CHEST_COUNT || 0)).slice(0, 5);
        if (topPlayers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-slate-500 text-xs">${getText('table.noData')}</td></tr>`;
            return;
        }
        const fragment = document.createDocumentFragment();
        topPlayers.forEach(player => {
            const row = document.createElement('tr');
            row.className = 'odd:bg-transparent even:bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors duration-150';
            row.setAttribute('data-player-id', player.PLAYER);
            row.innerHTML = `
                <td class="px-3 py-2 whitespace-nowrap font-medium truncate text-sm" title="${player.PLAYER}">${player.PLAYER}</td>
                <td class="px-3 py-2 whitespace-nowrap text-right text-sm">${NUMERIC_FORMATTER.format(player.CHEST_COUNT || 0)}</td>
            `;
             // Add click listener
            // row.addEventListener('click', () => showPlayerDetail(player.PLAYER)); // TODO: Implement this connection
            fragment.appendChild(row);
        });
        tableBody.appendChild(fragment);
        console.log("Top chests table rendered.");
    } catch (error) {
        console.error("Error in renderTopChestsTable:", error);
        setStatus(getText('status.renderError'), 'error', 5000);
        tableBody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-red-500 text-xs">${getText('status.renderError')}</td></tr>`;
    }
}

/**
 * Updates the sort icon in a table header column.
 *
 * @param {HTMLElement} headerCell - The header cell element (TH) that was clicked.
 * @param {'asc'|'desc'} direction - The new sort direction.
 */
export function updateSortIcon(headerCell, direction) {
    // Clear icons from all headers first
    const allHeaders = headerCell.closest('thead').querySelectorAll('th[data-column]');
    allHeaders.forEach(th => {
        const icon = th.querySelector('.sort-icon');
        if (icon) icon.innerHTML = ''; // Clear content
    });

    // Set the icon for the clicked header
    const icon = headerCell.querySelector('.sort-icon');
    if (icon) {
        icon.innerHTML = direction === 'asc' ? '▲' : '▼';
        // Optionally add classes for styling
        icon.classList.add('text-primary');
    }
}

/**
 * Renders the detailed data table.
 *
 * @param {Array<object>} playersData - Filtered and sorted data for the detailed view.
 * @param {Array<string>} visibleColumns - Array of column keys to display.
 */
export function renderDetailedTable(playersData, visibleColumns) {
    console.log("Rendering detailed table...");
    if (!elements.detailedTableBody || !elements.detailedTableHeader) {
        console.error('Detailed table body or header element not found.');
        return;
    }

    const tableBody = elements.detailedTableBody;
    const tableHeader = elements.detailedTableHeader;
    tableBody.innerHTML = '';
    tableHeader.innerHTML = ''; // Clear and rebuild header

    if (!playersData || playersData.length === 0) {
        const colSpan = visibleColumns.length > 0 ? visibleColumns.length : 1;
        tableHeader.innerHTML = `<tr><th class="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">${getText('table.headerPlayer')}</th></tr>`;
        tableBody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center py-12 text-slate-500">${getText('table.noDataFound')}</td></tr>`;
        return;
    }

    // --- Render Header ---
    const headerFragment = document.createDocumentFragment();
    const headerRow = document.createElement('tr');

    visibleColumns.forEach(columnKey => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.className = 'px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider cursor-pointer hover:bg-slate-700 transition-colors duration-150';
        th.dataset.column = columnKey;
        th.innerHTML = `${columnKey.replace(/_/g, ' ')} <span class="sort-icon inline-block w-3"></span>`;

        // Add sort icon if it's the currently sorted column
        if (columnKey === state.currentSort.column) {
             const icon = th.querySelector('.sort-icon');
             if (icon) icon.innerHTML = state.currentSort.direction === 'asc' ? '▲' : '▼';
        }
        headerRow.appendChild(th);
    });
    headerFragment.appendChild(headerRow);
    tableHeader.appendChild(headerFragment);

    // --- Render Body ---
    const bodyFragment = document.createDocumentFragment();
    playersData.forEach(player => {
        const row = document.createElement('tr');
        row.className = 'odd:bg-transparent even:bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors duration-150';
         row.setAttribute('data-player-id', player.PLAYER);

        visibleColumns.forEach(columnKey => {
            const td = document.createElement('td');
            td.className = 'px-4 py-2 whitespace-nowrap text-sm';
            const value = player[columnKey];

            if (columnKey === 'PLAYER') {
                td.classList.add('font-medium', 'text-foreground');
                td.textContent = value;
            } else if (typeof value === 'number') {
                td.classList.add('text-right');
                td.textContent = NUMERIC_FORMATTER.format(value);
            } else {
                td.textContent = value ?? '-'; // Display '-' for null/undefined
                td.classList.add('text-slate-400');
            }
            row.appendChild(td);
        });
          // Add click listener
         // row.addEventListener('click', () => showPlayerDetail(player.PLAYER)); // TODO: Implement this connection
        bodyFragment.appendChild(row);
    });

    tableBody.appendChild(bodyFragment);
    console.log("Detailed table rendered.");
}


/**
 * Renders the score rules table.
 *
 * @param {Array<object>} rulesData - The score rules data.
 */
export function renderRulesTable(rulesData) {
    console.log("Rendering score rules table...");
    if (!elements.scoreRulesTableBody) return;

    const tableBody = elements.scoreRulesTableBody;
    tableBody.innerHTML = ''; // Clear previous content

    if (!rulesData || rulesData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="2" class="text-center py-12 text-slate-500">${getText('scoreSystem.noRulesLoaded')}</td></tr>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    // Sort rules alphabetically by Category for consistent display
    const sortedRules = [...rulesData].sort((a, b) => String(a.Category).localeCompare(String(b.Category)));

    sortedRules.forEach(rule => {
        const row = document.createElement('tr');
        row.className = 'odd:bg-transparent even:bg-slate-800/50';
        row.innerHTML = `
            <td class="px-6 py-3 whitespace-nowrap font-medium text-foreground">${String(rule.Category || 'N/A').replace(/_/g, ' ')}</td>
            <td class="px-6 py-3 whitespace-nowrap text-right">${NUMERIC_FORMATTER.format(Number(rule.Score_Per_Unit) || 0)}</td>
        `;
        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
    console.log("Score rules table rendered.");
}

/**
 * Renders the category ranking table in the Analytics view.
 *
 * @param {Array<object>} categoryData - Player data filtered for a specific category and sorted.
 * @param {string} category - The category key.
 */
export function renderCategoryRankingTable(categoryData, category) {
     console.log(`Rendering category ranking for: ${category}`);
     if(!elements.categoryRankingBody) return;

     const tableBody = elements.categoryRankingBody;
     tableBody.innerHTML = '';

     if (categoryData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-slate-500">${getText('table.noData')}</td></tr>`;
        return;
     }

     const fragment = document.createDocumentFragment();
     categoryData.forEach(player => {
        const row = document.createElement('tr');
        row.className = 'odd:bg-transparent even:bg-slate-800/50';
        row.innerHTML = `
            <td class="px-4 py-2 whitespace-nowrap font-medium text-sm">${player.PLAYER}</td>
            <td class="px-4 py-2 whitespace-nowrap text-right text-sm">${NUMERIC_FORMATTER.format(player[category] ?? 0)}</td>
        `;
        fragment.appendChild(row);
     });
     tableBody.appendChild(fragment);
     console.log("Category ranking table rendered.");
}

/**
 * Creates and manages the column visibility toggle buttons for the detailed table.
 *
 * @param {Array<string>} allHeaders - All available column headers.
 * @param {Array<string>} initiallyVisible - Columns visible by default.
 * @param {Function} onVisibilityChange - Callback function triggered when visibility changes.
 * @returns {{ getVisibleColumns: () => Array<string> }} - An object with a function to get currently visible columns.
 */
export function setupColumnToggle(allHeaders, initiallyVisible, onVisibilityChange) {
    if (!elements.columnToggleButtonContainer) return { getVisibleColumns: () => initiallyVisible };

    const container = elements.columnToggleButtonContainer;
    container.innerHTML = ''; // Clear previous buttons
    let currentVisibleColumns = new Set(initiallyVisible);

    // Exclude core columns from being toggled off
    const nonToggleable = new Set(CORE_COLUMNS);

    allHeaders.forEach(header => {
        if (!header) return; // Skip empty headers

        const button = document.createElement('button');
        const isVisible = currentVisibleColumns.has(header);
        const canToggle = !nonToggleable.has(header);

        button.textContent = header.replace(/_/g, ' ');
        button.dataset.column = header;
        button.className = `px-2 py-1 border text-xs rounded-md transition-colors duration-150 ${ 
            isVisible 
                ? 'bg-primary/20 border-primary/50 text-primary' 
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
            } ${!canToggle ? 'opacity-50 cursor-not-allowed' : ''}`;

        if (canToggle) {
            button.addEventListener('click', () => {
                if (currentVisibleColumns.has(header)) {
                    currentVisibleColumns.delete(header);
                    button.classList.remove('bg-primary/20', 'border-primary/50', 'text-primary');
                    button.classList.add('bg-slate-700', 'border-slate-600', 'text-slate-300', 'hover:bg-slate-600');
                } else {
                    currentVisibleColumns.add(header);
                    button.classList.add('bg-primary/20', 'border-primary/50', 'text-primary');
                    button.classList.remove('bg-slate-700', 'border-slate-600', 'text-slate-300', 'hover:bg-slate-600');
                }
                onVisibilityChange(Array.from(currentVisibleColumns));
            });
        } else {
            button.disabled = true;
            button.title = getText('detailedTable.columnRequired'); // Add tooltip
        }

        container.appendChild(button);
    });

    return {
        getVisibleColumns: () => Array.from(currentVisibleColumns)
    };
} 