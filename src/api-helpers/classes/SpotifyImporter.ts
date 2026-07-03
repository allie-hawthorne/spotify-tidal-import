import { performRateLimitedRequest } from "../../pages/Playlists/useImportSpotify";
import type { Playlist, PlaylistForImport } from "../../types";
import { ImportStatus } from "../../types";
import { spotifyApi } from "../spotify";

const getPlaylistTracks = async (playlistId: string) => {
  try {
    const playlistTracksRes = await spotifyApi.playlists.getPlaylistItems(playlistId);
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

  getTracksFromPlaylists = async (playlists: Playlist[]): Promise<PlaylistForImport[]> => {
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
}