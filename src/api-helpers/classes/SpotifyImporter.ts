import { chunk } from "lodash";
import type { Artist, Playlist as SpotifyPlaylist, SavedAlbum, SavedTrack } from "@spotify/web-api-ts-sdk";
import type { IBasePlaylist, IPlaylist, SetNumberFn } from "../../types";
import { spotifyApi } from "../spotify";
import { mapSpotifyAlbumsToUniversalAlbums, mapSpotifyArtistsToUniversalArtists, mapSpotifyPlaylistToUniversalPlaylist, mapSpotifyTracksToUniversalTracks } from "../../mappers/spotifyMappers";
import pRetry from "@n8n/p-retry";
import { PlaylistState, type PlaylistStateValue } from "../SpotifyContext";

// TODO: It'd be nice to dynamically maximise this for people with slow connections and minimise for those with fast, to avoid 429s
// I'm pretty sure 3 is fine, but during repeated testing it did 429 me
const CHUNK_SIZE = 2;

const getPlaylistTracks = async (playlistId: string) => {
  const fn = () => spotifyApi.playlists.getPlaylistItems(playlistId);
  const playlistTracksRes = await pRetry(fn);
  console.log(`Tracks for playlist ${playlistId}:`, playlistTracksRes.items);
  return mapSpotifyTracksToUniversalTracks(playlistTracksRes.items);
}

export class SpotifyExporter {
  private getTracksFromPlaylist = async (playlist: IBasePlaylist): Promise<IPlaylist> => {
    const playlistTracks = await getPlaylistTracks(playlist.id);
    console.log("Getting tracks for playlist:", playlist);

    return {...playlist, tracks: playlistTracks};
  };

  getTracksFromPlaylists = async (playlists: IBasePlaylist[], setPlaylistProgress: SetNumberFn): Promise<IPlaylist[]> => {
    const chunkedPlaylists = chunk(playlists, CHUNK_SIZE); // Rate limits can get rough here, but parallelizing in chunks of 3 seems to work ok

    const allPlaylists: IPlaylist[] = [];
    for (const playlistChunk of chunkedPlaylists) {
      console.log("Getting tracks for playlist chunk:", playlistChunk.map(p => p.playlistName));
      const playlistChunkWithTracks = await Promise.all(playlistChunk.map(this.getTracksFromPlaylist));
      setPlaylistProgress(v => v += CHUNK_SIZE)

      allPlaylists.push(...playlistChunkWithTracks);
    }
      
    return allPlaylists;
  };

  getPlaylists = async (setPlaylistTotal: SetNumberFn, setPlaylistProgress: SetNumberFn, setPlaylistState: (v: PlaylistStateValue) => void) => {
    const allPlaylists: SpotifyPlaylist[] = [];
    const { id: userId } = await pRetry(() => spotifyApi.currentUser.profile());
    let offset = 0;
    let next = '';
    do {
      const fn = () => spotifyApi.playlists.getUsersPlaylists(userId, undefined, offset);
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

    const playlistsWithTracks = await this.getTracksFromPlaylists(mappedPlaylists, setPlaylistProgress);

    console.log('All playlists with tracks:', playlistsWithTracks);
    
    return playlistsWithTracks;
  }
  
  getSavedAlbums = async (setAlbumTotal: SetNumberFn, setAlbumProgress: SetNumberFn) => {
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
  };

  getSavedTracks = async (setTrackTotal: SetNumberFn, setTrackProgress: SetNumberFn) => {
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
  };

  getSavedArtists = async (setArtistTotal: SetNumberFn, setArtistProgress: SetNumberFn) => {
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
  };
}