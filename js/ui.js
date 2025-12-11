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

// View Switching Logic
export function render() {
    if (state.viewMode === 'songs') {
        renderSongsList(state.visibleSongs);
    } else if (state.viewMode === 'albums') {
        renderAlbums();
    } else if (state.viewMode === 'album_detail') {
        renderAlbumDetail();
    }
}

export function renderSongs() {
    // Legacy support or alias to render()
    render();
}

export function handleDisplayStyleToggle(style) {
    state.displayStyle = style;
    render();
    updateStyleToggleUI(style);
}

function updateStyleToggleUI(style) {
    document.querySelectorAll('.style-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.style === style) btn.classList.add('active');
    });
}

function renderSongsList(songs) {
    songsGrid.innerHTML = '';
    // Apply grid or list class
    songsGrid.className = state.displayStyle === 'list' ? 'songs-list' : 'songs-grid';

    if (songs.length === 0) {
        // preserve grid-column span for message
        songsGrid.innerHTML = '<p style="color:#aaa; grid-column: 1/-1; text-align:center;">No songs match your filters.</p>';
        return;
    }

    songs.forEach(song => {
        const isActive = state.currentSongIndex !== -1 && state.songsData[state.currentSongIndex].id === song.id;

        const card = document.createElement('div');
        card.className = `song-card ${isActive ? 'active-song' : ''}`;
        card.dataset.id = song.id;

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

function renderAlbums() {
    songsGrid.innerHTML = '';
    // Apply grid or list class
    songsGrid.className = state.displayStyle === 'list' ? 'albums-list' : 'albums-grid';

    // Group songs by album
    const albums = {};
    state.visibleSongs.forEach(song => {
        const albumName = getAlbumName(song);
        if (!albums[albumName]) {
            albums[albumName] = {
                name: albumName,
                cover: song.albumImage || song.coverImage,
                songs: []
            };
        }
        albums[albumName].songs.push(song);
    });

    const albumList = Object.values(albums);

    if (albumList.length === 0) {
        songsGrid.innerHTML = '<p style="color:#aaa; grid-column: 1/-1; text-align:center;">No albums found.</p>';
        return;
    }

    albumList.forEach(album => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.onclick = () => {
            state.viewMode = 'album_detail';
            state.currentAlbum = album.name;
            render();
            // Update Toggle Button State manually or re-render header if it was dynamic
        };

        card.innerHTML = `
            <div class="card-img">
                <img src="${album.cover}" alt="${album.name}" loading="lazy">
                 <div class="play-overlay">
                    <i class="fa-solid fa-folder-open"></i>
                </div>
            </div>
            <div class="card-info">
                <h4>${album.name}</h4>
                <p>${album.songs.length} Songs</p>
            </div>
        `;
        songsGrid.appendChild(card);
    });
}

function renderAlbumDetail() {
    songsGrid.innerHTML = '';
    // Apply grid or list class
    songsGrid.className = state.displayStyle === 'list' ? 'songs-list' : 'songs-grid';

    // Show Back Button Header
    const header = document.createElement('div');
    header.style.gridColumn = '1 / -1';
    header.style.marginBottom = '20px';
    header.innerHTML = `
        <button class="icon-btn" onclick="window.goBackToAlbums()">
            <i class="fa-solid fa-arrow-left"></i> Back to Albums
        </button>
        <h2 style="display:inline-block; margin-left: 10px;">${state.currentAlbum}</h2>
    `;
    songsGrid.appendChild(header);

    // Filter songs for this album
    const albumSongs = state.songsData.filter(s => getAlbumName(s) === state.currentAlbum);

    // Use the existing list renderer but append instead of clearing (since we added header)
    // Actually simpler to just reuse logic but we need to append to the container which we just cleared.
    // Let's manually render the list part to avoid clearing the header.

    // Alternatively, filter visibleSongs temporarily? No, standard practice is to show all songs in that album regardless of current filters, OR respect filters.
    // User probably expects "Show me this album", so we should show all songs in it.
    // But let's check if visibleSongs is already filtered. If we use state.songsData, we ignore filters.
    // Use state.songsData for "All songs in album".

    if (albumSongs.length === 0) {
        const msg = document.createElement('p');
        msg.textContent = "No songs found.";
        songsGrid.appendChild(msg);
        return;
    }

    albumSongs.forEach(song => {
        const isActive = state.currentSongIndex !== -1 && state.songsData[state.currentSongIndex].id === song.id;

        const card = document.createElement('div');
        card.className = `song-card ${isActive ? 'active-song' : ''}`;
        card.dataset.id = song.id;
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
                </div>
            </div>
        `;
        songsGrid.appendChild(card);
    });
}

export function handleViewToggle(mode) {
    state.viewMode = mode;
    state.currentAlbum = null;
    render();
    updateToggleUI(mode);
}

function updateToggleUI(mode) {
    // This expects HTML elements to exist. we will add them next.
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === mode) btn.classList.add('active');
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
