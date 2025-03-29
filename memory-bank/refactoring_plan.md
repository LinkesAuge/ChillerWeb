# Refactoring Plan: TB Chest Analyzer (Single HTML to Modular Structure)

## 1. Goal

Refactor the existing single `index.html` application into a modular structure using modern JavaScript (ES6 Modules), CSS preprocessing (Tailwind via PostCSS), and local dependency management (`npm`). The goal is to improve maintainability, readability, and developer experience while keeping the current functionality and visual design identical.

## 2. Core Principles

*   **Separation of Concerns:** Split HTML structure, CSS styling, and JavaScript logic into distinct files/modules.
*   **Modularity:** Break down JavaScript into smaller, focused modules (data handling, UI updates, state, navigation, utilities).
*   **Local Dependencies:** Manage libraries (PapaParse, ApexCharts, Tailwind CSS) via `npm`/`package.json` instead of CDNs.
*   **Modern Tooling:** Utilize `Vite` for development server, build process, and HMR.
*   **Maintain Functionality & Design:** The end-user experience must remain unchanged.

## 3. Proposed Structure

```
ChillerWeb/
├── public/              # Static assets served directly
│   ├── data/
│   │   ├── data.csv
│   │   └── rules.csv
│   └── assets/
│       ├── icon.png
│       └── icon_xl.png
├── src/                 # Source code
│   ├── css/
│   │   └── style.css    # Main CSS file (Tailwind directives & custom styles)
│   ├── js/              # JavaScript modules
│   │   ├── components/  # UI component logic
│   │   │   ├── charts.js
│   │   │   ├── dashboard.js
│   │   │   ├── detailedTable.js
│   │   │   ├── playerDetail.js
│   │   │   └── scoreSystem.js
│   │   ├── core/        # Core logic modules
│   │   │   ├── api.js        # Data fetching/parsing
│   │   │   ├── i18n.js       # Internationalization
│   │   │   ├── state.js      # Application state management
│   │   │   └── navigation.js # View switching logic
│   │   ├── utils/       # Utility functions
│   │   │   ├── dom.js        # DOM manipulation helpers
│   │   │   └── formatters.js # Data formatting helpers
│   │   └── main.js      # Main application entry point
│   └── locales/           # (Optional) Language translation JSON files
│       ├── de.json
│       └── en.json
├── index.html           # Main HTML skeleton file (in root)
├── package.json         # Project metadata and dependencies
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration (for Tailwind)
└── vite.config.js       # (Optional but Recommended) Vite configuration
```

## 4. Recommended Tooling

*   **Package Manager:** `npm`
*   **Build Tool / Dev Server:** `Vite`
*   **CSS Framework:** Tailwind CSS (via PostCSS)
*   **CSV Parsing:** PapaParse
*   **Charting:** ApexCharts

## 5. Refactoring Phases

### Phase 1: Project Setup & Structure
1.  Initialize `npm` (`npm init -y`).
2.  Install `Vite`, `tailwindcss`, `postcss`, `autoprefixer`, `papaparse`, `apexcharts`.
3.  Configure Tailwind (`npx tailwindcss init -p`, update `tailwind.config.js` content/theme).
4.  Create directory structure (`src/`, `public/`, etc.).
5.  Move assets (`*.csv` to `public/data/`, `*.png` to `public/assets/`).
6.  Strip down `index.html` (move to root), remove scripts/styles, add links to `style.css` and `main.js`. Update asset paths.
7.  Create `src/css/style.css` with Tailwind directives and custom styles moved from `index.html`.
8.  Create empty `src/js/main.js`.

### Phase 2: JavaScript Logic Migration & Modularization
1.  Create core modules (`state.js`, `i18n.js`, `api.js`, `navigation.js`) in `src/js/core/`.
2.  Create utility modules (`dom.js`, `formatters.js`) in `src/js/utils/`.
3.  Create UI component modules (`dashboard.js`, `charts.js`, etc.) in `src/js/components/`. Import dependencies (`ApexCharts`, state, utils). Export `init` functions.
4.  Implement `src/js/main.js` entry point:
    *   Import modules.
    *   Add `DOMContentLoaded` listener.
    *   Initialize i18n, load data via `api.js`, store in `state.js`.
    *   Initialize navigation and UI components.
    *   Handle global events.
    *   Show default view.

### Phase 3: Testing & Refinement
1.  Set up Vite dev server (`npm run dev`).
2.  Perform thorough manual testing of all features.
3.  Debug using browser dev tools.
4.  Refine module structure and code as needed.

### Phase 4: Build (Optional)
1.  Set up Vite build script (`npm run build`).
2.  Generate optimized production build in `dist/` folder. 