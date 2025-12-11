// State Management
export const state = {
    songsData: [],
    visibleSongs: [],
    filters: {},
    currentSongIndex: -1,
    isPlaying: false,
    viewMode: 'songs', // 'songs', 'albums', 'album_detail'
    currentAlbum: null,
};

export const audio = new Audio();
