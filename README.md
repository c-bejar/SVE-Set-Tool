# Shadowverse Evolve Deck Creator

A dual-component project for managing Shadowverse-Evolve cards. Uses a web scraper to create out database of shadowverse evolve cards and includes deck builder interface for the express purpose of being used with my Tabletop Simulator **[Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=3485057965)**.

## Overview

This repository contains two tools:

1. A card data scraper that extracts and maintains a comprehensive database of Shadowverse Evolve cards and other data
2. A web-based deck builder that utilizes the scraped data for creating custom decks

## Component Structure

### Card Scraper
Files:
- `update-list.py`: Main script for scraping card data
- `requirements.txt`: Dependencies required for scraping
- `cards.json`: Generated database of all cards

### Deck Builder
- Web interface for building and managing decks
- Created for export to Tabletop Simulator via text

## Getting Started

### Prerequisites (Local)
Before using either component, ensure you have Python installed on your system.

### Card Scraper Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Update card database
python update-list.py
```

## Deck Builder
Everything afterwards is pretty automatic.
1. Load index.html locally via server

## Deck Builder Usage
1. Go to <https://shadowverse-evolve-tabletop.vercel.app/>
2. Build a deck
3. Click on "Copy" button within the website
4. Load my Tabletop Simulator [Workshop Item](https://steamcommunity.com/sharedfiles/filedetails/?id=3485057965)
5. Paste contents into input window after clicking "Load Deck" on the top left of the screen
6. Enjoy!

## Features

### Card Scraper
- Automated card data collection from official website
- JSON-based storage for easy parsing

### Deck Builder
- Easy-to-use card selection interface
- Custom deck creation
- Real-time card previews

## Technical Details

### Data Flow
The system operates in two stages:
1. Web scraping extracts card data and saves to `cards.json`
2. Deck builder reads from `cards.json` to provide building interface

## Contributing
Contributions are welcome!

## Acknowledgments
Special thanks to:
- Shadowverse-Evolve team for maintaining the official website
- Tabletop Simulator community for workshop support
