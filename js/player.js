// Audio Player Logic
import { state, audio } from './state.js';
import { renderSongs } from './ui.js';
import { getAlbumName, formatTime } from './utils.js';
import { updateFullPlayerUI, updateFullPlayerPlayBtn, syncFullPlayerProgress } from './fullPlayer.js';

// DOM Elements needed for player updates
const nowPlayingSection = document.querySelector('.now-playing');
const currentCover = document.getElementById('current-cover');
const defaultCoverIcon = document.getElementById('default-cover-icon');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');
const currentTags = document.getElementById('current-tags');
const currentMovie = document.getElementById('current-movie');
const playBtn = document.getElementById('play-btn');

export function loadAndPlaySongById(id) {
    const index = state.songsData.findIndex(s => s.id === id);
    if (index === -1) return;

    // If same song, toggle play/pause
    if (state.currentSongIndex === index) {
        togglePlay();
        return;
    }

    state.currentSongIndex = index;
    loadSong(state.songsData[index]);
    playSong();
    renderSongs(); // Update active state icons
}

export function loadSong(song) {
    currentTitle.innerText = song.title;
    currentArtist.innerText = song.singers ? song.singers.join(', ') : 'Unknown Artist';

    currentCover.src = song.coverImage;
    currentCover.style.display = 'block';
    defaultCoverIcon.style.display = 'none';

    currentMovie.innerText = getAlbumName(song);
    currentMovie.title = currentMovie.innerText;
    audio.src = song.audioUrl;

    // Update Tags
    currentTags.innerHTML = `
        ${song.language ? `<span class="tag">${song.language}</span>` : ''}
        ${song.year ? `<span class="tag">${song.year}</span>` : ''}
        ${song.genre ? `<span class="tag">${song.genre}</span>` : ''}
    `;

    updateFullPlayerUI();
}

export function playSong() {
    audio.play().then(() => {
        state.isPlaying = true;
        updatePlayBtn();
        updateFullPlayerPlayBtn();
        nowPlayingSection.classList.add('playing');
        renderSongs();
    }).catch(e => console.error("Playback error:", e));
}

export function pauseSong() {
    audio.pause();
    state.isPlaying = false;
    updatePlayBtn();
    updateFullPlayerPlayBtn();
    nowPlayingSection.classList.remove('playing');
    renderSongs();
}

export function togglePlay() {
    if (state.currentSongIndex === -1 && state.visibleSongs.length > 0) {
        loadAndPlaySongById(state.visibleSongs[0].id);
        return;
    }

    if (state.isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

export function updatePlayBtn() {
    playBtn.innerHTML = state.isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
}

// Helper to play from visible songs list
function playFromVisibleIndex(index) {
    const song = state.visibleSongs[index];
    if (!song) return;

    // Update global index for that song
    state.currentSongIndex = state.songsData.findIndex(s => s.id === song.id);
    loadSong(song);
    playSong();
    renderSongs();
}

export function nextSong() {
    if (state.visibleSongs.length === 0) return;

    if (state.isShuffle) {
        playRandomSong();
        return;
    }

    // Find current song's index in the visible list
    const currentId = state.currentSongIndex !== -1 ? state.songsData[state.currentSongIndex]?.id : null;
    let visibleIndex = state.visibleSongs.findIndex(s => s.id === currentId);

    // If current song not in visible list (or no song playing), start from -1 implies next is 0
    let nextIndex = (visibleIndex + 1) % state.visibleSongs.length;
    playFromVisibleIndex(nextIndex);
}

export function prevSong() {
    if (state.visibleSongs.length === 0) return;

    const currentId = state.currentSongIndex !== -1 ? state.songsData[state.currentSongIndex]?.id : null;
    let visibleIndex = state.visibleSongs.findIndex(s => s.id === currentId);

    // logic: (i - 1 + len) % len
    let prevIndex = (visibleIndex - 1 + state.visibleSongs.length) % state.visibleSongs.length;
    playFromVisibleIndex(prevIndex);
}

export function playRandomSong() {
    if (state.visibleSongs.length === 0) return;

    // Pick a random index
    let randomIndex = Math.floor(Math.random() * state.visibleSongs.length);

    // Try to pick a different song if there's more than 1 song
    // Only if a song is currently playing from the visible list
    const currentId = state.currentSongIndex !== -1 ? state.songsData[state.currentSongIndex]?.id : null;

    // Check if the random song is the same as current.
    if (state.visibleSongs.length > 1 && state.visibleSongs[randomIndex].id === currentId) {
        randomIndex = (randomIndex + 1) % state.visibleSongs.length;
    }

    playFromVisibleIndex(randomIndex);
}

// Progress Bar Logic
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');

export function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (isNaN(duration)) return;

    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;

    currentTimeEl.innerText = formatTime(currentTime);
    totalDurationEl.innerText = formatTime(duration);

    syncFullPlayerProgress(currentTime, duration);
}

export function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;

    audio.currentTime = (clickX / width) * duration;
}

// Volume
export function setVolume(value) {
    audio.volume = value;
}
