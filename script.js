// Remote Data Utilities
const FILTERS_URL = 'https://cdn.jsdelivr.net/gh/luffytaroOnePiece/gists@latest/music/filters.json';
const METADATA_URL = 'https://cdn.jsdelivr.net/gh/luffytaroOnePiece/gists@latest/music/metadata.json';

// DOM Elements
const songsGrid = document.getElementById('songs-grid');
const filterLanguage = document.getElementById('filter-language');
const filterGenre = document.getElementById('filter-genre');
const filterYear = document.getElementById('filter-year');
const filterSinger = document.getElementById('filter-singer');
const filterMusicBy = document.getElementById('filter-musicBy');
const resetBtn = document.getElementById('reset-filters');
const themeSelector = document.getElementById('theme-selector');

const nowPlayingSection = document.querySelector('.now-playing');
const currentCover = document.getElementById('current-cover');
const defaultCoverIcon = document.getElementById('default-cover-icon');
const currentTitle = document.getElementById('current-title');

const videoModal = document.getElementById('video-modal');
const videoThumbnail = document.getElementById('video-thumbnail');
const thumbnailPlayBtn = document.getElementById('thumbnail-play-btn');
const closeModalBtn = document.getElementById('close-modal');
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
                <div class="info-text">
                    <h4>${song.title}</h4>
                    <p class="singers">${song.singers ? song.singers.join(', ') : ''}</p>
                    ${song.musicBy ? `<p class="music-by"><i class="fa-solid fa-music"></i> ${song.musicBy}</p>` : ''}
                </div>
                ${song.youtube && song.youtube.url ? `
                <button class="youtube-badge" title="Watch on YouTube" onclick="event.stopPropagation(); openVideoModal('${song.youtube.url}')">
                    <i class="fa-brands fa-youtube"></i>
                </button>
                ` : ''}
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
    // if (song.movie) return song.movie;
    if (song.album) return song.album;
    console.log(song);

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


// Video Modal Logic
function openVideoModal(url) {
    // Extract Video ID
    // Support formats: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
    let videoId = '';

    // Regex for robust ID extraction
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        videoId = match[2];
    } else {
        console.warn("Could not extract video ID from URL:", url);
    }

    if (videoId) {
        console.log("Opening Video Modal for ID:", videoId);

        // constructed YouTube URL
        const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Try Max Resolution first (HD)
        const hdThumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const sdThumb = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
        const hqThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        console.log("Attempting to load HD thumbnail:", hdThumb);

        if (videoThumbnail) {
            videoThumbnail.src = hdThumb;

            // Fallback logic: HD -> SD -> HQ
            videoThumbnail.onerror = function () {
                if (this.src === hdThumb) {
                    console.warn("HD Thumbnail failed, trying SD...");
                    this.src = sdThumb;
                } else if (this.src === sdThumb) {
                    console.warn("SD Thumbnail failed, using HQ fallback.");
                    this.src = hqThumb;
                }
            };
        } else {
            console.error("Error: video-thumbnail element not found in DOM");
        }

        // Set Click Action (Open in New Tab)
        const openInNewTab = () => window.open(ytUrl, '_blank');
        videoThumbnail.onclick = openInNewTab;
        if (thumbnailPlayBtn) thumbnailPlayBtn.onclick = openInNewTab;

        // Set fallback link text/href
        const fallbackLink = document.getElementById('youtube-fallback');
        if (fallbackLink) {
            fallbackLink.href = ytUrl;
        }

        videoModal.classList.add('active');

        if (isPlaying) togglePlay();
    }
}
// Expose to window for inline HTML onclick
window.openVideoModal = openVideoModal;

function closeVideoModal() {
    videoModal.classList.remove('active');
    videoThumbnail.src = ''; // Clear image
}



// Themes Configuration
const themes = {
    default: {
        '--bg-color': '#000000',
        '--accent-color': '#8a2be2',
        '--accent-glow': 'rgba(138, 43, 226, 0.4)',
        '--blob-1': '#6a00ff',
        '--blob-2': '#ff0055',
        '--blob-3': '#00e5ff'
    },
    ocean: {
        '--bg-color': '#001a1a',
        '--accent-color': '#00bfff',
        '--accent-glow': 'rgba(0, 191, 255, 0.4)',
        '--blob-1': '#00ced1', // Dark Turquoise
        '--blob-2': '#1e90ff', // Dodger Blue
        '--blob-3': '#00008b'  // Dark Blue
    },
    sunset: {
        '--bg-color': '#1a0500',
        '--accent-color': '#ff4500',
        '--accent-glow': 'rgba(255, 69, 0, 0.4)',
        '--blob-1': '#ff8c00', // Dark Orange
        '--blob-2': '#dc143c', // Crimson
        '--blob-3': '#800080'  // Purple
    },
    forest: {
        '--bg-color': '#051a05',
        '--accent-color': '#32cd32',
        '--accent-glow': 'rgba(50, 205, 50, 0.4)',
        '--blob-1': '#228b22', // Forest Green
        '--blob-2': '#00fa9a', // Medium Spring Green
        '--blob-3': '#556b2f'  // Dark Olive Green
    },
    gold: {
        '--bg-color': '#1a1a00',
        '--accent-color': '#ffd700',
        '--accent-glow': 'rgba(255, 215, 0, 0.4)',
        '--blob-1': '#daa520', // Goldenrod
        '--blob-2': '#b8860b', // Dark Goldenrod
        '--blob-3': '#ffd700'  // Gold
    }
};

function applyTheme(themeName) {
    const theme = themes[themeName] || themes.default;
    const root = document.documentElement;

    Object.keys(theme).forEach(key => {
        root.style.setProperty(key, theme[key]);
    });
}

// Event Listeners
function setupEventListeners() {
    // Filters
    [filterLanguage, filterGenre, filterYear, filterSinger, filterMusicBy].forEach(el => {
        el.addEventListener('change', applyFilters);
    });
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
    audio.addEventListener('ended', nextSong);

    progressContainer.addEventListener('click', setProgress);

    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });
}

// Init
init();
