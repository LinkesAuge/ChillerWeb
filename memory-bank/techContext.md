# Technical Context: TB Chest Analyzer (Client-Side Static)

## 1. Core Technologies

*   **Structure:** HTML5 (Single Page Application)
*   **Styling:** CSS3 with Tailwind CSS (v3 via CDN)
    *   Custom theme defined using CSS variables within `<style>` tags.
    *   Utility-first approach.
*   **Logic:** Vanilla JavaScript (ES6+)
    *   Handles all data fetching, parsing, processing, calculations, DOM manipulation, event handling, state management, and internationalization.
*   **CSV Parsing:** PapaParse library (via CDN)
*   **Charting:** ApexCharts library (via CDN)

## 2. Architecture

*   **Client-Side Only:** All operations (data loading, processing, rendering) occur within the user's web browser. There is no server-side backend component.
*   **Static Data:** Relies on `data.csv` and `rules.csv` files being present in the same directory as `index.html`.

## 3. Development Setup

*   Requires only a web browser capable of running modern JavaScript.
*   No build process is necessary as dependencies (Tailwind, PapaParse, ApexCharts) are loaded via CDNs.
*   Development involves editing `index.html` directly.

## 4. Key Libraries & APIs

*   **Tailwind CSS (CDN):** For UI styling and layout.
*   **PapaParse (CDN):** For parsing CSV data fetched via the `fetch` API.
*   **ApexCharts (CDN):** For generating interactive SVG charts.
*   **Browser `fetch` API:** For loading the static CSV files.
*   **Browser `localStorage` API:** For storing the user's language preference.
*   **Font Awesome (CDN):** For icons.
*   **Google Fonts (CDN):** For specific fonts (`Cinzel Decorative`, `Inter`, `Merriweather`).

## 5. Technical Constraints

*   **Performance:** Large datasets (`data.csv`) could potentially slow down processing and rendering as everything happens client-side.
*   **Data Updates:** Requires manual replacement of `data.csv` and `rules.csv` on the hosting server to update the application's data.
*   **Browser Compatibility:** Relies on modern browser features (ES6+, fetch, etc.). 