import { SpotifyApi, type Artist, type SavedAlbum, type SavedTrack, type Playlist as SpotifyPlaylist } from '@spotify/web-api-ts-sdk';
import { SpotifyImporter } from './classes/SpotifyImporter';
import { mapSpotifyAlbumsToUniversalAlbums, mapSpotifyArtistsToUniversalArtists, mapSpotifyPlaylistToUniversalPlaylist, mapSpotifyTracksToUniversalTracks } from '../mappers/spotifyMappers';
import pRetry from '@n8n/p-retry';
import { PlaylistState, type PlaylistStateValue } from './SpotifyContext';
import type { Dispatch, SetStateAction } from 'react';

const SPOTIFY_CLIENT_ID = '2211a17ab92042db90b6e94f3dcb3988';
const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:5500/spotify/';
export const spotifyApi = SpotifyApi.withUserAuthorization(SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, ["user-read-private", "user-read-email", "user-library-read", "user-follow-read"]);

export const getSpotifyPlaylists = async (setPlaylistTotal: SetNumberFn, setPlaylistProgress: SetNumberFn, setPlaylistState: (v: PlaylistStateValue) => void) => {
  const spotify = new SpotifyImporter();
  
  const allPlaylists: SpotifyPlaylist[] = [];
  let offset = 0;
  let next = '';
  do {
    // TODO: get user id from spotify api instead of hardcoding it
    const fn = () => spotifyApi.playlists.getUsersPlaylists('1121194900', undefined, offset);
    const playlists = await pRetry(fn);
    allPlaylists.push(...playlists.items);
    
    offset += playlists.limit;
    next = playlists.next ?? '';
    setPlaylistTotal(playlists.total);
    setPlaylistProgress(Math.min(playlists.total, offset));
  } while (next);
  
  setPlaylistProgress(0);
  setPlaylistState(PlaylistState.Tracks);

  const mappedPlaylists = allPlaylists.map(mapSpotifyPlaylistToUniversalPlaylist);
  
  console.log('Spotify playlists:', allPlaylists);
  console.log('Total Tracks:', allPlaylists.reduce((sum, p) => sum + (p.tracks?.total || 0), 0));

  const playlistsWithTracks = await spotify.getTracksFromPlaylists(mappedPlaylists, setPlaylistProgress);

  console.log('All playlists with tracks:', playlistsWithTracks);
  
  return playlistsWithTracks;
}

export type SetNumberFn = Dispatch<SetStateAction<number>>
export const getSpotifySavedArtists = async (setArtistTotal: SetNumberFn, setArtistProgress: SetNumberFn) => {
  const allArtists: Artist[] = [];
  let after: string | undefined = undefined;
  do {
    const fn = () => spotifyApi.currentUser.followedArtists(after, 50);
    const {artists} = await pRetry(fn);
    allArtists.push(...artists.items);

    // @ts-expect-error - Cursor is in the object but not in the type for some reason
    after = artists.cursors.after;
    setArtistTotal(artists.total);
    setArtistProgress(allArtists.length);
  } while (after);

  return mapSpotifyArtistsToUniversalArtists(allArtists);
}

export const getSpotifySavedAlbums = async (setAlbumTotal: SetNumberFn, setAlbumProgress: SetNumberFn) => {
  const allAlbums: SavedAlbum[] = []
  let offset = 0;
  let next = '';
  do {
    const fn = () => spotifyApi.currentUser.albums.savedAlbums(50, offset);
    const albums = await pRetry(fn);
    allAlbums.push(...albums.items);

    offset += albums.limit;
    next = albums.next ?? '';
    setAlbumTotal(albums.total);
    setAlbumProgress(offset);
  } while (next);

  return mapSpotifyAlbumsToUniversalAlbums(allAlbums);
}

export const getSpotifySavedTracks = async (setTrackTotal: SetNumberFn, setTrackProgress: SetNumberFn) => {
  const allTracks: SavedTrack[] = []
  let offset = 0;
  let next = '';
  do {
    const fn = () => spotifyApi.currentUser.tracks.savedTracks(50, offset);
    const tracks = await pRetry(fn);
    allTracks.push(...tracks.items);

    offset += tracks.limit;
    next = tracks.next ?? '';
    setTrackTotal(tracks.total)
    setTrackProgress(offset);
  } while (next);

  return mapSpotifyTracksToUniversalTracks(allTracks);
}