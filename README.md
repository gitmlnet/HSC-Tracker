# HSC Study Tracker

A responsive Bangladesh HSC study tracker and planner.

## Features

- Daily study logging with syllabus-based subject and chapter selection
- Automatic session duration calculation
- Planning for individual dates and study targets
- Daily planned-target completion tracking
- Saturday–Friday weekly dashboard
- Study history, analytics, and data export/import
- Browser-based local data persistence
- Progressive Web App support and offline app-shell caching

## Requirements

- Node.js 20 or later
- npm

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deploy

The repository includes a GitHub Actions workflow for GitHub Pages. Enable **Settings → Pages → Build and deployment → GitHub Actions**.

## Data

Study data is stored in the browser on the device where it is entered. Use the in-app backup/export feature regularly to protect or transfer records.

## PWA

Serve the production build over HTTPS (or localhost for development). Open it in a supported browser and use its Install app option when offered. Offline availability depends on a successful first online load and browser support.

## Syllabus

Syllabus entries are centralized in `src/data/syllabus.ts`.
