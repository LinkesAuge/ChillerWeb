# Active Context: Refactoring Preparation

## 1. Current Focus

Preparing and starting the refactoring of the application from a single HTML file to a modular structure, following the plan outlined in `refactoring_plan.md`.

## 2. Recent Changes

*   Defined a detailed refactoring plan in `memory-bank/refactoring_plan.md`.
*   Updated `activeContext.md` (this file).
*   Previously initialized the memory bank based on `index.html` and `WebApp_ChillerReadme.md`.

## 3. Next Steps

*   Begin **Phase 1: Project Setup & Structure** of the refactoring plan.
    *   Initialize npm.
    *   Install dependencies (Vite, Tailwind, etc.).
    *   Configure Tailwind.
    *   Create the new directory structure.
    *   Move assets.
    *   Prepare `index.html` skeleton.
    *   Prepare `src/css/style.css`.
    *   Prepare `src/js/main.js`.

## 4. Active Decisions & Considerations

*   Using `Vite` as the build tool and development server is recommended for its speed and features (like HMR).
*   Managing dependencies locally via `npm` is preferred over CDNs for robustness.
*   The refactoring aims to preserve all existing functionality and the visual design. 