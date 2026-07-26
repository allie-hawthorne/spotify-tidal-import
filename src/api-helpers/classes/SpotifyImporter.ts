import { chunk } from "lodash";
import type { Playlist, PlaylistWithItems } from "../../types";
import { spotifyApi, type SetNumberFn } from "../spotify";
import { mapSpotifyTracksToUniversalTracks } from "../../mappers/spotifyMappers";
import pRetry from "@n8n/p-retry";

// TODO: It'd be nice to dynamically maximise this for people with slow connections and minimise for those with fast, to avoid 429s
// I'm pretty sure 3 is fine, but during repeated testing it did 429 me
const CHUNK_SIZE = 2;

const getPlaylistTracks = async (playlistId: string) => {
  const fn = () => spotifyApi.playlists.getPlaylistItems(playlistId);
  const playlistTracksRes = await pRetry(fn);
  console.log(`Tracks for playlist ${playlistId}:`, playlistTracksRes.items);
  return mapSpotifyTracksToUniversalTracks(playlistTracksRes.items);
}

export class SpotifyImporter {
  constructor() {}

  getTracksFromPlaylist = async (playlist: Playlist): Promise<PlaylistWithItems> => {
    const playlistTracks = await getPlaylistTracks(playlist.id);
    console.log("Getting tracks for playlist:", playlist);

    return {
      ...playlist,
      tracks: playlistTracks
    };
  };

  getTracksFromPlaylists = async (playlists: Playlist[], setPlaylistProgress: SetNumberFn): Promise<PlaylistWithItems[]> => {
    const chunkedPlaylists = chunk(playlists, CHUNK_SIZE); // Rate limits can get rough here, but parallelizing in chunks of 3 seems to work ok

    const allPlaylists: PlaylistWithItems[] = [];
    for (const playlistChunk of chunkedPlaylists) {
      console.log("Getting tracks for playlist chunk:", playlistChunk.map(p => p.playlistName));
      const playlistChunkWithTracks = await Promise.all(playlistChunk.map(this.getTracksFromPlaylist));
      setPlaylistProgress(v => v += CHUNK_SIZE)

      allPlaylists.push(...playlistChunkWithTracks);
    }
      
    return allPlaylists;
  };
}