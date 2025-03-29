/**
 * chartManager.js
 *
 * Description: Handles the creation, rendering, and updating of ApexCharts instances.
 * Usage:
 *  import { renderDashboardCharts, renderPlayerChart, destroyAllCharts } from './chartManager';
 *  renderDashboardCharts(playerData);
 */

import ApexCharts from 'apexcharts';
import { elements } from '../core/domElements';
import { state } from '../state';
import { getText } from '../core/i18n';
import { NUMERIC_FORMATTER, getCssVariableValue } from '../utils/helpers';
import { CORE_COLUMNS } from '../config';

// Store chart instances to manage updates and destruction
const chartInstances = {
    dashboardTopSources: null,
    dashboardDistribution: null,
    dashboardScoreVsChests: null,
    dashboardFrequentSources: null,
    chartsTopSources: null,
    chartsDistribution: null,
    chartsScoreVsChests: null,
    chartsFrequentSources: null,
    analyticsCategory: null,
    playerDetail: null,
    modal: null, // Single instance for the modal
};

/**
 * Destroys a specific chart instance if it exists.
 * @param {string} key - The key of the chart instance in chartInstances.
 */
function destroyChart(key) {
    if (chartInstances[key]) {
        try {
            chartInstances[key].destroy();
             console.log(`Chart instance destroyed: ${key}`);
        } catch (e) {
            console.warn(`Error destroying chart instance ${key}:`, e);
        }
        chartInstances[key] = null;
    }
}

/**
 * Destroys all managed chart instances.
 */
export function destroyAllCharts() {
    console.log("Destroying all chart instances...");
    Object.keys(chartInstances).forEach(key => {
        destroyChart(key);
    });
     console.log("All chart instances destroyed.");
}

/**
 * Gets the base configuration options common to most charts.
 * @returns {object} ApexCharts base options object.
 */
function getChartBaseOptions() {
    try {
        const foregroundColor = `hsl(${getCssVariableValue('--foreground')})`;
        const primaryColor = `hsl(${getCssVariableValue('--primary')})`;
        const secondaryColor = `hsl(${getCssVariableValue('--secondary')})`;
        const gridColor = `hsla(${getCssVariableValue('--border')}, 0.3)`;

        return {
            chart: {
                foreColor: foregroundColor,
                toolbar: { show: true, tools: { download: true } }, // Keep download tool
                background: 'transparent',
                zoom: { enabled: false }, // Disable zoom by default, enable per chart if needed
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 500,
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                }
            },
            theme: { mode: 'dark', palette: 'palette1' }, // Use default palette
            grid: { borderColor: gridColor },
            tooltip: {
                theme: 'dark',
                style: { fontSize: '12px' },
                x: { formatter: (val) => val },
                y: { formatter: (val) => val !== undefined && val !== null ? NUMERIC_FORMATTER.format(val) : '' }
            },
            colors: [primaryColor, secondaryColor, '#00E396', '#FEB019', '#775DD0', '#FF4560', '#008FFB'], // Standard color palette
            xaxis: {
                labels: {
                    style: { colors: foregroundColor },
                    trim: true,
                    rotate: -45,
                    rotateAlways: false,
                    hideOverlappingLabels: true,
                    maxHeight: 80 // Adjust as needed
                },
                tooltip: { enabled: false },
                 axisBorder: { show: true, color: gridColor },
                 axisTicks: { show: true, color: gridColor },
            },
            yaxis: {
                labels: {
                    style: { colors: foregroundColor },
                    formatter: function (val) {
                        if (val === null || val === undefined) return '';
                        // Use K/M notation for large numbers
                        if (Math.abs(val) >= 1000000) return (val / 1000000).toFixed(1) + 'M';
                        if (Math.abs(val) >= 1000) return (val / 1000).toFixed(0) + 'K';
                        return NUMERIC_FORMATTER.format(val);
                    }
                },
                axisBorder: { show: false }, // Cleaner look
                axisTicks: { show: true, color: gridColor },
            },
            dataLabels: { enabled: false }, // Keep disabled by default
            noData: {
                text: getText('table.noData'), // Use translated text
                align: 'center',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: foregroundColor,
                    fontSize: '14px',
                    fontFamily: undefined
                }
            }
        };
    } catch (e) {
        console.error("Error in getChartBaseOptions:", e);
        // Return minimal defaults if CSS variables fail
        return {
             chart: { toolbar: { show: true, tools: { download: true } } },
             theme: { mode: 'dark'},
             noData: { text: 'Loading Error' }
            };
    }
}

/**
 * Renders a chart, handling instance destruction, loading state, and errors.
 *
 * @param {string} key - The key for storing the chart instance.
 * @param {string} containerId - The ID of the DOM element to render the chart in.
 * @param {object} options - The ApexCharts configuration options.
 * @param {Function} [preRenderCheck=null] - Optional function to run before rendering (e.g., check data).
 */
async function renderChart(key, containerId, options, preRenderCheck = null) {
    console.log(`Attempting to render chart: ${key} in #${containerId}`);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Chart container not found: #${containerId}`);
        return;
    }

    destroyChart(key); // Ensure previous instance is removed
    container.innerHTML = '<div class="spinner mx-auto my-8"></div>'; // Show loading spinner

    if (preRenderCheck && !preRenderCheck()) {
         console.warn(`Pre-render check failed for chart ${key}. Rendering stopped.`);
         container.innerHTML = `<p class="text-slate-500 text-sm text-center py-8">${getText('table.noData')}</p>`; // Or specific message
         return;
    }

    try {
        chartInstances[key] = new ApexCharts(container, options);
        await chartInstances[key].render();
        console.log(`Chart rendered successfully: ${key}`);
        // Remove spinner after render (may already be gone if render is fast)
        container.querySelector('.spinner')?.remove();
    } catch (e) {
        console.error(`Error rendering chart ${key} in #${containerId}:`, e);
        container.innerHTML = `<p class="text-red-500 text-sm text-center py-8">${getText('status.chartError')}</p>`;
        destroyChart(key); // Clean up failed instance
    }
}


// --- Specific Chart Rendering Functions ---

/**
 * Renders the "Top Sources by Score" Donut Chart.
 * @param {string} containerId - The target container element ID.
 * @param {string} instanceKey - The key to use for managing this chart instance.
 * @param {Array<object>} playersData - The dataset to use.
 */
export function renderTopSourcesChart(containerId, instanceKey, playersData) {
    const categoryScores = {};
    playersData.forEach(player => {
        Object.keys(player).forEach(key => {
            if (!CORE_COLUMNS.includes(key) && typeof player[key] === 'number' && player[key] > 0) {
                categoryScores[key] = (categoryScores[key] || 0) + player[key];
            }
        });
    });

    const sortedCategories = Object.entries(categoryScores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
    const topN = 7;
    let topCategoriesData = sortedCategories.slice(0, topN);
    let otherScore = sortedCategories.slice(topN).reduce((sum, [, score]) => sum + score, 0);

    let chartLabels = topCategoriesData.map(([key]) => key.replace(/_/g, ' '));
    let chartSeries = topCategoriesData.map(([, score]) => score);

    if (otherScore > 0) {
        chartLabels.push(getText('charts.othersCategory'));
        chartSeries.push(otherScore);
    }

    const baseOptions = getChartBaseOptions();
    const options = {
        ...baseOptions,
        chart: {
            ...baseOptions.chart,
            type: 'donut',
            height: (containerId === elements.modalChartContainer?.id || containerId.startsWith('charts-')) ? 350 : 280,
        },
        series: chartSeries,
        labels: chartLabels,
        legend: {
            position: 'bottom',
            fontSize: '11px',
            labels: { colors: baseOptions.chart.foreColor },
            markers: { radius: 2 },
            itemMargin: { horizontal: 5, vertical: 2 }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: getText('table.headerTotalScore'),
                            formatter: (w) => {
                                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                return NUMERIC_FORMATTER.format(total);
                            }
                        }
                    }
                }
            }
        },
        tooltip: {
            ...baseOptions.tooltip,
            y: {
                formatter: (value) => NUMERIC_FORMATTER.format(value),
                title: {
                    formatter: (seriesName, opts) => (opts?.w?.globals?.labels?.[opts.seriesIndex] ?? seriesName)
                }
            }
        },
        xaxis: undefined, // No x-axis for donut
        yaxis: undefined, // No y-axis for donut
    };

    renderChart(instanceKey, containerId, options, () => chartLabels.length > 0);
}

/**
 * Renders the "Score Distribution" Bar Chart.
 * @param {string} containerId - The target container element ID.
 * @param {string} instanceKey - The key to use for managing this chart instance.
 * @param {Array<object>} playersData - The dataset to use.
 */
export function renderScoreDistributionChart(containerId, instanceKey, playersData) {
    const scores = playersData.map(p => p.TOTAL_SCORE || 0);
    const maxScore = Math.max(...scores, 0);
    let bracketSize;
    // Determine bracket size dynamically
     if (maxScore > 1000000) bracketSize = 200000;
     else if (maxScore > 500000) bracketSize = 100000;
     else if (maxScore > 100000) bracketSize = 50000;
     else if (maxScore > 20000) bracketSize = 10000;
     else if (maxScore > 5000) bracketSize = 2500;
     else if (maxScore > 1000) bracketSize = 1000;
     else if (maxScore > 100) bracketSize = 100;
     else bracketSize = Math.max(10, Math.ceil(maxScore / 10)); // Ensure at least size 10 or ~10 brackets

    const numBrackets = Math.max(1, Math.ceil(maxScore / bracketSize));
    const brackets = Array.from({ length: numBrackets }, (_, i) => ({
        min: i * bracketSize,
        max: (i + 1) * bracketSize,
        count: 0
    }));

    scores.forEach(score => {
        for (let i = 0; i < brackets.length; i++) {
            // Ensure the last bracket catches the max score
            if ((i === brackets.length - 1 && score >= brackets[i].min) || (score >= brackets[i].min && score < brackets[i].max)) {
                brackets[i].count++;
                break;
            }
        }
    });

    const chartLabels = brackets.map(b => `${NUMERIC_FORMATTER.format(b.min / 1000)}k-${NUMERIC_FORMATTER.format(b.max / 1000)}k`);
    const chartSeries = brackets.map(b => b.count);

    const baseOptions = getChartBaseOptions();
    const options = {
        ...baseOptions,
        chart: {
            ...baseOptions.chart,
            type: 'bar',
            height: (containerId === elements.modalChartContainer?.id || containerId.startsWith('charts-')) ? 350 : 280
        },
        series: [{ name: getText('dashboard.statPlayers'), data: chartSeries }],
        xaxis: {
            ...baseOptions.xaxis,
            categories: chartLabels,
            labels: {
                ...baseOptions.xaxis.labels,
                style: { ...baseOptions.xaxis.labels.style, fontSize: '10px'},
                rotate: -60 // Rotate more for potentially long labels
            }
        },
        yaxis: {
            ...baseOptions.yaxis,
            title: {
                text: getText('dashboard.statPlayers'),
                style: { fontSize: '10px', color: baseOptions.chart.foreColor }
            },
            labels: {
                ...baseOptions.yaxis.labels,
                formatter: (val) => val !== undefined && val !== null ? Math.round(val).toLocaleString() : '' // Simple count formatting
            }
        },
        plotOptions: {
            bar: { horizontal: false, borderRadius: 2, columnWidth: '80%' }
        },
        tooltip: {
            ...baseOptions.tooltip,
            x: {
                formatter: (val, { dataPointIndex, w }) => {
                     if (w?.globals?.categories?.[dataPointIndex] !== undefined) {
                         return `${getText('table.headerScore')}: ${w.globals.categories[dataPointIndex]}`;
                     }
                     return '';
                 }
            },
            y: {
                 formatter: (val) => val !== undefined && val !== null ? `${NUMERIC_FORMATTER.format(val)} ${getText('dashboard.statPlayers').toLowerCase()}` : ''
             }
        }
    };

     renderChart(instanceKey, containerId, options, () => scores.length > 0);
}

/**
 * Renders the "Score vs. Chests" Scatter Chart.
 * @param {string} containerId - The target container element ID.
 * @param {string} instanceKey - The key to use for managing this chart instance.
 * @param {Array<object>} playersData - The dataset to use.
 */
export function renderScoreVsChestsChart(containerId, instanceKey, playersData) {
     const seriesData = playersData.map(player => ({
        x: player.CHEST_COUNT || 0,
        y: player.TOTAL_SCORE || 0,
        name: player.PLAYER
     })).filter(p => p.x > 0 || p.y > 0); // Filter out players with 0 chests and 0 score

     const baseOptions = getChartBaseOptions();
     const options = {
         ...baseOptions,
         chart: {
            ...baseOptions.chart,
            type: 'scatter',
            height: (containerId === elements.modalChartContainer?.id || containerId.startsWith('charts-')) ? 350 : 280,
            zoom: { enabled: true, type: 'xy' } // Enable zoom for scatter
         },
         series: [{ name: getText('table.headerPlayer'), data: seriesData }],
         xaxis: {
             ...baseOptions.xaxis,
             tickAmount: 8,
             title: {
                 text: getText('table.headerChestCount'),
                 style: { fontSize: '10px', color: baseOptions.chart.foreColor }
             },
             labels: {
                 ...baseOptions.xaxis.labels,
                 formatter: (val) => val !== undefined ? NUMERIC_FORMATTER.format(Math.round(val)) : '',
                 rotate: 0 // No rotation needed for numerical axis usually
             }
         },
         yaxis: {
             ...baseOptions.yaxis,
             tickAmount: 6,
             title: {
                 text: getText('table.headerTotalScore'),
                 style: { fontSize: '10px', color: baseOptions.chart.foreColor }
             }
         },
         tooltip: {
             ...baseOptions.tooltip,
             custom: function({ series, seriesIndex, dataPointIndex, w }) {
                 const dataPoint = w.globals.initialSeries[seriesIndex]?.data[dataPointIndex];
                 if (!dataPoint) return '';
                 const gridColor = `hsla(${getCssVariableValue('--border')}, 0.3)`;
                 return (
                     `<div class="apexcharts-tooltip-title" style="font-size: 12px; background: rgba(0,0,0,0.7); border: 1px solid ${gridColor};">${dataPoint.name || ''}</div>` +
                     `<div class="apexcharts-tooltip-series-group" style="padding:5px 10px; background: rgba(0,0,0,0.6); border: 1px solid ${gridColor}; border-top: 0;">` +
                         `<span class="apexcharts-tooltip-marker" style="background-color: ${w.globals.colors[seriesIndex]}"></span>` +
                         `<span class="apexcharts-tooltip-text">` +
                             `${getText('table.headerChests')}: ${NUMERIC_FORMATTER.format(dataPoint.x)}<br/>` +
                             `${getText('table.headerScore')}: ${NUMERIC_FORMATTER.format(dataPoint.y)}` +
                         `</span>` +
                     `</div>`
                 );
             }
         },
         markers: {
            size: 4,
            hover: { size: 7 }
         }
     };

      renderChart(instanceKey, containerId, options, () => seriesData.length > 0);
}

/**
 * Renders the "Most Frequent Sources" Horizontal Bar Chart.
 * @param {string} containerId - The target container element ID.
 * @param {string} instanceKey - The key to use for managing this chart instance.
 * @param {Array<object>} playersData - The dataset to use.
 */
export function renderFrequentSourcesChart(containerId, instanceKey, playersData) {
    const categoryCounts = {};
    playersData.forEach(player => {
        Object.keys(player).forEach(key => {
            if (!CORE_COLUMNS.includes(key) && typeof player[key] === 'number' && player[key] > 0) {
                categoryCounts[key] = (categoryCounts[key] || 0) + 1; // Count occurrences
            }
        });
    });

    const sortedCategories = Object.entries(categoryCounts).sort(([, countA], [, countB]) => countB - countA);
    const topN = 10;
    const topCategoriesData = sortedCategories.slice(0, topN);

    // Reverse for horizontal bar chart (highest at top)
    const chartLabels = topCategoriesData.map(([key]) => key.replace(/_/g, ' ')).reverse();
    const chartSeries = topCategoriesData.map(([, count]) => count).reverse();

    const baseOptions = getChartBaseOptions();
    const options = {
        ...baseOptions,
        chart: {
            ...baseOptions.chart,
            type: 'bar',
            height: (containerId === elements.modalChartContainer?.id || containerId.startsWith('charts-')) ? 350 : 280
        },
        series: [{ name: getText('dashboard.statPlayers'), data: chartSeries }],
        xaxis: { // This is the value axis for horizontal bar
            ...baseOptions.xaxis,
             title: {
                 text: getText('dashboard.statPlayers'),
                 style: { fontSize: '10px', color: baseOptions.chart.foreColor }
             },
            categories: undefined, // Categories are on y-axis
            labels: {
                ...baseOptions.xaxis.labels,
                show: true,
                formatter: (val) => val !== undefined ? NUMERIC_FORMATTER.format(Math.round(val)) : '',
                rotate: 0
            }
        },
        yaxis: { // This is the category axis for horizontal bar
            ...baseOptions.yaxis,
            categories: chartLabels, // Use labels here for y-axis
             title: undefined,
            labels: {
                ...baseOptions.yaxis.labels,
                formatter: undefined, // Use category names directly
                style: { ...baseOptions.yaxis.labels.style, fontSize: '11px' },
                 maxWidth: 150 // Prevent long labels from overlapping
            }
        },
        plotOptions: {
            bar: { horizontal: true, borderRadius: 2, barHeight: '60%' }
        },
        tooltip: {
            ...baseOptions.tooltip,
            x: { formatter: (val) => `${NUMERIC_FORMATTER.format(val)} ${getText('dashboard.statPlayers').toLowerCase()}` },
            y: {
                 formatter: undefined,
                 title: {
                     // Show category name in tooltip title
                     formatter: (seriesName, { seriesIndex, dataPointIndex, w }) => {
                         return `${getText('charts.sourceLabel')}: ${w.globals.labels[dataPointIndex]}`;
                     }
                  }
             }
        },
        grid: { ...baseOptions.grid, yaxis: { lines: { show: false } } } // Cleaner look for horizontal
    };

    renderChart(instanceKey, containerId, options, () => chartLabels.length > 0);
}


/**
 * Renders the Player Detail Radar Chart.
 * @param {string} containerId - The target container element ID.
 * @param {string} instanceKey - The key to use for managing this chart instance.
 * @param {object} playerData - The data for the specific player.
 */
export function renderPlayerChart(containerId, instanceKey, playerData) {
    if (!playerData) {
         renderChart(instanceKey, containerId, { ...getChartBaseOptions(), series: [], labels: [] }); // Render empty state
         return;
     }

    const categoryKeys = Object.keys(playerData)
        .filter(key => !CORE_COLUMNS.includes(key) && typeof playerData[key] === 'number' && playerData[key] > 0)
        .sort((keyA, keyB) => (playerData[keyB] ?? 0) - (playerData[keyA] ?? 0));

    const topN = 8;
    const radarCategories = categoryKeys.slice(0, topN);

    const categoryNames = radarCategories.map(key => key.replace(/_/g, ' '));
    const categoryScores = radarCategories.map(key => playerData[key] ?? 0);

    const baseOptions = getChartBaseOptions();
    const primaryColor = `hsl(${getCssVariableValue('--primary')})`;
    const backgroundColor = `hsl(${getCssVariableValue('--background')})`;

    const options = {
        ...baseOptions,
        chart: {
            ...baseOptions.chart,
            type: 'radar',
            height: (containerId === elements.modalChartContainer?.id) ? 450 : 350
        },
        series: [{ name: getText('table.headerScore'), data: categoryScores }],
        xaxis: {
             ...baseOptions.xaxis,
            categories: categoryNames,
            labels: {
                ...baseOptions.xaxis.labels,
                style: { ...baseOptions.xaxis.labels.style, fontSize: '11px' },
                rotate: 0,
                hideOverlappingLabels: false,
                formatter: function(value) { // Wrap long labels
                    const maxLength = 15;
                    if (value && value.length > maxLength) {
                        // Basic word wrap
                        const words = value.split(' ');
                        let lines = [];
                        let currentLine = '';
                        words.forEach(word => {
                            if ((currentLine + word).length <= maxLength) {
                                currentLine += (currentLine ? ' ' : '') + word;
                            } else {
                                lines.push(currentLine);
                                currentLine = word;
                            }
                        });
                        lines.push(currentLine);
                        return lines;
                    }
                    return value;
                }
            }
        },
        yaxis: { // Radar doesn't use y-axis title like bar charts
             ...baseOptions.yaxis,
            labels: {
                ...baseOptions.yaxis.labels,
                 formatter: (val) => val !== undefined && val !== null ? baseOptions.yaxis.labels.formatter(val) : '' // Use base formatter
            },
            tickAmount: 4 // Adjust number of rings
        },
        stroke: {
            show: true,
            width: 2,
            colors: [primaryColor],
            dashArray: 0
        },
        fill: {
            colors: [primaryColor],
            opacity: 0.3
        },
        markers: {
            size: 4,
            colors: [backgroundColor], // Use background for marker fill
            strokeColors: [primaryColor],
            strokeWidth: 2,
            hover: { size: 6 }
        },
        tooltip: {
            ...baseOptions.tooltip,
            y: {
                formatter: function(val) {
                    return val !== undefined && val !== null ? NUMERIC_FORMATTER.format(val) : '';
                }
            }
        }
    };

    renderChart(instanceKey, containerId, options, () => radarCategories.length >= 3);
}

/**
 * Renders the Category Detail Bar Chart (Top Players for a Category).
 * @param {string} containerId - The target container element ID.
 * @param {string} instanceKey - The key to use for managing this chart instance.
 * @param {Array<object>} allPlayersData - The full player dataset.
 * @param {string} category - The category key to display.
 */
export function renderCategoryChart(containerId, instanceKey, allPlayersData, category) {
    if (!category) {
         renderChart(instanceKey, containerId, { ...getChartBaseOptions(), series: [], labels: [] }); // Render empty state
         return;
    }

    const topN = 15;
    const topPlayers = allPlayersData
        .filter(player => player.hasOwnProperty(category) && typeof player[category] === 'number' && player[category] > 0)
        .sort((a, b) => (b[category] ?? 0) - (a[category] ?? 0))
        .slice(0, topN);

    const playerNames = topPlayers.map(p => p.PLAYER);
    const playerScores = topPlayers.map(p => p[category] ?? 0);

    const baseOptions = getChartBaseOptions();
    const options = {
        ...baseOptions,
        chart: {
            ...baseOptions.chart,
            type: 'bar',
            height: (containerId === elements.modalChartContainer?.id) ? 500 : 400
        },
        series: [{ name: category.replace(/_/g, ' '), data: playerScores }],
        xaxis: {
            ...baseOptions.xaxis,
            categories: playerNames,
            labels: {
                ...baseOptions.xaxis.labels,
                 rotate: -45,
                 style: { ...baseOptions.xaxis.labels.style, fontSize: '10px' }
            }
        },
        yaxis: { ...baseOptions.yaxis },
        plotOptions: {
            bar: { horizontal: false, columnWidth: '60%', borderRadius: 4 }
        },
        tooltip: {
             ...baseOptions.tooltip,
             y: {
                 formatter: (val) => val !== undefined && val !== null ? NUMERIC_FORMATTER.format(val) : ''
              }
         }
    };

    renderChart(instanceKey, containerId, options, () => topPlayers.length > 0);
} 