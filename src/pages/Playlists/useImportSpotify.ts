import { useCallback } from "react";
import type { Playlist } from "./Playlists";
import { spotifyApi } from "../../api-helpers/spotify";
import { tidalApi } from "../../api-helpers/tidal";

export const useImportSpotify = (spotifyPlaylists: Playlist[], selectedPlaylists: Playlist[]) => {
  const getTracksForSpotifyPlaylists = useCallback(async () => {
    const selectedSpotifyPlaylists = spotifyPlaylists.filter(p => selectedPlaylists.some(sp => sp.id === p.id));

    const playlistTracksRes = await Promise.all(selectedSpotifyPlaylists.map(p => spotifyApi.playlists.getPlaylistItems(p.id)));
    // For some reason the response doesn't include the playlist name, so we're using the index
    const playlistTracks = playlistTracksRes.map(({items}, i) => ({name: selectedSpotifyPlaylists[i].name, items: items.map(({track}) => ({title: track.name, artists: track.artists.map(a => a.name)}))}));
    return playlistTracks;
  }, [spotifyPlaylists, selectedPlaylists]);
  
  const createTidalPlaylist = useCallback(async (name: string) => {
    const newPlaylist = await tidalApi.POST('/playlists', {body: {data: {attributes: {name}, type: "playlists"}}});
    if (!newPlaylist.data?.data.id) {
      console.error('Failed to create playlist on Tidal');
      return;
    }
    return newPlaylist.data.data.id;
  }, []);

  const searchTidalForTrack = useCallback(async (title: string, artists: string[]) => {
    const query = `${title} ${artists.join(', ')}`;
    const searchResults = await tidalApi.GET('/searchResults/{id}/relationships/tracks', {
      params: {path: {id: query}}
    });
    if (searchResults.response.status === 429) {
      console.warn('Rate limited by Tidal API when searching for track:', query);
      return null;
    }
    if (searchResults.response.status !== 200) {
      console.error('Error searching for track on Tidal:', query, searchResults);
      return null;
    }
    const track = searchResults.data?.data?.[0];
    if (!track?.id) {
      console.warn('No search results for track on Tidal:', query);
      return null;
    }
    return track;
  }, []);
  
  const addTracksToTidalPlaylist = useCallback(async (playlistId: string, trackIds: string[]) => {
    const response = await tidalApi.POST(`/playlists/{id}/relationships/items`, {
      params: {path: {id: playlistId}},
      body: {
        // TODO: try to remove typecast?
        data: trackIds.map(id => ({id, type: 'tracks' as 'tracks'}))
      }
    });
    if (response.response.status === 429) {
      console.warn('Rate limited by Tidal API when adding tracks to playlist:', playlistId);
      return;
    }
    if (response.response.status !== 201) {
      console.error('Error adding tracks to playlist on Tidal:', playlistId, response);
      return;
    }
    return true;
  }, []);
  
  const onImportClick = useCallback(async () => {
    const playlistTracks = await getTracksForSpotifyPlaylists();

    console.log('Playlists to import from Spotify:', playlistTracks);
    
    await Promise.all(playlistTracks.map(async ({name: playlistName, items}) => {
      const playlistId = await createTidalPlaylist(playlistName);

      if (!playlistId) return;

      const rawTracks = await Promise.all(items.map(async item => searchTidalForTrack(item.title, item.artists)));
      const tracks = rawTracks.filter(x => !!x);

      console.log('Found the following tracks on Tidal for playlist:', playlistName, tracks);

      return addTracksToTidalPlaylist(playlistId, tracks.map(t => t.id));
    }));
  }, [getTracksForSpotifyPlaylists, createTidalPlaylist, searchTidalForTrack, addTracksToTidalPlaylist]);
  
  return { onImportClick };
}