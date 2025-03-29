# System Patterns: TB Chest Analyzer (Client-Side Static)

## 1. Architecture Pattern

*   **Single Page Application (SPA):** The entire application runs within a single `index.html` file. Navigation between "pages" or views is handled by showing and hiding different `<section>` elements within the DOM using JavaScript, rather than loading new HTML files.

## 2. Data Handling Patterns

*   **Static Data Source Loading:** The application fetches its core data (`data.csv`, `rules.csv`) using the browser's `fetch` API from static files hosted alongside the application.
*   **Client-Side Data Processing:** All data parsing (PapaParse), cleaning, transformation, calculation of scores and statistics, sorting, and filtering are performed entirely in the user's browser using JavaScript.

## 3. UI and Interaction Patterns

*   **View Management:** JavaScript functions control the visibility of different content sections (`#dashboard-section`, `#detailed-table-section`, etc.) based on user interaction with the navigation links.
*   **Dynamic Table Generation:** HTML tables (e.g., rankings, full data, score rules) are populated dynamically using JavaScript loops to create table rows (`<tr>`) and cells (`<td>`) based on the processed data.
*   **Event Delegation (Implied):** While not explicitly detailed in the README, efficient SPAs often use event delegation for handling clicks on dynamically generated content like table rows.
*   **Modal Dialog:** Used for displaying larger versions of charts.

## 4. State Management

*   **Simple JavaScript Variables:** Application state (like the currently loaded player data, scoring rules, selected language, current view, sorting state of tables) is managed using global or module-scoped JavaScript variables.
*   **`localStorage` Persistence:** Used specifically to store and retrieve the user's preferred language across sessions.

## 5. Internationalization (i18n)

*   **Data Attribute-Based:** Uses `data-i18n-key` attributes on HTML elements. JavaScript code finds these elements and replaces their `textContent` or attributes (like `placeholder`) based on the selected language and a predefined dictionary of translations.

## 6. Styling Pattern

*   **Utility-First CSS (Tailwind):** Styling is primarily achieved by applying Tailwind CSS utility classes directly in the HTML markup. Base styles and theming are set up using CSS variables and `@layer base` directives. 