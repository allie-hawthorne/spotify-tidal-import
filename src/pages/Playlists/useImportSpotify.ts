import { useCallback, type Dispatch, type SetStateAction } from "react";
import { chunk } from "lodash";
import type { Playlist } from "../../types";
import { useImportStatusManager } from "./useImportStatusManager";
import { SpotifyImporter } from "../../api-helpers/classes/SpotifyImporter";
import { TidalImporter } from "../../api-helpers/classes/TidalImporter";

const PLAYLISTS_CHUNK_SIZE = 2;
const MAX_TRACKS_PER_BATCH = 20; // Tidal API allows adding max 20 tracks at a time

const performRateLimitedRequest = async <T>(requestFn: () => Promise<T | 429>): Promise<T> => {
  let result: Awaited<ReturnType<typeof requestFn>>;
  do {
    result = await requestFn();
    // If we get rate limited, wait 5 seconds and try again
    if (result === 429) await new Promise(resolve => setTimeout(resolve, 1000));
  } while (result === 429);
  return result;
}

export const useImport = (sourcePlaylists: Playlist[], selectedPlaylists: Playlist[], setShowImportStatus: Dispatch<SetStateAction<boolean>>) => {
  const { allPlaylists, addAllPlaylists, markPlaylistCompleted, updatePlaylistStatus, updateTrackStatus } = useImportStatusManager();

  const onImportClick = useCallback(async () => {
    const spotify = new SpotifyImporter();
    const tidal = new TidalImporter();

    // TODO: maybe just have UI be dependent on import status?
    setShowImportStatus(true);
    
    const playlistTracks = await spotify.getTracksFromPlaylists(sourcePlaylists, selectedPlaylists);
    addAllPlaylists(playlistTracks);

    // console.log('Playlists to import from Spotify:', playlistTracks);
    
    const playlistChunks = chunk(playlistTracks, PLAYLISTS_CHUNK_SIZE);
    for (const [, playlistChunk] of playlistChunks.entries()) {
      updatePlaylistStatus(playlistChunk);
      
      // console.log(`Importing chunk ${index + 1}/${playlistChunks.length}`, playlistChunk);

      await Promise.all(playlistChunk.map(async ({id: sourcePlaylistId, name: playlistName, items}) => {
        const destPlaylistId = await performRateLimitedRequest(() => tidal.createPlaylist(playlistName));

        if (!destPlaylistId) return;

        const destTracksToAdd: string[] = [];
        for (const {id: sourceTrackId, title, artists} of items) {
          updateTrackStatus(sourcePlaylistId, sourceTrackId);
          
          const destTrack = await performRateLimitedRequest(() => tidal.searchForTrack(title, artists));

          if (!destTrack) continue;
          destTracksToAdd.push(destTrack.id);

          // console.log('Found track on destination:', title, artists, destTrack);
        }

        const batches = chunk(destTracksToAdd, MAX_TRACKS_PER_BATCH);
        for (const [batchIndex, batch] of batches.entries()) {
          const success = await performRateLimitedRequest(() => tidal.addToPlaylist(destPlaylistId, batch));
          if (success) {
            console.log(`Added batch ${batchIndex + 1}/${batches.length} of tracks to destination playlist:`, playlistName, batch);
          } else {
            console.error(`Failed to add batch ${batchIndex + 1}/${batches.length} of tracks to destination playlist:`, playlistName, batch);
          }
        }

        markPlaylistCompleted(sourcePlaylistId);
      }));
    };
    setShowImportStatus(false);
  }, [sourcePlaylists, selectedPlaylists, setShowImportStatus]);
  
  return { onImportClick, allPlaylists };
};