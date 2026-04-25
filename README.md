# Environment Highlighter (Chrome / Brave Extension)
A lightweight browser extension that visually distinguishes environments (e.g. PROD, UAT, INT, LOCAL) by applying a colored border and badge to every page based on its domain.

Designed to reduce costly mistakes when working across multiple environments.

## Features
* Deterministic environment detection
    * Regex-based domain matching (no accidental matches like prod vs product)
* Visual safety indicators
  * Colored border around the entire page
  * High-visibility environment badge (top-right)
* Fully configurable
    * Define rules via extension UI
    * Customize:
      * Regex pattern
      * Color
      * Label
      * Priority
* Import / Export configuration
  * Share rules across teams via JSON
  * Version-control your environment definitions
* Early injection
  * Runs at `document_start` to prevent UI flicker

## Why this exists
When working with multiple environments, it's dangerously easy to:

* Modify production data unintentionally
* Run destructive actions in the wrong system
* Confuse staging with production

This extension provides an immediate, always-visible signal of where you are.

## Install
1. Got to: https://github.com/SJR-Labs/chrome-env-border-extension/releases
2. Download the latest release of the extension named `chrome-env-border-extension-{version}.zip`.
3. Extract the zip file
4. Open Chrome / Brave
5. Open [chrome://extensions/](chrome://extensions/)
6. Enable Developer mode
7. Click `Load unpacked`
8. Select the extracted dist folder