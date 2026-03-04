import type { Playlist, PlaylistForImport } from "../../types";
import { ImportStatus } from "../../types";
import { spotifyApi } from "../spotify";

export class SpotifyImporter {
  constructor() {}

  getTracksFromPlaylists = async (playlists: Playlist[]): Promise<PlaylistForImport[]> => {
    // TODO: should probably protect against rate limiting but spotify's is super high
    const playlistTracksRes = await Promise.all(playlists.map(p => spotifyApi.playlists.getPlaylistItems(p.id)));

    const updatedPlaylists: PlaylistForImport[] = playlists.map((_, i) => {
      const items = playlistTracksRes[i].items;
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