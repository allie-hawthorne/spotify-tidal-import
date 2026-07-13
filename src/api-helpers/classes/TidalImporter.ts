import { mapTidalAlbumsToUniversalAlbums, mapTidalTracksToUniversalTracks } from "../../pages/EasyImport/mappers";
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
  
    const res = await tidalApi.GET('/searchResults/{id}/relationships/tracks', {
      params: {path: {id: encodedQuery}, query: {include: ['tracks']}},
    });
    if (res.response.status === 429) {
      console.warn('Rate limited by Tidal API when searching for track:', query);
      return 429;
    }
    if (res.response.status !== 200) {
      console.error('Error searching for track on Tidal:', query, res);
      return;
    }

    return mapTidalTracksToUniversalTracks(res);
  };

  searchForArtist = async (artistStr: string) => {
    const encodedQuery = artistStr.replace(/[!'()*]/g,(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,);

    const res = await tidalApi.GET('/searchResults/{id}/relationships/artists', {
      params: {path: {id: encodedQuery}, query: {include: ['artists']}}
    });

    if (res.response.status === 429) return 429;
    
    if (res.error) {
      console.error('ERROR:', res.error)
      return;
    }
    
    return res.data.data?.map(d => res.data.included?.find(a => a.id === d.id))
  }

  searchForAlbum = async (albumStr: string, artistStr: string) => {
    const encodedQuery = `${artistStr} ${albumStr}`.replace(/[!'()*]/g,(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,);

    const res = await tidalApi.GET('/searchResults/{id}', {
      params: {path: {id: encodedQuery}, query: {include: ['albums', 'albums.artists']}}
    });

    if (res.response.status === 429) return 429;
    
    if (res.error) {
      console.error('ERROR:', res.error)
      return;
    }
    
    return mapTidalAlbumsToUniversalAlbums(res);
  }

  addArtist = async (id: string) => {
    const response = await tidalApi.POST(`/userCollectionArtists/{id}/relationships/items`, {params: {path: {id: 'me'}}, body: {data: [{id, type: 'artists'}]}});
    if (response.response.status === 429) {
      console.warn('Rate limited by Tidal API when adding artist:', id);
      return 429;
    }
    if (!response.response.ok) {
      console.error('Error adding artist on Tidal:', id, response);
      return false;
    }
    return true;
  }

  addAlbum = async (id: string) => {
    const response = await tidalApi.POST(`/userCollectionAlbums/{id}/relationships/items`, {params: {path: {id: 'me'}}, body: {data: [{id, type: 'albums'}]}});
    if (response.response.status === 429) {
      console.warn('Rate limited by Tidal API when adding album:', id);
      return 429;
    }
    if (!response.response.ok) {
      console.error('Error adding album on Tidal:', id, response);
      return false;
    }
    return true;
  }

  addTrack = async (id: string) => {
    const response = await tidalApi.POST(`/userCollectionTracks/{id}/relationships/items`, {params: {path: {id: 'me'}}, body: {data: [{id, type: 'tracks'}]}});
    if (response.response.status === 429) {
      console.warn('Rate limited by Tidal API when adding track:', id);
      return 429;
    }
    if (!response.response.ok) {
      console.error('Error adding track on Tidal:', id, response);
      return false;
    }
    return true;
  }

  addToPlaylist = async (playlistId: string, trackIds: string[]) => {
    const response = await tidalApi.POST(`/playlists/{id}/relationships/items`, {
      params: {path: {id: playlistId}},
      body: {
        data: trackIds.map(id => ({id, type: 'tracks' as const}))
      }
    });
    if (response.response.status === 429) {
      console.warn('Rate limited by Tidal API when adding tracks to playlist:', playlistId);
      return 429;
    }
    if (!response.response.ok) {
      console.error('Error adding tracks to playlist on Tidal:', playlistId, response);
      return false;
    }
    return true;
  };
}

// Allie: before i forget it might be cool to try to make use of others' code/software. 
// https://github.com/spotify2tidal/spotify_to_tidal
// https://www.tunemymusic.com - "ISRC/title/artist, de-duping, order preservation, edge-case handling"
// https://freeyourmusic.com
// https://musicapi.com
// MusicBrainz