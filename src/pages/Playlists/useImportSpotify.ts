import { useCallback, useState } from "react";
import { chunk } from "lodash";
import type { Playlist } from "./Playlists";
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

export const useImportSpotify = (spotifyPlaylists: Playlist[], selectedPlaylists: Playlist[]) => {
  const [importingPlaylists, setImportingPlaylists] = useState<string[]>([]);
  const [importingTracks, setImportingTracks] = useState<string[]>(new Array(PLAYLISTS_CHUNK_SIZE).fill(''));
  
  const onImportClick = useCallback(async () => {
    const spotify = new SpotifyImporter();
    const tidal = new TidalImporter();

    const playlistTracks = await spotify.getTracksFromPlaylists(spotifyPlaylists, selectedPlaylists);

    console.log('Playlists to import from Spotify:', playlistTracks);
    
    const playlistChunks = chunk(playlistTracks, PLAYLISTS_CHUNK_SIZE);
    for (const [index, playlistChunk] of playlistChunks.entries()) {
      setImportingPlaylists(playlistChunk.map(p => p.name));
      console.log(`Importing chunk ${index + 1}/${playlistChunks.length}`, playlistChunk);

      await Promise.all(playlistChunk.map(async ({name: playlistName, items}, playlistIndex) => {
        const playlistId = await performRateLimitedRequest(() => tidal.createPlaylist(playlistName));

        if (!playlistId) return;

        const tidalTracksToAdd: string[] = [];
        for (const {title, artists} of items) {
          setImportingTracks(prev => {
            const newPrev = [...prev];
            newPrev[playlistIndex] = `${title} by ${artists.join(', ')}`;
            return newPrev;
          });
          const tidalTrack = await performRateLimitedRequest(() => tidal.searchForTrack(title, artists));

          if (!tidalTrack) continue;
          tidalTracksToAdd.push(tidalTrack.id);

          console.log('Found track on Tidal:', title, artists, tidalTrack);
        }

        const batches = chunk(tidalTracksToAdd, MAX_TRACKS_PER_BATCH);
        for (const [batchIndex, batch] of batches.entries()) {
          const success = await performRateLimitedRequest(() => tidal.addToPlaylist(playlistId, batch));
          if (success) {
            console.log(`Added batch ${batchIndex + 1}/${batches.length} of tracks to Tidal playlist:`, playlistName, batch);
          } else {
            console.error(`Failed to add batch ${batchIndex + 1}/${batches.length} of tracks to Tidal playlist:`, playlistName, batch);
          }
        }
      }));
    };
  }, [spotifyPlaylists, selectedPlaylists]);
  
  return { onImportClick, importingPlaylists, importingTracks };
}