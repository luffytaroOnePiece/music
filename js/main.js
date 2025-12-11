// Main Entry Point
import { fetchData } from './api.js';
import { populateFilters, renderSongs, applyFilters, resetFilters, handleViewToggle, handleDisplayStyleToggle } from './ui.js';
import { applyTheme } from './theme.js';
import {
    loadAndPlaySongById,
    togglePlay,
    prevSong,
    nextSong,
    updateProgress,
    setProgress,

    setVolume,
    handleSongEnd
} from './player.js';
import { openVideoModal, closeVideoModal } from './modal.js';
import { initFullPlayer } from './fullPlayer.js';
import { state, audio } from './state.js';

// DOM Elements
const resetBtn = document.getElementById('reset-filters');
const themeSelector = document.getElementById('theme-selector');
const closeModalBtn = document.getElementById('close-modal');
const videoModal = document.getElementById('video-modal');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressContainer = document.getElementById('progress-container');
const volumeSlider = document.getElementById('volume-slider');
const filterLanguage = document.getElementById('filter-language');
const filterGenre = document.getElementById('filter-genre');
const filterYear = document.getElementById('filter-year');
const filterSinger = document.getElementById('filter-singer');
const filterMusicBy = document.getElementById('filter-musicBy');
const searchInput = document.getElementById('search-input'); // Search input
const viewToggleBtns = document.querySelectorAll('.view-toggle-btn'); // Toggle buttons
const styleToggleBtns = document.querySelectorAll('.style-toggle-btn'); // Grid/List Toggle

// Initialize
async function init() {
    try {
        await fetchData();
        populateFilters();
        renderSongs();
        setupEventListeners();
        initFullPlayer();
        exposeGlobals(); // Crucial for inline HTML onclicks
    } catch (error) {
        console.error("Failed to initialize app:", error);
        document.getElementById('songs-grid').innerHTML = '<p style="color:red; text-align:center;">Failed to load data. Please try again later.</p>';
    }
}

// Event Listeners
function setupEventListeners() {
    // View Toggles
    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            handleViewToggle(btn.dataset.view);
        });
    });

    // Style Toggle (Grid/List)
    styleToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            handleDisplayStyleToggle(btn.dataset.style);
        });
    });

    // Filters
    [filterLanguage, filterGenre, filterYear, filterSinger, filterMusicBy].forEach(el => {
        el.addEventListener('change', applyFilters);
    });

    // Search Input
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    resetBtn.addEventListener('click', resetFilters);

    // Theme Selector
    themeSelector.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });

    // Modal
    closeModalBtn.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) closeVideoModal();
    });

    // Audio Controls
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleSongEnd);

    progressContainer.addEventListener('click', setProgress);

    volumeSlider.addEventListener('input', (e) => {
        setVolume(e.target.value);
    });
}

// Expose functions to window for inline onclick handlers in UI
function exposeGlobals() {
    window.loadAndPlaySongById = loadAndPlaySongById;
    window.openVideoModal = openVideoModal;
    window.goBackToAlbums = () => handleViewToggle('albums');
}

// Start
init();
