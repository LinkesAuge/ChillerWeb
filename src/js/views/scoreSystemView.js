/**
 * scoreSystemView.js
 *
 * Description: Handles rendering logic for the Score System view.
 * Usage:
 *  import { renderScoreSystemView } from './scoreSystemView';
 *  renderScoreSystemView(scoreRulesData);
 */

import { elements } from '../core/domElements';
import { renderRulesTable } from '../components/tableManager';

/**
 * Renders the score system view, primarily displaying the rules table.
 *
 * @param {Array<object>} scoreRules - The score rules data.
 */
export function renderScoreSystemView(scoreRules) {
    console.log("Rendering Score System View...");
    if (!elements.scoreSystemSection) {
        console.error("Score system section element not found!");
        return;
    }

    // The main content is the rules table
    renderRulesTable(scoreRules);

    console.log("Score System View rendering complete.");
} 