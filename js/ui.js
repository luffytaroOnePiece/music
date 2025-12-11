// UI Rendering
import { state } from './state.js';
import { getAlbumName } from './utils.js';

const songsGrid = document.getElementById('songs-grid');
const filterLanguage = document.getElementById('filter-language');
const filterGenre = document.getElementById('filter-genre');
const filterYear = document.getElementById('filter-year');
const filterSinger = document.getElementById('filter-singer');
const filterMusicBy = document.getElementById('filter-musicBy');
const searchInput = document.getElementById('search-input'); // New search input

export function populateFilters() {
    if (state.filters.languages) populateSelect(filterLanguage, state.filters.languages);
    if (state.filters.genres) populateSelect(filterGenre, state.filters.genres);
    if (state.filters.years) populateSelect(filterYear, state.filters.years);
    if (state.filters.singers) populateSelect(filterSinger, state.filters.singers);
    if (state.filters.musicBy) populateSelect(filterMusicBy, state.filters.musicBy);
}

function populateSelect(element, options) {
    element.innerHTML = '<option value="">All</option>';
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        element.appendChild(option);
    });
}

export function renderSongs() {
    songsGrid.innerHTML = '';

    if (state.visibleSongs.length === 0) {
        songsGrid.innerHTML = '<p style="color:#aaa; grid-column: 1/-1; text-align:center;">No songs match your filters.</p>';
        return;
    }

    state.visibleSongs.forEach(song => {
        const isActive = state.currentSongIndex !== -1 && state.songsData[state.currentSongIndex].id === song.id;

        const card = document.createElement('div');
        card.className = `song-card ${isActive ? 'active-song' : ''}`;
        card.dataset.id = song.id;

        // Note: onclick handlers are attached via string here.
        // For this to work with modules, the functions (loadAndPlaySongById, openVideoModal)
        // MUST be attached to the window object in main.js.
        card.onclick = () => window.loadAndPlaySongById(song.id);

        card.innerHTML = `
            <div class="card-img">
                <img src="${song.coverImage}" alt="${song.title}" loading="lazy">
                <div class="play-overlay">
                    <i class="fa-solid ${isActive && state.isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                </div>
            </div>
            <div class="card-info">
                <div class="info-text">
                    <h4>${song.title}</h4>
                    <p class="singers">${song.singers ? song.singers.join(', ') : ''}</p>
                    ${song.musicBy ? `<p class="music-by"><i class="fa-solid fa-music"></i> ${song.musicBy}</p>` : ''}
                </div>
                ${song.youtube && song.youtube.url ? `
                <button class="youtube-badge" title="Watch on YouTube" onclick="event.stopPropagation(); window.openVideoModal('${song.youtube.url}')">
                    <i class="fa-brands fa-youtube"></i>
                </button>
                ` : ''}
            </div>
        `;
        songsGrid.appendChild(card);
    });
}

export function applyFilters() {
    const langVal = filterLanguage.value;
    const genreVal = filterGenre.value;
    const yearVal = filterYear.value;
    const singerVal = filterSinger.value;
    const musicByVal = filterMusicBy.value;
    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";

    state.visibleSongs = state.songsData.filter(song => {
        const matchLang = !langVal || song.language === langVal;
        const matchGenre = !genreVal || song.genre === genreVal;
        const matchYear = !yearVal || song.year.toString() === yearVal;
        const matchSinger = !singerVal || (song.singers && song.singers.includes(singerVal));
        const matchMusicBy = !musicByVal || song.musicBy === musicByVal;

        // Search Logic: Title OR Album (using getAlbumName fallback)
        const songTitle = song.title ? song.title.toLowerCase() : "";
        const songAlbum = getAlbumName(song).toLowerCase();

        const matchSearch = !searchText ||
            songTitle.includes(searchText) ||
            songAlbum.includes(searchText);

        return matchLang && matchGenre && matchYear && matchSinger && matchMusicBy && matchSearch;
    });

    renderSongs();
}

export function resetFilters() {
    filterLanguage.value = "";
    filterGenre.value = "";
    filterYear.value = "";
    filterSinger.value = "";
    filterMusicBy.value = "";
    if (searchInput) searchInput.value = ""; // Reset search
    applyFilters();
}
