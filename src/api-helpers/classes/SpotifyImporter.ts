import { chunk } from "lodash";
import { performRateLimitedRequest } from "../../pages/Playlists/useImportSpotify";
import type { Playlist, PlaylistForImport, PlaylistWithItems } from "../../types";
import { ImportStatus } from "../../types";
import { spotifyApi } from "../spotify";

const getPlaylistTracks = async (playlistId: string) => {
  try {
    const playlistTracksRes = await spotifyApi.playlists.getPlaylistItems(playlistId);
    console.log(`Tracks for playlist ${playlistId}:`, playlistTracksRes.items);
    return playlistTracksRes.items;
  } catch (error) {
    if (error instanceof Error) {
      // TODO: this is bad but spotify doesn't expose error codes without custom logic. should do at some point
      if (error.message.includes("rate limit")) return 429;
    }
  }
  return [];
}

export class SpotifyImporter {
  constructor() {}

  _getTracksFromPlaylists = async (playlists: Playlist[]): Promise<PlaylistForImport[]> => {
    const playlistTracksRes = await Promise.all(playlists.map(p => performRateLimitedRequest(() => getPlaylistTracks(p.id))));

    const updatedPlaylists: PlaylistForImport[] = playlists.map((_, i) => {
      const items = playlistTracksRes[i];
      return {
        ...playlists[i],
        status: ImportStatus.NotStarted,
        items: items.map(({track}) => ({
          id: track.id,
          title: track.name,
          artists: track.artists.map(a => a.name),
          status: ImportStatus.NotStarted
        }))
      };
    });

    return updatedPlaylists;
  };

  getTracksFromPlaylist = async (playlist: Playlist): Promise<PlaylistWithItems> => {
    const playlistTracks = await performRateLimitedRequest(() => getPlaylistTracks(playlist.id));
    console.log("Getting tracks for playlist:", playlist);

    return {
      ...playlist,
      items: playlistTracks.map(({track}) => ({
        id: track.id,
        title: track.name,
        artists: track.artists.map(a => a.name),
      }))
    };
  };

  getTracksFromPlaylists = async (playlists: Playlist[]): Promise<PlaylistWithItems[]> => {
    const chunkedPlaylists = chunk(playlists, 3); // Rate limits can get rough here, but parallelizing in chunks of 3 seems to work ok

    const allPlaylists: PlaylistWithItems[] = [];
    for (const playlistChunk of chunkedPlaylists) {
      console.log("Getting tracks for playlist chunk:", playlistChunk.map(p => p.name));
      const playlistChunkWithTracks = await Promise.all(playlistChunk.map(this.getTracksFromPlaylist));

      allPlaylists.push(...playlistChunkWithTracks);
    }
      
    return allPlaylists;
  };
}