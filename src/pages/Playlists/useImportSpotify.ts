import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { chunk } from "lodash";
import type { Playlist, PlaylistForImport } from "../../types";
import { ImportStatus } from "../../types";
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

export const useImportSpotify = (spotifyPlaylists: Playlist[], selectedPlaylists: Playlist[], setShowImportStatus: Dispatch<SetStateAction<boolean>>) => {
  const [allPlaylists, setAllPlaylists] = useState<PlaylistForImport[]>([]);

  const onImportClick = useCallback(async () => {
    const spotify = new SpotifyImporter();
    const tidal = new TidalImporter();

    setShowImportStatus(true);
    
    const playlistTracks = await spotify.getTracksFromPlaylists(spotifyPlaylists, selectedPlaylists);
    setAllPlaylists(playlistTracks);

    // console.log('Playlists to import from Spotify:', playlistTracks);
    
    const playlistChunks = chunk(playlistTracks, PLAYLISTS_CHUNK_SIZE);
    for (const [, playlistChunk] of playlistChunks.entries()) {
      setAllPlaylists(prev => {
        const newPrev = [...prev];
        playlistChunk.forEach(({id}) => {
          const playlistIndex = newPrev.findIndex(p => p.id === id);
          if (playlistIndex === -1) return;
          newPrev[playlistIndex] = {...newPrev[playlistIndex], status: ImportStatus.InProgress}
        });
        return newPrev;
      });
      // console.log(`Importing chunk ${index + 1}/${playlistChunks.length}`, playlistChunk);

      await Promise.all(playlistChunk.map(async ({id: spotifyPlaylistId, name: playlistName, items}) => {
        const tidalPlaylistId = await performRateLimitedRequest(() => tidal.createPlaylist(playlistName));

        if (!tidalPlaylistId) return;

        const tidalTracksToAdd: string[] = [];
        for (const {title, artists} of items) {
          setAllPlaylists(prev => {
            const newPrev = [...prev];
            const thisPlaylistIndex = newPrev.findIndex(p => p.items.some(i => i.title === title && i.artists.join(', ') === artists.join(', ')));
            if (thisPlaylistIndex === -1) return newPrev;

            const thisPlaylist = newPrev[thisPlaylistIndex];

            const thisTrackIndex = thisPlaylist.items.findIndex(i => i.title === title && i.artists.join(', ') === artists.join(', '));            
            if (thisTrackIndex === -1) return newPrev;
            
            const thisTrack = thisPlaylist.items[thisTrackIndex];
            
            newPrev[thisPlaylistIndex].items[thisTrackIndex] = {
              ...thisTrack,
              status: ImportStatus.InProgress,
            };
            return newPrev;
          });
          
          const tidalTrack = await performRateLimitedRequest(() => tidal.searchForTrack(title, artists));

          if (!tidalTrack) continue;
          tidalTracksToAdd.push(tidalTrack.id);

          // console.log('Found track on Tidal:', title, artists, tidalTrack);
        }

        const batches = chunk(tidalTracksToAdd, MAX_TRACKS_PER_BATCH);
        for (const [batchIndex, batch] of batches.entries()) {
          const success = await performRateLimitedRequest(() => tidal.addToPlaylist(tidalPlaylistId, batch));
          if (success) {
            console.log(`Added batch ${batchIndex + 1}/${batches.length} of tracks to Tidal playlist:`, playlistName, batch);
          } else {
            console.error(`Failed to add batch ${batchIndex + 1}/${batches.length} of tracks to Tidal playlist:`, playlistName, batch);
          }
        }

        setAllPlaylists(prev => {
          const newPrev = [...prev];

          const playlistIndex = newPrev.findIndex(p => p.id === spotifyPlaylistId);
          console.log('newPrev:', newPrev, 'playlistIndex:', playlistIndex, 'playlistId:', tidalPlaylistId);
          if (playlistIndex === -1) return newPrev;

          newPrev[playlistIndex] = {
            ...newPrev[playlistIndex],
            status: ImportStatus.Completed,
            items: newPrev[playlistIndex].items.map(i => ({...i, status: ImportStatus.Completed}))
          };
          return newPrev;
        });

      }));
    };
    setShowImportStatus(false);
  }, [spotifyPlaylists, selectedPlaylists, setShowImportStatus]);
  
  return { onImportClick, allPlaylists };
};