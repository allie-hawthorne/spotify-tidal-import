import { useCallback, useState } from "react";
import { chunk } from "lodash";
import type { Playlist } from "./Playlists";
import { spotifyApi } from "../../api-helpers/spotify";
import { tidalApi } from "../../api-helpers/tidal";

const PLAYLISTS_CHUNK_SIZE = 2;
const MAX_TRACKS_PER_BATCH = 20; // Tidal API allows adding max 20 tracks at a time

const createTidalPlaylist = async (name: string) => {
  const newPlaylist = await tidalApi.POST('/playlists', {body: {data: {attributes: {name}, type: "playlists"}}});
  if (newPlaylist.response.status === 429) {
    console.warn('Rate limited by Tidal API when creating playlist:', name);
    return 429;
  }
  if (newPlaylist.response.status !== 201) {
    console.error('Error creating playlist on Tidal:', name, newPlaylist);
    return;
  }
  if (!newPlaylist.data?.data.id) {
    console.error('No playlist ID returned from Tidal API when creating playlist:', name, newPlaylist);
    return;
  }
  return newPlaylist.data.data.id;
};

const searchTidalForTrack = async (title: string, artists: string[]) => {
  const query = `${title} ${artists.join(', ')}`;
  // TODO: Is this better than just removing the character?
  const encodedQuery = query.replace(/[!'()*]/g,(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,);

  const searchResults = await tidalApi.GET('/searchResults/{id}/relationships/tracks', {
    params: {path: {id: encodedQuery}}
  });
  if (searchResults.response.status === 429) {
    console.warn('Rate limited by Tidal API when searching for track:', query);
    return 429;
  }
  if (searchResults.response.status !== 200) {
    console.error('Error searching for track on Tidal:', query, searchResults);
    return;
  }
  const track = searchResults.data?.data?.[0];
  if (!track?.id) {
    console.warn('No search results for track on Tidal:', query);
    return;
  }
  return track;
};

const addTracksToTidalPlaylist = async (playlistId: string, trackIds: string[]) => {
  const response = await tidalApi.POST(`/playlists/{id}/relationships/items`, {
    params: {path: {id: playlistId}},
    body: {
      // TODO: try to remove typecast?
      data: trackIds.map(id => ({id, type: 'tracks' as 'tracks'}))
    }
  });
  if (response.response.status === 429) {
    console.warn('Rate limited by Tidal API when adding tracks to playlist:', playlistId);
    return 429;
  }
  if (response.response.status !== 201) {
    console.error('Error adding tracks to playlist on Tidal:', playlistId, response);
    return false;
  }
  return true;
};

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
  
  const getTracksForSpotifyPlaylists = useCallback(async () => {
    const selectedSpotifyPlaylists = spotifyPlaylists.filter(p => selectedPlaylists.some(sp => sp.id === p.id));

    const playlistTracksRes = await Promise.all(selectedSpotifyPlaylists.map(p => spotifyApi.playlists.getPlaylistItems(p.id)));
    // For some reason the response doesn't include the playlist name, so we're using the index
    const playlistTracks = playlistTracksRes.map(({items}, i) => ({name: selectedSpotifyPlaylists[i].name, items: items.map(({track}) => ({title: track.name, artists: track.artists.map(a => a.name)}))}));
    return playlistTracks;
  }, [spotifyPlaylists, selectedPlaylists]);

  const onImportClick = useCallback(async () => {
    const playlistTracks = await getTracksForSpotifyPlaylists();

    console.log('Playlists to import from Spotify:', playlistTracks);
    
    const playlistChunks = chunk(playlistTracks, PLAYLISTS_CHUNK_SIZE);
    for (const [index, playlistChunk] of playlistChunks.entries()) {
      setImportingPlaylists(playlistChunk.map(p => p.name));
      console.log(`Importing chunk ${index + 1}/${playlistChunks.length}`, playlistChunk);

      await Promise.all(playlistChunk.map(async ({name: playlistName, items}, playlistIndex) => {
        const playlistId = await performRateLimitedRequest(() => createTidalPlaylist(playlistName));

        if (!playlistId) return;

        const tidalTracksToAdd: string[] = [];
        for (const {title, artists} of items) {
          setImportingTracks(prev => {
            const newPrev = [...prev];
            newPrev[playlistIndex] = `${title} by ${artists.join(', ')}`;
            return newPrev;
          });
          const tidalTrack = await performRateLimitedRequest(() => searchTidalForTrack(title, artists));

          if (!tidalTrack) continue;
          tidalTracksToAdd.push(tidalTrack.id);

          console.log('Found track on Tidal:', title, artists, tidalTrack);
        }

        const batches = chunk(tidalTracksToAdd, MAX_TRACKS_PER_BATCH);
        for (const [batchIndex, batch] of batches.entries()) {
          const success = await performRateLimitedRequest(() => addTracksToTidalPlaylist(playlistId, batch));
          if (success) {
            console.log(`Added batch ${batchIndex + 1}/${batches.length} of tracks to Tidal playlist:`, playlistName, batch);
          } else {
            console.error(`Failed to add batch ${batchIndex + 1}/${batches.length} of tracks to Tidal playlist:`, playlistName, batch);
          }
        }
      }));
    };
  }, [getTracksForSpotifyPlaylists, importingPlaylists, importingTracks]);
  
  return { onImportClick, importingPlaylists, importingTracks };
}