import { tidalApi } from "../tidal";

export class TidalImporter {
  constructor() {}

    createPlaylist = async (name: string) => {
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
  
  
  searchForTrack = async (title: string, artists: string[]) => {
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

  addToPlaylist = async (playlistId: string, trackIds: string[]) => {
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
}