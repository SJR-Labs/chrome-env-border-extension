# Environment Border Highlighter (Chrome / Brave Extension)
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
Open Chrome / Brave:

* Clone this repository
* Open chrome://extensions/
* Enable Developer mode
* Click Load unpacked
* Select the project folder