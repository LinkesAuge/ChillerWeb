/**
 * playerDetailView.js
 *
 * Description: Handles rendering logic for the individual Player Detail view.
 * Usage:
 *  import { renderPlayerDetailView, setupPlayerDetailListeners } from './playerDetailView';
 *  renderPlayerDetailView(playerData);
 *  setupPlayerDetailListeners();
 */

import { elements } from '../core/domElements';
import { state, updateState } from '../state';
import { renderPlayerChart } from '../components/chartManager';
import { getText } from '../core/i18n';
import { NUMERIC_FORMATTER, formatNumber } from '../utils/helpers'; // Assuming formatNumber is a more general version
import { CORE_COLUMNS } from '../config';
import { showView } from '../core/uiManager'; // For the back button

/**
 * Renders the detailed statistics table for a single player.
 *
 * @param {object} playerData - The data object for the player.
 */
function renderPlayerStatsTable(playerData) {
    if (!elements.playerStatsContainer) return;

    const container = elements.playerStatsContainer;
    container.innerHTML = ''; // Clear previous stats

    if (!playerData) {
        container.innerHTML = `<p class="text-slate-400 text-center">${getText('status.noPlayerData')}</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    const sortedKeys = Object.keys(playerData)
        .filter(key => !CORE_COLUMNS.includes(key) && typeof playerData[key] === 'number' && playerData[key] > 0)
        .sort((a, b) => (playerData[b] ?? 0) - (playerData[a] ?? 0)); // Sort by value desc

    sortedKeys.forEach(key => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center py-2 border-b border-slate-700/50 text-sm';
        div.innerHTML = `
            <span class="text-slate-300">${key.replace(/_/g, ' ')}</span>
            <span class="font-medium text-foreground">${NUMERIC_FORMATTER.format(playerData[key] ?? 0)}</span>
        `;
        fragment.appendChild(div);
    });

    if (sortedKeys.length === 0) {
         container.innerHTML = `<p class="text-slate-400 text-center py-4">${getText('playerDetail.noDetailedStats')}</p>`;
    }

    container.appendChild(fragment);
}

/**
 * Renders the player detail view.
 *
 * @param {object | null} playerData - The data for the player to display, or null.
 */
export function renderPlayerDetailView(playerData) {
    console.log(`Rendering Player Detail View for: ${playerData?.PLAYER || 'N/A'}`);
    if (!elements.playerDetailSection) {
        console.error("Player detail section element not found!");
        return;
    }

    updateState({ selectedPlayer: playerData }); // Update state

    if (!playerData) {
        // Handle case where player data is not found (e.g., after refresh or bad link)
        if (elements.playerDetailName) elements.playerDetailName.textContent = getText('status.playerNotFound');
        if (elements.playerStatsContainer) elements.playerStatsContainer.innerHTML = `<p class="text-red-500 text-center">${getText('status.playerNotFound')}</p>`;
        if (elements.playerChartContainer) elements.playerChartContainer.innerHTML = '';
        // Disable download buttons
        if (elements.downloadCsvPlayerButton) elements.downloadCsvPlayerButton.disabled = true;
        if (elements.downloadJsonPlayerButton) elements.downloadJsonPlayerButton.disabled = true;
        return;
    }

    // Update player name
    if (elements.playerDetailName) elements.playerDetailName.textContent = playerData.PLAYER;

    // Render stats table
    renderPlayerStatsTable(playerData);

    // Render player chart
    if (elements.playerChartContainer) {
        renderPlayerChart(
            elements.playerChartContainer.id,
            'playerDetail', // Unique key
            playerData
        );
    }
    
    // Enable download buttons
     if (elements.downloadCsvPlayerButton) elements.downloadCsvPlayerButton.disabled = false;
     if (elements.downloadJsonPlayerButton) elements.downloadJsonPlayerButton.disabled = false;

    console.log("Player Detail View rendering complete.");
}

/**
 * Finds a player by name from the dataset.
 *
 * @param {string} playerName - The name of the player to find.
 * @returns {object | null} The player data object or null if not found.
 */
export function findPlayerByName(playerName) {
    if (!playerName || !state.allPlayersData) return null;
    return state.allPlayersData.find(p => p.PLAYER === playerName) || null;
}

/**
 * Handles clicks on table rows to show player details.
 * @param {Event} event The click event.
 */
function handleTableRowClick(event) {
    const row = event.target.closest('tr[data-player-id]');
    if (!row) return;
    const playerName = row.dataset.playerId;
    if (!playerName) return;

    console.log(`Table row clicked for player: ${playerName}`);
    const playerData = findPlayerByName(playerName);
    if (playerData) {
        renderPlayerDetailView(playerData);
        showView('player-detail');
    } else {
        console.warn(`Player data not found for ${playerName}`);
        // Optionally show an error message
    }
}


/**
 * Sets up event listeners specific to the Player Detail view (back button) and table clicks.
 */
export function setupPlayerDetailListeners() {
    // Back button
    if (elements.playerDetailBackButton && !elements.playerDetailBackButton.hasAttribute('data-listener-added')) {
        elements.playerDetailBackButton.addEventListener('click', () => {
            // Go back to the previous view (likely dashboard or detailed table)
            // For simplicity, let's default to dashboard for now
            showView(state.previousView || 'dashboard'); // Assumes previousView is tracked in state
        });
        elements.playerDetailBackButton.setAttribute('data-listener-added', 'true');
    }

    // Add listeners to table bodies for row clicks (using event delegation)
     if (elements.rankingTableBody && !elements.rankingTableBody.hasAttribute('data-listener-added')) {
         elements.rankingTableBody.addEventListener('click', handleTableRowClick);
         elements.rankingTableBody.setAttribute('data-listener-added', 'true');
     }
      if (elements.detailedTableBody && !elements.detailedTableBody.hasAttribute('data-listener-added')) {
         elements.detailedTableBody.addEventListener('click', handleTableRowClick);
         elements.detailedTableBody.setAttribute('data-listener-added', 'true');
     }
     // Add listener for top chests widget too
      if (elements.topChestsTableBody && !elements.topChestsTableBody.hasAttribute('data-listener-added')) {
         elements.topChestsTableBody.addEventListener('click', handleTableRowClick);
         elements.topChestsTableBody.setAttribute('data-listener-added', 'true');
     }

    // Listeners for download buttons are typically added in the main event listener setup
    // as they relate to the currently selected player in the state.

     console.log("Player detail listeners setup.");
} 