import { chunk } from "lodash";
import { performRateLimitedRequest } from "../../utils";
import type { Playlist, PlaylistForImport, PlaylistWithItems } from "../../types";
import { ImportStatus } from "../../types";
import { spotifyApi } from "../spotify";
import { mapSpotifyTracksToUniversalTracks } from "../../mappers/spotifyMappers";
import pRetry from "@n8n/p-retry";

const getPlaylistTracks = async (playlistId: string) => {
  try {
    const fn = () => spotifyApi.playlists.getPlaylistItems(playlistId);
    const playlistTracksRes = await pRetry(fn);
    console.log(`Tracks for playlist ${playlistId}:`, playlistTracksRes.items);
    return mapSpotifyTracksToUniversalTracks(playlistTracksRes.items);
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
    const allPlaylistTracks = await Promise.all(playlists.map(p => performRateLimitedRequest(() => getPlaylistTracks(p.id))));

    const updatedPlaylists: PlaylistForImport[] = playlists.map((_, i) => {
      const playlistTracks = allPlaylistTracks[i];
      return {
        ...playlists[i],
        status: ImportStatus.NotStarted,
        items: playlistTracks.map((track) => ({
          id: track.id,
          title: track.trackName,
          artists: [track.artistName],
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
      tracks: playlistTracks
    };
  };

  getTracksFromPlaylists = async (playlists: Playlist[]): Promise<PlaylistWithItems[]> => {
    const chunkedPlaylists = chunk(playlists, 3); // Rate limits can get rough here, but parallelizing in chunks of 3 seems to work ok

    const allPlaylists: PlaylistWithItems[] = [];
    for (const playlistChunk of chunkedPlaylists) {
      console.log("Getting tracks for playlist chunk:", playlistChunk.map(p => p.playlistName));
      const playlistChunkWithTracks = await Promise.all(playlistChunk.map(this.getTracksFromPlaylist));

      allPlaylists.push(...playlistChunkWithTracks);
    }
      
    return allPlaylists;
  };
}