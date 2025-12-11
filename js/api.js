// API / Data Fetching
import { state } from "./state.js";

function getTimestampVersion() {
  return Date.now();
}

const FILTERS_URL = `https://cdn.jsdelivr.net/gh/luffytaroOnePiece/gists@main/music/filters.json?v=${getTimestampVersion()}`;
const METADATA_URL = `https://cdn.jsdelivr.net/gh/luffytaroOnePiece/gists@main/music/metadata.json?v=${getTimestampVersion()}`;

export async function fetchData() {
  const [filtersResponse, metadataResponse] = await Promise.all([
    fetch(FILTERS_URL),
    fetch(METADATA_URL),
  ]);

  if (!filtersResponse.ok || !metadataResponse.ok) {
    throw new Error("Network response was not ok");
  }

  state.filters = await filtersResponse.json();
  const metadata = await metadataResponse.json();

  // Fix URLs if they are malformed (user reported issue with /main/ vs @main)
  state.songsData = (metadata.songs || []).map((song) => ({
    ...song,
    audioUrl: song.audioUrl
      .replace("/audio/main/", "/audio@main/")
      .replace("/coverimages/main/", "/coverimages@main/"),
    coverImage: song.coverImage.replace(
      "/coverimages/main/",
      "/coverimages@main/"
    ),
    albumImage: song.albumImage
      ? song.albumImage.replace("/coverimages/main/", "/coverimages@main/")
      : song.albumImage,
  }));

  state.visibleSongs = [...state.songsData];
}
