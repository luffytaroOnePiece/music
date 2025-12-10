// Remote Data Utilities
const FILTERS_URL = 'https://cdn.jsdelivr.net/gh/luffytaroOnePiece/gists@main/music/filters.json';
const METADATA_URL = 'https://cdn.jsdelivr.net/gh/luffytaroOnePiece/gists@main/music/metadata.json';

// DOM Elements
const songsGrid = document.getElementById('songs-grid');
const filterLanguage = document.getElementById('filter-language');
const filterGenre = document.getElementById('filter-genre');
const filterYear = document.getElementById('filter-year');
const filterSinger = document.getElementById('filter-singer');
const filterMusicBy = document.getElementById('filter-musicBy');
const resetBtn = document.getElementById('reset-filters');

const nowPlayingSection = document.querySelector('.now-playing');
const currentCover = document.getElementById('current-cover');
const defaultCoverIcon = document.getElementById('default-cover-icon');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');
const currentTags = document.getElementById('current-tags');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const currentMovie = document.getElementById('current-movie');

const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const volumeSlider = document.getElementById('volume-slider');

// State
let songsData = [];
let filters = {};
let currentSongIndex = -1;
let isPlaying = false;
let audio = new Audio();
let visibleSongs = [];

// Initialize
async function init() {
    try {
        await fetchData();
        populateFilters();
        renderSongs();
        setupEventListeners();
    } catch (error) {
        console.error("Failed to initialize app:", error);
        songsGrid.innerHTML = '<p style="color:red; text-align:center;">Failed to load data. Please try again later.</p>';
    }
}

// Fetch Data
async function fetchData() {
    const [filtersResponse, metadataResponse] = await Promise.all([
        fetch(FILTERS_URL),
        fetch(METADATA_URL)
    ]);

    if (!filtersResponse.ok || !metadataResponse.ok) {
        throw new Error("Network response was not ok");
    }

    filters = await filtersResponse.json();
    const metadata = await metadataResponse.json();

    // Fix URLs if they are malformed (user reported issue with /main/ vs @main)
    songsData = (metadata.songs || []).map(song => ({
        ...song,
        audioUrl: song.audioUrl.replace('/audio/main/', '/audio@main/').replace('/coverimages/main/', '/coverimages@main/'),
        coverImage: song.coverImage.replace('/coverimages/main/', '/coverimages@main/'),
        albumImage: song.albumImage ? song.albumImage.replace('/coverimages/main/', '/coverimages@main/') : song.albumImage
    }));

    visibleSongs = [...songsData];
}

// Populate Filter Dropdowns
function populateFilters() {
    // Check if filters exist before populating
    if (filters.languages) populateSelect(filterLanguage, filters.languages);
    if (filters.genres) populateSelect(filterGenre, filters.genres);
    if (filters.years) populateSelect(filterYear, filters.years);
    if (filters.singers) populateSelect(filterSinger, filters.singers);
    if (filters.musicBy) populateSelect(filterMusicBy, filters.musicBy);
}

function populateSelect(element, options) {
    // Clear existing options except first "All"
    element.innerHTML = '<option value="">All</option>';

    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        element.appendChild(option);
    });
}

// Render Song List
function renderSongs() {
    songsGrid.innerHTML = '';

    if (visibleSongs.length === 0) {
        songsGrid.innerHTML = '<p style="color:#aaa; grid-column: 1/-1; text-align:center;">No songs match your filters.</p>';
        return;
    }

    visibleSongs.forEach(song => {
        const card = document.createElement('div');
        card.className = `song-card ${currentSongIndex !== -1 && songsData[currentSongIndex].id === song.id ? 'active-song' : ''}`;
        card.dataset.id = song.id;
        card.onclick = () => loadAndPlaySongById(song.id);

        card.innerHTML = `
            <div class="card-img">
                <img src="${song.coverImage}" alt="${song.title}" loading="lazy">
                <div class="play-overlay">
                    <i class="fa-solid ${currentSongIndex !== -1 && songsData[currentSongIndex].id === song.id && isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                </div>
            </div>
            <div class="card-info">
                <h4>${song.title}</h4>
                <p>${song.singers ? song.singers.join(', ') : ''}</p>
            </div>
        `;
        songsGrid.appendChild(card);
    });
}

// Filtering Logic
function applyFilters() {
    const langVal = filterLanguage.value;
    const genreVal = filterGenre.value;
    const yearVal = filterYear.value;
    const singerVal = filterSinger.value;
    const musicByVal = filterMusicBy.value;

    visibleSongs = songsData.filter(song => {
        const matchLang = !langVal || song.language === langVal;
        const matchGenre = !genreVal || song.genre === genreVal;
        const matchYear = !yearVal || song.year.toString() === yearVal;
        const matchSinger = !singerVal || (song.singers && song.singers.includes(singerVal));
        const matchMusicBy = !musicByVal || song.musicBy === musicByVal;
        return matchLang && matchGenre && matchYear && matchSinger && matchMusicBy;
    });

    renderSongs();
}

function resetFilters() {
    filterLanguage.value = "";
    filterGenre.value = "";
    filterYear.value = "";
    filterSinger.value = "";
    filterMusicBy.value = "";
    applyFilters();
}

// Audio Player Logic
function loadAndPlaySongById(id) {
    const index = songsData.findIndex(s => s.id === id);
    if (index === -1) return;

    // If same song, toggle play/pause
    if (currentSongIndex === index) {
        togglePlay();
        return;
    }

    currentSongIndex = index;
    loadSong(songsData[index]);
    playSong();
    renderSongs(); // Update active state icons
}

function loadSong(song) {
    currentTitle.innerText = song.title;
    currentArtist.innerText = song.singers ? song.singers.join(', ') : 'Unknown Artist';
    currentCover.src = song.coverImage;
    currentCover.src = song.coverImage;
    currentCover.style.display = 'block'; // Show image
    defaultCoverIcon.style.display = 'none'; // Hide default icon

    currentMovie.innerText = getAlbumName(song);
    currentMovie.title = currentMovie.innerText; /* Add tooltip for long names */
    audio.src = song.audioUrl;

    // Update Tags
    currentTags.innerHTML = `
        ${song.language ? `<span class="tag">${song.language}</span>` : ''}
        ${song.year ? `<span class="tag">${song.year}</span>` : ''}
        ${song.genre ? `<span class="tag">${song.genre}</span>` : ''}
    `;
}

function playSong() {
    audio.play().then(() => {
        isPlaying = true;
        updatePlayBtn();
        nowPlayingSection.classList.add('playing');
        renderSongs();
    }).catch(e => console.error("Playback error:", e));
}

function pauseSong() {
    audio.pause();
    isPlaying = false;
    updatePlayBtn();
    nowPlayingSection.classList.remove('playing');
    renderSongs();
}

function togglePlay() {
    if (currentSongIndex === -1 && visibleSongs.length > 0) {
        loadAndPlaySongById(visibleSongs[0].id);
        return;
    }

    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function updatePlayBtn() {
    playBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
}

function prevSong() {
    if (currentSongIndex > 0) {
        currentSongIndex--;
    } else {
        currentSongIndex = songsData.length - 1; // Loop to last
    }
    loadSong(songsData[currentSongIndex]);
    playSong();
    renderSongs();
}

function nextSong() {
    if (currentSongIndex < songsData.length - 1) {
        currentSongIndex++;
    } else {
        currentSongIndex = 0; // Loop to first
    }
    loadSong(songsData[currentSongIndex]);
    playSong();
    renderSongs();
}

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (isNaN(duration)) return;

    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;

    currentTimeEl.innerText = formatTime(currentTime);
    totalDurationEl.innerText = formatTime(duration);
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;

    audio.currentTime = (clickX / width) * duration;
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Helper to get consistent album/movie name
function getAlbumName(song) {
    if (song.movie) return song.movie;
    if (song.album) return song.album;

    // Fallback: Extract from albumImage URL if available
    // e.g., .../AlaVaikunthapurramuloo.jpg -> AlaVaikunthapurramuloo
    if (song.albumImage) {
        try {
            const filename = song.albumImage.split('/').pop().split('.')[0];
            // Optional: Insert spaces between CamelCase? 
            // For now, just return specific filename as it seems to be the movie name
            return filename.replace(/-/g, ' ');
        } catch (e) {
            console.warn("Could not extract album from image", e);
        }
    }

    return "Unknown Album";
}

// Event Listeners
function setupEventListeners() {
    // Filters
    [filterLanguage, filterGenre, filterYear, filterSinger, filterMusicBy].forEach(el => {
        el.addEventListener('change', applyFilters);
    });
    resetBtn.addEventListener('click', resetFilters);

    // Audio Controls
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextSong);

    progressContainer.addEventListener('click', setProgress);

    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });
}

// Init
init();
