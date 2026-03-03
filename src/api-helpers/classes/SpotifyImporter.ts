import type { Playlist } from "../../pages/Playlists/Playlists";
import { spotifyApi } from "../spotify";

export class SpotifyImporter {
  constructor() {}

  getTracksFromPlaylist = async (spotifyPlaylists: Playlist[], selectedPlaylists: Playlist[]) => {
    const selectedSpotifyPlaylists = spotifyPlaylists.filter(p => selectedPlaylists.some(sp => sp.id === p.id));

    // TODO: should probably protect against rate limiting but spotify's is super high
    const playlistTracksRes = await Promise.all(selectedSpotifyPlaylists.map(p => spotifyApi.playlists.getPlaylistItems(p.id)));
    // For some reason the response doesn't include the playlist name, so we're using the index
    const playlistTracks = playlistTracksRes.map(({items}, i) => ({name: selectedSpotifyPlaylists[i].name, items: items.map(({track}) => ({title: track.name, artists: track.artists.map(a => a.name)}))}));
    return playlistTracks;
  };
}