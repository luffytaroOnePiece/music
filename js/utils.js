// Utility Functions

export function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

export function getAlbumName(song) {
    // if (song.movie) return song.movie;
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
