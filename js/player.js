// Audio Player Logic
import { state, audio } from './state.js';
import { renderSongs } from './ui.js';
import { getAlbumName, formatTime } from './utils.js';

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
}

export function playSong() {
    audio.play().then(() => {
        state.isPlaying = true;
        updatePlayBtn();
        nowPlayingSection.classList.add('playing');
        renderSongs();
    }).catch(e => console.error("Playback error:", e));
}

export function pauseSong() {
    audio.pause();
    state.isPlaying = false;
    updatePlayBtn();
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

export function prevSong() {
    if (state.currentSongIndex > 0) {
        state.currentSongIndex--;
    } else {
        state.currentSongIndex = state.songsData.length - 1; // Loop to last
    }
    loadSong(state.songsData[state.currentSongIndex]);
    playSong();
    renderSongs();
}

export function nextSong() {
    if (state.currentSongIndex < state.songsData.length - 1) {
        state.currentSongIndex++;
    } else {
        state.currentSongIndex = 0; // Loop to first
    }
    loadSong(state.songsData[state.currentSongIndex]);
    playSong();
    renderSongs();
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
