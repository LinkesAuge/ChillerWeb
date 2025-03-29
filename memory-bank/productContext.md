# Product Context: TB Chest Analyzer

## 1. Problem Solved

Players and leadership of "The Chiller" clan in "Total Battle" need an accessible way to analyze and compare player activity based on in-game chest data. Manually processing exported CSV data is time-consuming and doesn't provide easy visualization or standardized scoring.

## 2. Why It Exists

This tool exists to:
*   Automate the processing and analysis of exported player chest data.
*   Provide a standardized scoring system (`rules.csv`) for objective comparison.
*   Offer intuitive visualizations (charts, rankings) to understand individual and collective performance.
*   Facilitate data exploration for clan members and leadership.
*   Deliver this functionality in a simple, standalone web application that doesn't require complex server setup or user logins (for this static version).

## 3. How It Should Work (User Experience)

*   **Loading:** The app should automatically load the `data.csv` and `rules.csv` upon opening `index.html`.
*   **Navigation:** Users should easily switch between different views (Dashboard, Data, Charts, Analytics, Score System) using a clear navigation bar.
*   **Dashboard:** Present key summary statistics and primary rankings/charts for a quick overview.
*   **Data Exploration:** Allow sorting and filtering (where applicable) in tables.
*   **Visualization:** Charts should be clear, interactive, and relevant to the data being presented.
*   **Player Focus:** Allow users to drill down into individual player details.
*   **Language:** Offer easy switching between German and English, remembering the user's choice.
*   **Responsiveness:** The interface should adapt reasonably to different screen sizes.

## 4. User Experience Goals

*   **Clarity:** Information should be presented clearly and be easy to understand.
*   **Efficiency:** Users should be able to find the information they need quickly.
*   **Engagement:** Visualizations and rankings should make exploring the data interesting.
*   **Accessibility:** The tool should be simple to access and use (just open `index.html`). 