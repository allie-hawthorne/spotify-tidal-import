import { useState } from "react";
import { performRateLimitedRequest } from "../Playlists/useImportSpotify";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { chunk } from "lodash";

export interface MinPlaylist {
  id: string,
  playlistName: string,
}

const PLAYLISTS_CHUNK_SIZE = 2;
const MAX_TRACKS_PER_BATCH = 20; // Tidal API allows adding max 20 tracks at a time

export const useImportPlaylists = () => {
  const {playlists} = useSpotify();

  const [succeededPlaylists, setSucceededPlaylists] = useState<MinPlaylist[]>([]);
  const [erroredPlaylists, setErroredPlaylists] = useState<MinPlaylist[]>([]);

  const importPlaylists = async (importer: TidalImporter) => {
    const playlistChunks = chunk(playlists, PLAYLISTS_CHUNK_SIZE);
    for (const [, playlistChunk] of playlistChunks.entries()) {

      // TODO: because we're awaiting each playlist chunk sequentially, if one playlist takes a long time to import, it will hold up the second slot.
      // We could sort playlists by track count so that longer ones are grouped together
      // or we could have a different approach to chunking overall maybe
      await Promise.all(playlistChunk.map(async ({name: playlistName, tracks}) => {
        const destPlaylistId = await performRateLimitedRequest(() => importer.createPlaylist(playlistName));

        if (!destPlaylistId) return;

        const destTracksToAdd: string[] = [];
        for (const playlistTrack of tracks) {
          const destTracks = await performRateLimitedRequest(() => importer.searchForTrack(playlistTrack.trackName, [playlistTrack.artistName]));

          // TODO: Should be matching the same way as saved tracks
          
          const destTrack = destTracks?.[0];

          if (!destTrack) continue;
          destTracksToAdd.push(destTrack.id);
        }

        const batches = chunk(destTracksToAdd, MAX_TRACKS_PER_BATCH);
        for (const [batchIndex, batch] of batches.entries()) {
          const success = await performRateLimitedRequest(() => importer.addToPlaylist(destPlaylistId, batch));
          if (success) {
            console.log(`Added batch ${batchIndex + 1}/${batches.length} of tracks to destination playlist:`, playlistName, batch);
          } else {
            setErroredPlaylists(prev => [...prev, {id: destPlaylistId, playlistName}]);
            console.error(`Failed to add batch ${batchIndex + 1}/${batches.length} of tracks to destination playlist:`, playlistName, batch);
          }
        }

        setSucceededPlaylists(prev => [...prev, {id: destPlaylistId, playlistName}]);
      }));
    }
  };

  return {
    importPlaylists,
    succeededPlaylists,
    erroredPlaylists
  }
}
