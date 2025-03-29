/**
 * scoreSystem.js
 *
 * Description: Handles rendering the display of the scoring rules.
 * Usage:
 *     import { renderScoreSystem } from './components/scoreSystem.js';
 *     renderScoreSystem(); // Call when the relevant view is shown
 */

import { getState } from '../core/state.js';
import { getTranslation } from '../core/i18n.js';
import { $, $$ } from '../utils/dom.js';
import { formatNumber } from '../utils/formatters.js';

// --- Constants for Selectors ---
const SCORE_RULES_CONTAINER_SELECTOR = '#score-rules-table-container'; // Assuming a table container
const SCORE_RULES_BODY_SELECTOR = '#score-rules-table-body'; // Assuming a tbody

/**
 * Generates the HTML for a single score rule row.
 *
 * Args:
 *     key (string): The key/name of the scoring rule.
 *     value (any): The value of the scoring rule.
 *
 * Returns:
 *     string: HTML string for the table row (<tr>...</tr>).
 */
function createRuleRow(key, value) {
    // Attempt to get a translated description for the key, fallback to the key itself
    const descriptionKey = `scoreRules.description.${key}`; // e.g., scoreRules.description.pointsPerKill
    const description = getTranslation(descriptionKey, key); // Fallback to key name

    // Format the value appropriately
    const formattedValue = typeof value === 'number' ? formatNumber(value) : String(value);

    return `
        <tr class="border-b border-border">
            <td class="p-2 font-medium">${description}</td>
            <td class="p-2 text-right">${formattedValue}</td>
        </tr>
    `;
}

/**
 * Renders the scoring rules display (e.g., in a table).
 */
export function renderScoreSystem() {
    const rulesContainer = $(SCORE_RULES_CONTAINER_SELECTOR);
    const tableBody = $(SCORE_RULES_BODY_SELECTOR);
    const scoreRules = getState('scoreRules');

    if (!tableBody) {
        console.error("Score System: Table body element not found.");
        if (rulesContainer) {
            rulesContainer.innerHTML = `<p class="text-red-500 text-center p-4">${getTranslation('error.scoreRulesRender', 'Failed to find score rules table body.')}</p>`;
        }
        return;
    }

    if (!scoreRules || Object.keys(scoreRules).length === 0) {
        console.warn("Score System: No score rules found in state.");
        tableBody.innerHTML = `
            <tr>
                <td colspan="2" class="p-4 text-center text-muted-foreground">${getTranslation('scoreRules.noRulesLoaded', 'Scoring rules not loaded.')}</td>
            </tr>
        `;
        return;
    }

    console.log("Rendering score system rules...");

    try {
        // Generate rows for each rule
        const rulesHtml = Object.entries(scoreRules)
            .map(([key, value]) => createRuleRow(key, value))
            .join('');
        tableBody.innerHTML = rulesHtml;
    } catch (error) {
        console.error("Error generating score rules table:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="2" class="p-4 text-center text-red-500">${getTranslation('error.scoreRulesRender', 'Error rendering score rules.')}</td>
            </tr>
        `;
    }

    console.log("Score system rendering complete.");
}

/**
 * Initializes the score system component (if needed).
 * Currently, rendering is triggered when the view is shown.
 */
export function initializeScoreSystem() {
    console.log("Initializing score system component...");
    // Add any specific setup if required
    console.log("Score system component initialized.");
}

// Initial setup (usually called when view becomes active)
// renderScoreSystem(); 