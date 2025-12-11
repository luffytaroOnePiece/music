
import { state, audio } from './state.js';
import { togglePlay, prevSong, nextSong, setProgress, playRandomSong } from './player.js';
import { getAlbumName, formatTime } from './utils.js';

// Elements
const fullPlayerModal = document.getElementById('full-player-modal');
const closeBtn = document.getElementById('close-full-player');
const fpArt = document.getElementById('fp-art');
const fpBgImage = document.getElementById('fp-bg-image');
const fpTitle = document.getElementById('fp-title');
const fpArtist = document.getElementById('fp-artist');
const fpPlaylistName = document.getElementById('fp-playlist-name');

const fpProgressContainer = document.getElementById('fp-progress-container');
const fpProgressBar = document.getElementById('fp-progress-bar');
const fpCurrentTime = document.getElementById('fp-current-time');
const fpDuration = document.getElementById('fp-duration');

// Controls
const fpPlayBtn = document.getElementById('fp-play-btn');
const fpPrevBtn = document.getElementById('fp-prev-btn');
const fpNextBtn = document.getElementById('fp-next-btn');
const fpShuffleBtn = document.getElementById('fp-shuffle-btn');
const fpRepeatBtn = document.getElementById('fp-repeat-btn');

// Mini Player Trigger (Cover in Footer)
// We need to attach this listener dynamically or ensure element exists
// best to do it in init()

export function initFullPlayer() {
    setupEventListeners();
}

function setupEventListeners() {
    // Open Trigger: Click on Mini Player Cover
    const miniPlayerCover = document.querySelector('.player-left .cover-wrapper');
    if (miniPlayerCover) {
        miniPlayerCover.style.cursor = 'pointer'; // Make it look clickable
        miniPlayerCover.addEventListener('click', openFullPlayer);
    }

    // Also track info for ease of use?
    const miniTrackInfo = document.querySelector('.player-left .track-info-mini');
    if (miniTrackInfo) {
        miniTrackInfo.style.cursor = 'pointer';
        miniTrackInfo.addEventListener('click', openFullPlayer);
    }

    // Close Button
    closeBtn.addEventListener('click', closeFullPlayer);

    // Controls
    fpPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
    });

    fpPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevSong();
    });

    fpNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSong();
    });

    fpShuffleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleShuffleToggle();
    });

    // Progress
    fpProgressContainer.addEventListener('click', (e) => {
        const width = fpProgressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;

        if (duration) {
            audio.currentTime = (clickX / width) * duration;
        }
    });
}

function handleShuffleToggle() {
    state.isShuffle = !state.isShuffle;

    // Update main shuffle btn if it exists (sync)
    const mainShuffleBtn = document.getElementById('shuffle-btn');
    if (mainShuffleBtn) {
        mainShuffleBtn.classList.toggle('active', state.isShuffle);
    }

    // Update local shuffle btn
    updateShuffleUI();

    if (state.isShuffle) {
        playRandomSong();
    }
}

export function openFullPlayer() {
    // Populate data before showing
    updateFullPlayerUI();
    fullPlayerModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

export function closeFullPlayer() {
    fullPlayerModal.classList.remove('active');
    document.body.style.overflow = '';
}

export function updateFullPlayerUI() {
    if (state.currentSongIndex === -1) return;

    const song = state.songsData[state.currentSongIndex];
    if (!song) return;

    // Text
    fpTitle.innerText = song.title;
    fpArtist.innerText = song.singers ? song.singers.join(', ') : 'Unknown Artist';
    fpPlaylistName.innerText = getAlbumName(song);

    // Images
    fpArt.src = song.coverImage;
    fpBgImage.src = song.coverImage;

    // Play Button Sync
    updateFullPlayerPlayBtn();

    // Shuffle UI Sync
    updateShuffleUI();
}

export function updateFullPlayerPlayBtn() {
    fpPlayBtn.innerHTML = state.isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
}

function updateShuffleUI() {
    fpShuffleBtn.classList.toggle('active', state.isShuffle);
}

export function syncFullPlayerProgress(currentTime, duration) {
    if (!fullPlayerModal.classList.contains('active')) return; // Optimization

    if (isNaN(duration)) return;

    const progressPercent = (currentTime / duration) * 100;
    fpProgressBar.style.width = `${progressPercent}%`;

    fpCurrentTime.innerText = formatTime(currentTime);
    fpDuration.innerText = formatTime(duration);
}
