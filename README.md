# Liquid Music Player 🎵

A modern, aesthetically pleasing music player web application featuring a "liquid" animated background and glassmorphism design.

## Features

- **Modern UI**: Glassmorphism effects, animated blobs, and a clean dark theme.
- **Dynamic Player Bar**:
  - Resizable progress bar (fills available space).
  - Compact volume controls.
  - Album/Movie name display with smart fallback detection.
- **Filtering**: Filter songs by Language, Genre, Year, Singer, and Composer.
- **Remote Data**: Fetches song metadata and filters from a central JSON source (GitHub Gist via jsDelivr).
- **Responsive**: Adapts to different screen sizes.

## How to Deploy to GitHub Pages

This project is a **Static Web Application** and is 100% ready for GitHub Pages.

1. **Upload files**: Push `index.html`, `style.css`, `script.js`, and this `README.md` to a GitHub repository.
2. **Settings**: Go to the repository **Settings** -> **Pages**.
3. **Source**: Select `Deploy from a branch`.
4. **Branch**: Select `main` (or your default branch) and `/ (root)` folder.
5. **Save**: Click Save. GitHub will deploy your site in a few moments.

## Running Locally (Important)

If you double-click `index.html` on your computer, **the songs might not load**.
This is because modern browsers block certain features (like `fetch` and modules) on the `file://` protocol for security.

To test locally, you must run a simple local server:
- **VS Code**: Use the "Live Server" extension.
- **Python**: Run `python3 -m http.server` in the terminal and open `http://localhost:8000`.

**GitHub Pages hosts your site on a server (HTTPS)**, so it will work perfectly there!

## Data Sources

The player fetches data from:
- Metadata: `https://cdn.jsdelivr.net/gh/luffytaroOnePiece/gists@main/music/metadata.json`
- Filters: `https://cdn.jsdelivr.net/gh/luffytaroOnePiece/gists@main/music/filters.json`