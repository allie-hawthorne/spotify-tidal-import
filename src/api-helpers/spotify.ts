import { SpotifyApi, type SimplifiedPlaylist } from '@spotify/web-api-ts-sdk';
import type { Playlist } from '../pages/Playlists/Playlists';

const SPOTIFY_CLIENT_ID = '2211a17ab92042db90b6e94f3dcb3988';
const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:5500/spotify/';
export const spotifyApi = SpotifyApi.withUserAuthorization(SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, ["user-read-private", "user-read-email"]);

const mapSpotifyPlaylistToPlaylist = (playlist: SimplifiedPlaylist): Playlist => ({
  id: playlist.id,
  name: playlist.name,
  description: playlist.description,
  trackCount: playlist.tracks?.total ?? 0
});

export const getSpotifyPlaylists = async () => {
  // TODO: get user id from spotify api instead of hardcoding it
  const playlists = await spotifyApi.playlists.getUsersPlaylists('1121194900');
  return playlists.items.map(mapSpotifyPlaylistToPlaylist);
}