# Product Manager Job Aggregator

A web scraping tool that aggregates product manager job listings from multiple job sites using Crawlee.

## Overview

This project automatically scrapes and aggregates product manager positions from various job boards, with filtering for Prague and remote opportunities. Built to demonstrate modern web scraping techniques and data visualization.

## Tech Stack

- **Crawlee** - Web scraping and browser automation library
- **TypeScript** - Type-safe development
- **Playwright** - Headless browser automation
- **HTML/CSS/JS** - Frontend interface

## Features

- Multi-site job scraping (LinkedIn, Indeed, Jobs.cz)
- Automatic product manager role detection
- Location-based filtering (Prague/Remote)
- Interactive web interface with job counts
- Error handling and retry mechanisms

## Results

Successfully scraped **59 product manager positions** with a clean, responsive interface for browsing and filtering results.

## Quick Start

```bash
# Install dependencies
npm install

# Run the crawler
npm start

# Prepare and view results
npm run prepare-results
npx serve
# Open http://localhost:3000/results.html
```

## Project Structure

```
my-job-aggregator/
├── src/
│   ├── main.ts              # Main crawler entry point
│   ├── routes.ts            # Site-specific extraction handlers
│   ├── prepare-results.js   # Data aggregation script
│   └── results.html         # Web interface for viewing results
├── storage/
│   └── datasets/
│       └── default/         # Individual job JSON files
├── jobs-data.json          # Combined dataset for web display
└── README.md
```

## Implementation Highlights

### Router-Based Architecture
Clean separation of concerns with site-specific handlers for different job boards.

### Error Handling
- Comprehensive logging for debugging
- Graceful fallbacks when sites block requests
- Screenshot capture for failed extractions

### Data Processing
1. Extract job data using site-specific selectors
2. Filter for product manager roles
3. Standardize data format across sources
4. Store in structured JSON format
5. Aggregate for web display

## Challenges & Solutions

- **Anti-scraping measures**: Implemented respectful crawling with delays and retry logic
- **Data consistency**: Standardized data format across different job sites
- **Selector reliability**: Multiple fallback selectors for robust extraction

## Future Enhancements

- Add more job boards and data sources
- Implement duplicate detection across sites
- Add salary and experience level filtering
- Email notifications for new matching jobs
- API endpoint for programmatic access

---

**Author**: Amir Maleki | **Date**: May 2025