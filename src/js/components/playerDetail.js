/**
 * playerDetail.js
 *
 * Description: Handles rendering the player detail view/modal.
 * Usage:
 *     import { showPlayerDetail } from './components/playerDetail.js';
 *     showPlayerDetail(playerId);
 */

import { getState } from '../core/state.js';
import { getTranslation } from '../core/i18n.js';
import { $, $$ } from '../utils/dom.js';
import { formatNumber, formatPercentage, formatDate } from '../utils/formatters.js';
// Import chart renderer if displaying player-specific charts
// import { renderChart, destroyChart } from './charts.js';

// --- Constants for Selectors (assuming a modal structure) ---
const MODAL_SELECTOR = '#player-detail-modal';
const MODAL_CLOSE_BUTTON_SELECTOR = '#player-detail-close-button';
const MODAL_CONTENT_SELECTOR = '#player-detail-content';
const PLAYER_NAME_SELECTOR = '#detail-player-name';
// Add selectors for all other elements within the player detail view/modal

/**
 * Finds a player by their ID in the processed data.
 *
 * Args:
 *     playerId (string | number): The ID of the player to find.
 *
 * Returns:
 *     object | undefined: The player object or undefined if not found.
 */
function getPlayerById(playerId) {
    const players = getState('processedPlayersData') || [];
    // Ensure comparison is done correctly (e.g., string vs number)
    const idToCompare = String(playerId);
    return players.find(player => String(player.ID) === idToCompare);
}

/**
 * Populates the player detail modal/view with data.
 *
 * Args:
 *     player (object): The player data object.
 */
function populatePlayerDetail(player) {
    const modalContent = $(MODAL_CONTENT_SELECTOR);
    if (!modalContent) {
        console.error("Player Detail: Modal content container not found.");
        return;
    }

    console.log(`Populating details for player: ${player['Spieler Name']}`);

    // Update basic info
    const nameElement = $(PLAYER_NAME_SELECTOR, modalContent);
    if (nameElement) nameElement.textContent = player['Spieler Name'] || 'N/A';

    // TODO: Populate all other fields in the modal/view
    // Example:
    // const scoreElement = $('#detail-score', modalContent);
    // if (scoreElement) scoreElement.textContent = formatNumber(player['Gesamtwertung']);
    // const winRateElement = $('#detail-winrate', modalContent);
    // if (winRateElement) winRateElement.textContent = formatPercentage(player['Winrate']);

    // TODO: Render player-specific charts if applicable
    // Example:
    // const playerScoreHistory = player.scoreHistory; // Assuming data structure
    // renderChart('player-score-chart', [{ name: 'Score', data: playerScoreHistory }], { /* options */ });

    console.log("Player detail population complete (placeholders for specific fields/charts).");
}

/**
 * Shows the player detail view/modal for a specific player.
 *
 * Args:
 *     playerId (string | number): The ID of the player to display.
 */
export function showPlayerDetail(playerId) {
    const player = getPlayerById(playerId);
    const modal = $(MODAL_SELECTOR);

    if (!modal) {
        console.error("Player Detail: Modal element not found.");
        return;
    }

    if (!player) {
        console.error(`Player Detail: Player with ID ${playerId} not found.`);
        // Optionally display an error within the modal or a separate message
        const content = $(MODAL_CONTENT_SELECTOR);
        if (content) {
            content.innerHTML = `<p class="text-red-500 text-center p-4">${getTranslation('error.playerNotFound', 'Player not found.')}</p>`;
        }
        modal.classList.remove('hidden'); // Show modal to display the error
        return;
    }

    populatePlayerDetail(player);
    modal.classList.remove('hidden');

    // Optional: Add class to body to prevent background scrolling
    document.body.classList.add('overflow-hidden');
}

/**
 * Hides the player detail modal/view.
 */
function hidePlayerDetail() {
    const modal = $(MODAL_SELECTOR);
    if (modal) {
        modal.classList.add('hidden');
        // Optional: Destroy player-specific charts
        // destroyChart('player-score-chart');
        // Optional: Remove body class
        document.body.classList.remove('overflow-hidden');
        console.log("Player detail modal hidden.");
    }
}

/**
 * Initializes the player detail component.
 * Sets up event listener for the close button.
 */
export function initializePlayerDetail() {
    console.log("Initializing player detail component...");
    const closeButton = $(MODAL_CLOSE_BUTTON_SELECTOR);
    if (closeButton) {
        closeButton.addEventListener('click', hidePlayerDetail);
    } else {
        console.warn("Player Detail: Close button not found.");
    }

    // Optional: Add listener to close modal on background click or Escape key
    const modal = $(MODAL_SELECTOR);
    if (modal) {
        modal.addEventListener('click', (event) => {
            // Close only if the click is directly on the modal background
            if (event.target === modal) {
                hidePlayerDetail();
            }
        });
        // Consider adding keydown listener to document for Escape key
    }

    console.log("Player detail component initialized.");
}

// Initial setup
// initializePlayerDetail(); // Call from main or relevant view module 