// YouTube Video Modal Logic
import { state } from './state.js';
import { togglePlay } from './player.js';

const videoModal = document.getElementById('video-modal');
const videoThumbnail = document.getElementById('video-thumbnail');
const thumbnailPlayBtn = document.getElementById('thumbnail-play-btn');

export function openVideoModal(url) {
    // Extract Video ID
    let videoId = '';
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
            // Fallback logic: HD -> SD -> HQ
            videoThumbnail.onerror = function () {
                const currentSrc = this.src;
                if (currentSrc.includes('maxresdefault')) {
                    console.warn("HD Thumbnail (maxresdefault) failed, trying SD (sddefault)...");
                    this.src = sdThumb;
                } else if (currentSrc.includes('sddefault')) {
                    console.warn("SD Thumbnail (sddefault) failed, using HQ fallback (hqdefault).");
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

        if (state.isPlaying) togglePlay();
    }
}

export function closeVideoModal() {
    videoModal.classList.remove('active');
    videoThumbnail.src = ''; // Clear image
}
