import { SpotifyApi, type Artist, type SavedAlbum, type SavedTrack, type SimplifiedPlaylist } from '@spotify/web-api-ts-sdk';
import type { Playlist } from '../types';
import { TIDAL_PLACEHOLDER_IMAGE_URL } from './tidal';

const SPOTIFY_CLIENT_ID = '2211a17ab92042db90b6e94f3dcb3988';
const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:5500/spotify/';
export const spotifyApi = SpotifyApi.withUserAuthorization(SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, ["user-read-private", "user-read-email", "user-library-read", "user-follow-read"]);

 const mapSpotifyPlaylistToPlaylist = (playlist: SimplifiedPlaylist): Playlist => ({
  id: playlist.id,
  name: playlist.name,
  trackCount: playlist.tracks?.total ?? 0,
  imageUrl: playlist.images?.[0]?.url ?? TIDAL_PLACEHOLDER_IMAGE_URL
});

export const getSpotifyPlaylists = async () => {
  // TODO: get user id from spotify api instead of hardcoding it
  const playlists = await spotifyApi.playlists.getUsersPlaylists('1121194900');
  return playlists.items.map(mapSpotifyPlaylistToPlaylist);
}

export const getSpotifySavedArtists = async () => {
  const allArtists: Artist[] = []
  let after: string | undefined = undefined;
  do {
    const {artists} = await spotifyApi.currentUser.followedArtists(after);
    allArtists.push(...artists.items);

    // @ts-expect-error - Cursor is in the object but not in the type for some reason
    after = artists.cursors.after;
  } while (after)

  return allArtists;
}

export const getSpotifySavedAlbums = async () => {
  const allAlbums: SavedAlbum[] = []
  let offset = 0;
  let next = '';
  do {
    const albums = await spotifyApi.currentUser.albums.savedAlbums(50, offset);
    allAlbums.push(...albums.items);

    offset += albums.limit;
    next = albums.next ?? '';
  } while (next);

  return allAlbums;
}

export const getSpotifySavedTracks = async () => {
  const allTracks: SavedTrack[] = []
  let offset = 0;
  let next = '';
  do {
    const tracks = await spotifyApi.currentUser.tracks.savedTracks(50, offset);
    allTracks.push(...tracks.items);

    offset += tracks.limit;
    next = tracks.next ?? '';
  } while (next);

  return allTracks;
}