/**
 * charts.js
 *
 * Description: Handles creation, rendering, and updating of ApexCharts.
 * Usage:
 *     import { initializeCharts, renderChart } from './components/charts.js';
 *     initializeCharts(); // Setup common options
 *     renderChart('scoreDistributionChart', chartData, chartOptions);
 */

import ApexCharts from 'apexcharts';
import { getState } from '../core/state.js';
import { getTranslation } from '../core/i18n.js';
import { $ } from '../utils/dom.js'; // For selecting chart container elements
import { formatNumber, formatDate } from '../utils/formatters.js';

// Store chart instances to manage updates and destruction
const chartInstances = {};

// Default options common to most charts
let defaultChartOptions = {
    chart: {
        type: 'bar',
        height: 350,
        toolbar: {
            show: true,
            tools: {
                download: true,
                selection: false,
                zoom: false,
                zoomin: false,
                zoomout: false,
                pan: false,
                reset: true
            },
        },
        background: 'transparent' // Use transparent background
    },
    theme: {
        mode: getState('currentTheme') || 'dark', // Use theme from state
        palette: 'palette1' // Example palette
    },
    // Responsive adjustments can be added here
    responsive: [{
        breakpoint: 640, // Example for small screens
        options: {
            chart: {
                height: 300
            },
            legend: {
                position: 'bottom'
            }
        }
    }]
    // Add other common options like plotOptions, dataLabels, stroke, xaxis, yaxis, legend, tooltip etc.
    // Customize these based on the original chart appearance
};

/**
 * Merges default options with chart-specific options.
 *
 * Args:
 *     specificOptions (object): Options specific to the chart being rendered.
 *
 * Returns:
 *     object: Merged chart options.
 */
function getChartOptions(specificOptions) {
    // Deep merge would be better for nested objects, but shallow works for this structure
    return { ...defaultChartOptions, ...specificOptions };
}

/**
 * Renders or updates an ApexChart instance.
 *
 * Args:
 *     chartId (string): The ID of the container element for the chart.
 *     series (array): The data series for the chart.
 *     options (object): Chart-specific options to merge with defaults.
 */
export function renderChart(chartId, series, options = {}) {
    const chartElement = $("#" + chartId);
    if (!chartElement) {
        console.error(`Chart container element #${chartId} not found.`);
        return;
    }

    const mergedOptions = getChartOptions({
        chart: {
            ...defaultChartOptions.chart,
            height: options.chart?.height || defaultChartOptions.chart.height, // Allow override height
            type: options.chart?.type || defaultChartOptions.chart.type, // Allow override type
        },
        series: series,
        // Merge other specific options deep if necessary
        xaxis: options.xaxis,
        yaxis: options.yaxis,
        labels: options.labels,
        colors: options.colors,
        // ... other potential overrides
    });

    // Update theme mode dynamically before rendering/updating
    mergedOptions.theme.mode = getState('currentTheme') || 'dark';

    try {
        if (chartInstances[chartId]) {
            // Update existing chart
            console.log(`Updating chart: #${chartId}`);
            chartInstances[chartId].updateOptions(mergedOptions);
            // chartInstances[chartId].updateSeries(series); // updateOptions usually handles series too
        } else {
            // Create new chart instance
            console.log(`Creating chart: #${chartId}`);
            chartInstances[chartId] = new ApexCharts(chartElement, mergedOptions);
            chartInstances[chartId].render();
        }
    } catch (error) {
        console.error(`Error rendering/updating chart #${chartId}:`, error);
        // Clean up potentially broken instance
        if (chartInstances[chartId]) {
            chartInstances[chartId].destroy();
            delete chartInstances[chartId];
        }
        chartElement.innerHTML = `<p class="text-red-500 text-center p-4">${getTranslation('error.chartRender', 'Failed to render chart.')}</p>`;
    }
}

/**
 * Initializes common chart settings.
 * (Currently just setting default options, could do more).
 */
export function initializeCharts() {
    console.log("Initializing charts module...");
    // Update default options based on initial state if needed
    defaultChartOptions.theme.mode = getState('currentTheme') || 'dark';
    console.log("Charts module initialized.");
}

/**
 * Destroys a specific chart instance or all instances.
 *
 * Args:
 *     chartId (string|null): ID of the chart to destroy, or null/undefined to destroy all.
 */
export function destroyChart(chartId = null) {
    if (chartId && chartInstances[chartId]) {
        console.log(`Destroying chart: #${chartId}`);
        chartInstances[chartId].destroy();
        delete chartInstances[chartId];
    } else if (chartId === null) {
        console.log("Destroying all charts...");
        Object.keys(chartInstances).forEach(id => {
            chartInstances[id].destroy();
            delete chartInstances[id];
        });
    }
}

// --- Theme Change Listener ---
// TODO: Need a way to subscribe to state changes or use events.
// For now, theme is checked before each render/update.
// Example using a hypothetical event system:
// document.addEventListener('themeChanged', (event) => {
//     console.log('Theme changed, updating charts...');
//     defaultChartOptions.theme.mode = event.detail.newTheme;
//     Object.keys(chartInstances).forEach(id => {
//         if (chartInstances[id]) {
//             chartInstances[id].updateOptions({ theme: { mode: event.detail.newTheme } });
//         }
//     });
// });

// Initial setup
// initializeCharts(); // Can be called from main.js if needed 